import { query } from "./_generated/server.js";

export default query({
  handler: async (ctx, args) => {
    console.log('Received args in getSavedSongs:', args);

    // Fetch all songs from the database
    const allSongs = await ctx.db.query("songs").collect();
    console.log('All songs in the database:', allSongs);

    // Filter songs where 'savedBy' array contains the userId
    const savedSongs = allSongs.filter(song => song.savedBy.includes(args.userId));

    console.log('Fetched saved songs for userId:', args.userId, savedSongs);
    return savedSongs;
  }
});


/*import { query } from "./_generated/server.js";

export default query({
  handler: async (ctx, args) => {
    console.log('Received args in getSavedSongs:', args);

    // Log all the songs in the database to check what's being saved
    const allSongs = await ctx.db.query("songs").collect();
    console.log('All songs in the database:', allSongs);

    // Filter the songs where 'savedBy' contains the 'userId'
    const savedSongs = await ctx.db.query("songs")
      .filter((q) => q.eq("savedBy", args.userId))  // Match userId in 'savedBy' array
      .collect();

    console.log('Fetched saved songs for userId:', args.userId, savedSongs);
    return savedSongs;
  }
});
*/