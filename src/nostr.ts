import { EventTemplate, finalizeEvent } from "nostr-tools/pure";
import { decrypt } from "nostr-tools/nip49";
import { decode } from "nostr-tools/nip19";
import { promptSecret } from "@std/cli";

export const getSecretKey = () => {
  const ncryptsec = Deno.env.get("NOSTR_NCRYPTSEC");

  if (ncryptsec) {
    if (!ncryptsec) {
      throw new Error("Missing required ncryptsec.");
    }

    const password = promptSecret(
      "Please enter password to decrypt ncryptsec:",
    );

    if (!password) {
      throw new Error("You must enter the password to decrypt your ncryptsec.");
    }

    return decrypt(ncryptsec, password);
  }

  const nsec = Deno.env.get("NOSTR_NSEC");

  if (!nsec) {
    throw new Error("Missing required nsec");
  }

  return decode(nsec).data as Uint8Array;
};

export const signEvent = (eventTemplate: EventTemplate) => {
  const sk = getSecretKey();

  return finalizeEvent(eventTemplate, sk);
};
