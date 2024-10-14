import { signEvent } from "./nostr.ts";
import { getToken } from "nostr-tools/nip98";

const catalogApiBaseUrl =
  "https://catalog-prod-dot-wavlake-alpha.uc.r.appspot.com/v1";

export const createPlaylist = async (title: string) => {
  const url = `${catalogApiBaseUrl}/playlists`;
  const payload = { title };
  const res = await fetch(url, {
    method: "POST",
    headers: {
      Authorization: await getToken(url, "post", signEvent, true, payload),
      "Content-Type": "application/json",
    },
    body: JSON.stringify(payload),
  });

  if (!res.ok) {
    throw new Error("Failed to create playlist");
  }

  return res.json();
};

export const updatePlaylist = async (playlistId: string, trackList: any[]) => {
  const url = `${catalogApiBaseUrl}/playlists/reorder`;
  const payload = { playlistId, trackList };
  const res = await fetch(url, {
    method: "POST",
    headers: {
      Authorization: await getToken(url, "post", signEvent, true, payload),
      "Content-Type": "application/json",
    },
    body: JSON.stringify(payload),
  });

  if (!res.ok) {
    throw new Error("Failed to update playlist");
  }

  return res.json();
};

export const fetchTop40 = async () => {
  const res = await fetch(
    `https://wavlake.com/api/v1/content/rankings?sort=sats&days=7&limit=40`,
  );
  return res.json();
};
