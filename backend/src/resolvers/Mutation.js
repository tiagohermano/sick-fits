const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const { randomBytes } = require("crypto");
const { promisify } = require("util");
const { transport, makeANiceEmail } = require('../mail');
const { isUserLoggedin, hasPermission } = require('../utils');

const Mutation = {
  async createItem(parent, args, ctx, info) {
    // TODO: check if the user is logged in
    if(!ctx.request.userId) {
      throw new Error('You must be logged in to do that!');
    }

    const item = await ctx.db.mutation.createItem(
      {
        data: {
          // This is how is created a relationship between the Item and the User
          user: {
            connect: {
              id: ctx.request.userId
            }
          },
          ...args
        }
      },
      info
    );

    return item;
  },
  updateItem(parent, args, ctx, info) {
    const updates = { ...args };
    delete updates.id;
    return ctx.db.mutation.updateItem(
      {
        data: updates,
        where: {
          id: args.id
        }
      },
      info
    );
  },
  async deleteItem(parent, args, ctx, info) {
    const where = { id: args.id };
    // 1. find the item
    const item = await ctx.db.query.item({ where }, `{id title user { id }}`);
    // 2. check if the user own that item, or have th permission to delete it
    const ownsItem = item.user.id === ctx.request.userId;
    const hasPermission = ctx.request.user.permissions.some(permission => ['ADMIN', 'ITEMDELETE'].includes(permission));

    if(!ownsItem && !hasPermission) {
      throw new Error("You don't have permission to do that");
    }

    // TODO
    // 3. delete it
    return ctx.db.mutation.deleteItem({ where }, info);
  },
  async signup(parent, args, ctx, info) {
    args.email = args.email.toLowerCase();
    const password = await bcrypt.hash(args.password, 10);
    const user = await ctx.db.mutation.createUser(
      {
        data: {
          ...args,
          password,
          permissions: { set: ["USER"] }
        }
      },
      info
    );
    // create the JWT Token
    const token = jwt.sign({ userId: user.id }, process.env.APP_SECRET);
    // set the jwt as a cookie on the response
    ctx.response.cookie("token", token, {
      httpOnly: true,
      maxAge: 1000 * 60 * 60 * 24  * 365 // 1 year cookie
    });
    return user;
  },
  async signin(parent, { email, password }, ctx, info) {
    const user = await ctx.db.query.user({ where: { email } });
    if (!user) {
      throw new Error(`No such user found for email ${email}`);
    }

    const valid = await bcrypt.compare(password, user.password);
    if (!valid) {
      throw new Error("Invalid Password!");
    }

    const token = jwt.sign({ userId: user.id }, process.env.APP_SECRET);
    ctx.response.cookie("token", token, {
      httpOnly: true,
      maxAge: 1000 * 60 * 60 * 24  * 365 // 1 year cookie
    });
    return user;
  },
  signout(parent, args, ctx, info) {
    ctx.response.clearCookie("token");
    return { message: "Goodbye!" };
  },
  async requestReset(parent, args, ctx, info) {
    const { email } = args;
    const user = await ctx.db.query.user({ where: { email } });
    if (!user) {
      throw new Error(`No such user found for email ${email}`);
    }
    const randomBytesPromisified = promisify(randomBytes);
    const resetToken = (await randomBytesPromisified(20)).toString("hex");
    const resetTokenExpiry = Date.now() + 3600000;
    const res = await ctx.db.mutation.updateUser({
      where: { email },
      data: {
        resetToken,
        resetTokenExpiry
      }
    });

    const mailRes = await transport.sendMail({
      from: 'noreply@sickfits.com',
      to: user.email,
      suject: 'Your Password Reset Token',
      html: makeANiceEmail(`Your Password Reset Token is here! \n\n 
      <a href="${process.env.FRONTEND_URL}/reset?resetToken=${resetToken}">Click here to reset your password</a>`)
    })

    return { message: "Success!" };
  },
  async resetPassword(parent, args, ctx, info) {
    const { newPassword, confirmPassword, resetToken } = args;
    // Check if passwords match
    if (newPassword !== confirmPassword) {
      throw new Error("Passwords doesn't match");
    }
    // Check if resetToken is valid
    const [fetchedUser] = await ctx.db.query.users({ 
      where: { 
        resetToken,
        resetTokenExpiry_gte: Date.now() - 3600000 
      } 
    });

    if(!fetchedUser) {
      throw new Error('This token is either invalid or expired');
    }

    if (!(await ctx.db.query.users({ where: { resetToken } }))) {
      throw new Error("Invalid Reset Token");
    }
    // Hash new password and replace old one
    const hashedNewPassword = await bcrypt.hash(newPassword, 10);
    const user = await ctx.db.mutation.updateUser({
      where: { email: fetchedUser.email },
      data: {
        password: hashedNewPassword,
        resetToken: null,
        resetTokenExpiry: null
      }
    });
    // Generate new jwt token and set into cookie
    const token = jwt.sign({ userId: user.id }, process.env.APP_SECRET);
    ctx.response.cookie("token", token, {
      httpOnly: true,
      maxAge: 1000 * 60 * 60 * 24  * 365 // 1 year cookie
    });

    return user;
  },
  async updatePermissions(parent, args, ctx, info) {
    // 1. Check if they are logged in
    isUserLoggedin(ctx);
    // 2. Query the current user
    const currentUser = await ctx.db.query.user({ where: { id: ctx.request.userId } }, info);
    // 3. Check if they have permissions to do this
    hasPermission(currentUser, ['ADMIN', 'PERMISSIONUPDATE']);
    // 4. Update the permissions
    return ctx.db.mutation.updateUser({
      where: { id: args.userId },
      data: {
        permissions: {
          set: args.permissions
        }
      }
    }, info);
  },
  async addToCart(parent, args, ctx, info) {
    // 1. Make sure they are signed in
    isUserLoggedin(ctx);
    // 2. Query the users current cart
    const { userId } = ctx.request;
    const [existingCartItem] = await ctx.db.query.cartItems({ 
      where: { 
        user: { id: userId },
        item: { id: args.id }
      }
    });
    // 3. Check if the item is already in their cart
    if(existingCartItem) {
      return ctx.db.mutation.updateCartItem({ 
        where: {
          id: existingCartItem.id,
        },
        data: { quantity: existingCartItem.quantity+1 }
      }, info)
    }
    // 4. If its not, create a fresh CartItem for that user
    return ctx.db.mutation.createCartItem({
      data: {
        user: { 
          connect: { id: userId }
        },
        item: {
          connect: { id: args.id }
        }
      }
    }, info)
  }
};

module.exports = Mutation;
