const { forwardTo } = require('prisma-binding');
const { isUserLoggedin, hasPermission } = require('../utils');

const Query = {
  items: forwardTo('db'),
  item: forwardTo('db'),
  itemsConnection: forwardTo('db'),
  me(parent, args, ctx, info) {
    if(!ctx.request.userId) {
      return null;
    }
    return ctx.db.query.user({
      where: { id: ctx.request.userId },
    }, info);
  },
  async users(parent, args, ctx, info) {
    isUserLoggedin(ctx);
    hasPermission(ctx.request.user, ['ADMIN', 'PERMISSIONUPDATE']);

    return ctx.db.query.users({}, info);
  },
  async order(parent, args, ctx, info) {
    // 1. Make sure they are logged in
    isUserLoggedin(ctx);
    // 2. Query the current order
    const { id } = args;
    const currentOrder = await ctx.db.query.order({
      where: {
        id
      }
    }, info);
    // 3. Check if the user have permissions to see this order
    const ownsOrder = currentOrder.userId !== ctx.request.userId;
    const hasPermissionToSeeOrder = ctx.request.user.permissions.includes('ADMIN');
    if(!ownsOrder || !hasPermissionToSeeOrder) throw Error('You do not have permission to see this Order.');
    // 4. Return the order
    return currentOrder;
  }
};

module.exports = Query;
