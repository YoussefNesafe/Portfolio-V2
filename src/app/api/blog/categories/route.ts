import { createListAndCreateHandlers } from "../helpers/crud-route-factory";
import { createCategorySchema } from "@/app/lib/schemas";

export const { GET, POST } = createListAndCreateHandlers({
  model: "category",
  entityName: "Category",
  createSchema: createCategorySchema,
  buildCreateData: (parsed, slug) => ({
    name: parsed.name,
    slug,
    description: parsed.description || null,
  }),
});
