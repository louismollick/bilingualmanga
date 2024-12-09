import { env } from "@/env";

async function syncWithAnkiWeb() {
  const res = await fetch(env.ANKI_CONNECT_URL, {
    method: "POST",
    body: JSON.stringify({
      action: "sync",
      version: 6,
    }),
  });

  if (!res.ok) {
    const reason = await res.text();
    const message = `HTTP error syncing with AnkiWeb: ${reason}`;
    console.error(message);
    throw new Error(message);
  }

  console.log("Successfully synced with AnkiWeb");
}

export default syncWithAnkiWeb;
