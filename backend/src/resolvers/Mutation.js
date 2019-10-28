const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const Mutation = {
  async createItem(parent, args, ctx, info) {
    // TODO: check if the user is logged in
    const item = await ctx.db.mutation.createItem({
      data: {
        ...args
      }
    }, info);

    return item;
  },
  updateItem(parent, args, ctx, info) {
    const updates = {...args};
    delete updates.id;
    return ctx.db.mutation.updateItem({
      data: updates,
      where: {
        id: args.id
      }
    }, info);
  },
  async deleteItem(parent, args, ctx, info) {
    const where = {id: args.id}
    // 1. find the item
    const item = await ctx.db.query.item({where}, `{id title}`);
    // 2. check if the user own that item, or have th permission to delete it
    // TODO
    // 3. delete it
    return ctx.db.mutation.deleteItem({ where }, info);
  },
  async signup(parent, args, ctx, info) {
    args.email = args.email.toLowerCase();
    const password = await bcrypt.hash(args.password, 10);
    const user = await ctx.db.mutation.createUser({
      data: {
        ...args,
        password,
        permissions: { set: ['USER'] }
      }
    }, info);
    // create the JWT Token
    const token = jwt.sign({ userId: user.id }, process.env.APP_SECRET);
    // set the jwt as a cookie on the response
    ctx.response.cookie('token', token, {
      httpOnly: true,
      maxAge: 1000 * 60 * 60 * 24 * 365, // 1 year cookie
    })
    return user;
  },
  async signin (parent, { email, password }, ctx, info) {
    const user = await ctx.db.query.user({ where: { email } });
    if(!user) {
      throw new Error(`No such user found for email ${email}`);
    }

    const valid = await bcrypt.compare(password, user.password);
    if(!valid) {
      throw new Error('Invalid Password!');
    }

    const token = jwt.sign({ userId: user.id }, process.env.APP_SECRET);
    ctx.response.cookie('token', token, {
      httpOnly: true,
      maxAge: 1000 * 60 * 60 * 24 * 365, // 1 year cookie
    });
    return user;
  },
  signout(parent, args, ctx, info) {
    ctx.response.clearCookie('token');
    return { message: 'Goodbye!'};
  }
};

module.exports = Mutation;
