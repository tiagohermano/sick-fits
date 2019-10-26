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
  }
};

module.exports = Mutation;
