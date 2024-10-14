import { fetchTop40 } from "./wavlake.ts";
import { getCurrentDateUtc } from "./utils.ts";

interface Track {
  id: string;
  artist: string;
  title: string;
}

const top40Tracks = await fetchTop40();
const title = `Top 40 - ${getCurrentDateUtc()}`;

console.log(`${title}\n`);

// print title and top 10 tracks
top40Tracks.forEach(({ artist, title }: Track, i: number) => {
  console.log(`${i + 1}. ${title} - ${artist}`);
});
