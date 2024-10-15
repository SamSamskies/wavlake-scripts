import { Relay } from "nostr-tools/relay";
import { npubEncode, neventEncode } from "nostr-tools/nip19";
import { SimplePool } from "nostr-tools/pool";
import { Event } from "nostr-tools/pure";
import { associateBy } from "@std/collections/associate-by";

const relayUri = "wss://relay.wavlake.com";

const getTag = (event: Event, tag: string) =>
  event.tags.find((t) => t[0] === tag);

const getZappedEvents = async (zappedEventIds: string[]) => {
  const pool = new SimplePool();
  const relays = [relayUri];
  const events = await pool.querySync(relays, { ids: zappedEventIds });

  pool.close(relays);

  return associateBy(events, ({ id }: { id: string }) => id);
};

const getEventAuthorNpub = (event: Event) => npubEncode(event.pubkey);

const extractAmountInSats = (event: Event) =>
  Number(getTag(event, "amount")?.[1]) / 1000;

const extractTrackId = (event: Event) => {
  return getTag(event, "a")?.[1].split(":")[2];
};

const getZapEvent = (event: Event) => {
  try {
    return JSON.parse(getTag(event, "description")?.[1] ?? "");
  } catch (err) {
    console.error(err);
    console.log(event);
    return null;
  }
};

const normalizeATagEvents = (zapReceiptEvents: Event[]) => {
  return zapReceiptEvents.map((event) => {
    const zapEvent = getZapEvent(event);
    const zapperNpub = getEventAuthorNpub(zapEvent);
    const zapAmount = extractAmountInSats(zapEvent);
    const comment = zapEvent.content;
    const trackId = extractTrackId(zapEvent);

    return {
      zapperNpub,
      zapAmount,
      comment,
      trackId,
      zapReceiptId: neventEncode({ id: event.id, relays: [relayUri] }),
    };
  });
};

const normalizeETagEvents = async (zapReceiptEvents: Event[]) => {
  const getEventId = (event: Event) => getTag(event, "e")?.[1] ?? "";
  const zappedEvents = await getZappedEvents(
    zapReceiptEvents.map(getZapEvent).map(getEventId),
  );

  return zapReceiptEvents.map((event) => {
    const zapEvent = getZapEvent(event);
    const zapperNpub = getEventAuthorNpub(zapEvent);
    const zapAmount = extractAmountInSats(zapEvent);
    const comment = zapEvent.content;
    const trackId = extractTrackId(zappedEvents[getEventId(zapEvent)]);

    return {
      zapperNpub,
      zapAmount,
      comment,
      trackId,
      zapReceiptId: neventEncode({ id: event.id, relays: [relayUri] }),
    };
  });
};

const start = async () => {
  const relay = await Relay.connect(relayUri);
  const numberOfEvents = 10;
  const aTagZapReceiptEvents: Event[] = [];
  const eTagZapReceiptEvents: Event[] = [];

  return relay.subscribe(
    [
      {
        kinds: [9735],
        since: Math.floor(Date.now() / 1000) - 24 * 60 * 60, // last 24 hours
        "#p": [
          "7759fb24cec56fc57550754ca8f6d2c60183da2537c8f38108fdf283b20a0e58",
          "7759fed821f62af2b1279d6bdbca0bb87d70bf0015a4957611ee35b46b5fadba",
        ],
      },
    ],
    {
      onevent(event) {
        if (getTag(event, "a")) {
          aTagZapReceiptEvents.push(event);
        } else if (getTag(event, "e")) {
          eTagZapReceiptEvents.push(event);
        }
      },
      oneose() {
        normalizeETagEvents(eTagZapReceiptEvents)
          .then((eTagResults) => {
            const results = [
              ...eTagResults,
              ...normalizeATagEvents(aTagZapReceiptEvents),
            ];

            results.sort((a, b) => a.zapAmount - b.zapAmount);

            results
              .slice(-numberOfEvents)
              .forEach(
                ({ zapperNpub, zapAmount, comment, trackId, zapReceiptId }) => {
                  const normalizedComment =
                    comment.length === 0 ? comment : `"${comment}"\n\n`;
                  const trackLink = `https://wavlake.com/track/${trackId}`;

                  console.log(zapReceiptId);
                  console.log(
                    `nostr:${zapperNpub} zapped ⚡️${zapAmount.toLocaleString()} sats\n\n${normalizedComment}${trackLink}\n\n\n\n`,
                  );
                },
              );
          })
          .then(() => {
            Deno.exit(0);
          });
      },
    },
  );
};

start().catch(console.error);
