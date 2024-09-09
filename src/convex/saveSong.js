import { mutation } from "./_generated/server.js";
import { v } from 'convex/values';

export default mutation({
  args: { song: v.any(), userId: v.string() },
  handler: async (ctx, args) => {
    const existingSong = await ctx.db.query("songs")
      .filter((q) => q.eq("mp3", args.song.mp3))  // Find the song by mp3
      .first();

    if (existingSong) {
      // Check if the song has already been saved by the user
      if (!existingSong.savedBy.includes(args.userId)) {
        await ctx.db.patch(existingSong._id, {
          savedBy: [...existingSong.savedBy, args.userId],
        });
      }
    } else {
      await ctx.db.insert("songs", {
        ...args.song,
        savedBy: [args.userId],
      });
    }
  }
});
