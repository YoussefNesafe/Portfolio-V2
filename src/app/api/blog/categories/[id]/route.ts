import { createUpdateAndDeleteHandlers } from "../../helpers/crud-route-factory";
import { updateCategorySchema } from "@/app/lib/schemas";

export const { PUT, DELETE } = createUpdateAndDeleteHandlers({
  model: "category",
  entityName: "Category",
  updateSchema: updateCategorySchema,
  buildUpdateData: (parsed, slug) => ({
    name: parsed.name || undefined,
    slug: slug || undefined,
    description: parsed.description !== undefined ? parsed.description : undefined,
  }),
});
