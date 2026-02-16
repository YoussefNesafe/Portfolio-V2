import { createUpdateAndDeleteHandlers } from "../../helpers/crud-route-factory";
import { updateTagSchema } from "@/app/lib/schemas";

export const { PUT, DELETE } = createUpdateAndDeleteHandlers({
  model: "tag",
  entityName: "Tag",
  updateSchema: updateTagSchema,
  buildUpdateData: (parsed, slug) => ({
    name: parsed.name || undefined,
    slug: slug || undefined,
  }),
});
