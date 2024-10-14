import "@std/dotenv/load";
import { createPlaylist, fetchTop40, updatePlaylist } from "./wavlake.ts";
import { getCurrentDateUtc } from "./utils.ts";

interface Track {
  id: string;
  artist: string;
  title: string;
}

const top40Tracks = await fetchTop40();

// create playlist with title Top 10 - YYYY-MM-DD
const title = `Top 40 - ${getCurrentDateUtc()}`;

// print title and top 10 tracks
top40Tracks.forEach(({ artist, title }: Track, i: number) => {
  console.log(`${i + 1}. ${title} - ${artist}`);
});

const createPlaylistRes = await createPlaylist(title);
const playlistId = createPlaylistRes.data.id;
const trackList = top40Tracks.map(({ id }: Track) => id);

// print URL for playlist on Wavlake Playlist Party
console.log(
  `\nhttps://wavlakeplaylistparty.vercel.app/playlists/${playlistId}`,
);

// add tracks to playlist
console.log(await updatePlaylist(playlistId, trackList));
