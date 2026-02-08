import type { IDictionary } from "./app/models/IDictionary";

const dictionary = import("./dictionaries/en.json").then(
  (m) => m.default as unknown as IDictionary
);

export async function getDictionary(): Promise<IDictionary> {
  return dictionary;
}
