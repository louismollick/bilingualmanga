import { env } from "@/env";

async function canAddWordsToAnki(texts: string[]) {
  const res = await fetch(env.ANKI_CONNECT_URL, {
    method: "POST",
    body: JSON.stringify({
      action: "canAddNotes",
      params: {
        notes: texts.map((text) => ({
          fields: {
            Front: text,
          },
          tags: ["louismollick"],
          deckName: "Expression Mining",
          modelName: "Basic",
          options: {
            allowDuplicate: false,
            duplicateScope: "collection",
            duplicateScopeOptions: {
              deckName: null,
              checkChildren: false,
              checkAllModels: false,
            },
          },
        })),
      },
      version: 6,
    }),
  });

  if (!res.ok) {
    const reason = await res.text();
    const message = `HTTP error checking if can add notes to Anki: ${reason}`;
    console.error(message);
    throw new Error(message);
  }

  const json = (await res.json()) as { result: boolean[] };

  return json.result;
}

export default canAddWordsToAnki;
