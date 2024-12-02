import { env } from "@/env";

async function addWordToAnki(Front: string, Back: string) {
  const res = await fetch(env.ANKI_CONNECT_URL, {
    method: "POST",
    body: JSON.stringify({
      action: "addNote",
      params: {
        note: {
          fields: {
            Front,
            Back,
          },
          tags: ["louismollick"],
          deckName: "Expression Mining",
          modelName: "Basic",
          options: {
            allowDuplicate: true,
            duplicateScope: "collection",
            duplicateScopeOptions: {
              deckName: null,
              checkChildren: false,
              checkAllModels: false,
            },
          },
        },
      },
      version: 6,
    }),
  });

  if (!res.ok) {
    const reason = await res.text();
    const message = `HTTP error adding word to Anki: ${reason}`;
    console.error(message);
    throw new Error(message);
  }

  console.log("Successfully added word to Anki:", Front);
}

export default addWordToAnki;
