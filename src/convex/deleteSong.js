import { mutation } from "./_generated/server.js";

export default mutation({
  handler: async (ctx, args) => {
    await ctx.db.delete(args.songId);
  }
});
