import "@std/dotenv/load";
import { createPlaylist, fetchTop40, updatePlaylist } from "./wavlake.ts";
import { getCurrentDateUtc } from "./utils.ts";

interface Track {
  id: string;
  artist: string;
  title: string;
}

const title = `Top 40 - ${getCurrentDateUtc()}`;
const createPlaylistRes = await createPlaylist(title);
const playlistId = createPlaylistRes.data.id;
const top40Tracks = await fetchTop40();
const trackList = top40Tracks.map(({ id }: Track) => id);

// print URL for playlist on Wavlake Playlist Party
console.log(
  `\nhttps://wavlakeplaylistparty.vercel.app/playlists/${playlistId}`,
);

// add tracks to playlist
console.log(await updatePlaylist(playlistId, trackList));
