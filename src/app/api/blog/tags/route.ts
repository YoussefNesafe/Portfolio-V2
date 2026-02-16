import { createListAndCreateHandlers } from "../helpers/crud-route-factory";
import { createTagSchema } from "@/app/lib/schemas";

export const { GET, POST } = createListAndCreateHandlers({
  model: "tag",
  entityName: "Tag",
  createSchema: createTagSchema,
  buildCreateData: (parsed, slug) => ({
    name: parsed.name,
    slug,
  }),
});
