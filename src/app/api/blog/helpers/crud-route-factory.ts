import { NextRequest, NextResponse } from "next/server";
import { ZodSchema } from "zod";
import { db } from "@/app/lib/db";
import { slugify } from "@/app/utils/slugify";
import {
  requireAuth,
  requireJson,
  isPrismaUniqueError,
} from "@/app/lib/api-utils";

type ModelName = "category" | "tag";

// Prisma doesn't support generic model access, so we use a dynamic accessor.
// eslint-disable-next-line @typescript-eslint/no-explicit-any
function getModel(model: ModelName): any {
  return db[model];
}

// ---------------------------------------------------------------------------
// List + Create
// ---------------------------------------------------------------------------

interface ListCreateConfig {
  model: ModelName;
  entityName: string;
  createSchema: ZodSchema;
  buildCreateData: (parsed: Record<string, unknown>, slug: string) => Record<string, unknown>;
}

export function createListAndCreateHandlers(config: ListCreateConfig) {
  const { model, entityName, createSchema, buildCreateData } = config;
  const prismaModel = getModel(model);
  const routeLabel = `/api/blog/${model}s`;

  async function GET(_request: NextRequest) {
    try {
      const items = await prismaModel.findMany({
        where: { posts: { some: { published: true } } },
        include: {
          _count: {
            select: { posts: { where: { published: true } } },
          },
        },
        orderBy: { name: "asc" },
      });

      const itemsWithCount = items.map(
        ({ _count, ...rest }: { _count: { posts: number }; [key: string]: unknown }) => ({
          ...rest,
          postCount: _count.posts,
        }),
      );

      return NextResponse.json(itemsWithCount, { status: 200 });
    } catch (error) {
      console.error(`[GET ${routeLabel}]`, error);
      return NextResponse.json(
        { error: `Failed to fetch ${model}s` },
        { status: 500 },
      );
    }
  }

  async function POST(request: NextRequest) {
    try {
      const session = await requireAuth(request);
      if (!session) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
      }

      const jsonError = requireJson(request);
      if (jsonError) return jsonError;

      const body = await request.json();
      const parsed = createSchema.safeParse(body);
      if (!parsed.success) {
        return NextResponse.json(
          { error: "Validation failed", details: parsed.error.flatten().fieldErrors },
          { status: 400 },
        );
      }

      const { name, slug: customSlug } = parsed.data as { name: string; slug?: string };

      const existingName = await prismaModel.findUnique({ where: { name } });
      if (existingName) {
        return NextResponse.json(
          { error: `${entityName} with this name already exists` },
          { status: 400 },
        );
      }

      const slug = customSlug || slugify(name);

      const existingSlug = await prismaModel.findUnique({ where: { slug } });
      if (existingSlug) {
        return NextResponse.json(
          { error: `A ${model} with this slug already exists` },
          { status: 400 },
        );
      }

      const created = await prismaModel.create({
        data: buildCreateData(parsed.data as Record<string, unknown>, slug),
      });

      return NextResponse.json(created, { status: 201 });
    } catch (error) {
      if (isPrismaUniqueError(error)) {
        return NextResponse.json({ error: "Name already exists" }, { status: 400 });
      }
      console.error(`[POST ${routeLabel}]`, error);
      return NextResponse.json(
        { error: `Failed to create ${model}` },
        { status: 500 },
      );
    }
  }

  return { GET, POST };
}

// ---------------------------------------------------------------------------
// Update + Delete
// ---------------------------------------------------------------------------

interface UpdateDeleteConfig {
  model: ModelName;
  entityName: string;
  updateSchema: ZodSchema;
  buildUpdateData: (parsed: Record<string, unknown>, slug: string | undefined) => Record<string, unknown>;
}

export function createUpdateAndDeleteHandlers(config: UpdateDeleteConfig) {
  const { model, entityName, updateSchema, buildUpdateData } = config;
  const prismaModel = getModel(model);
  const routeLabel = `/api/blog/${model}s/[id]`;

  async function PUT(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> },
  ) {
    try {
      const session = await requireAuth(request);
      if (!session) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
      }

      const jsonError = requireJson(request);
      if (jsonError) return jsonError;

      const { id } = await params;
      const body = await request.json();
      const parsed = updateSchema.safeParse(body);
      if (!parsed.success) {
        return NextResponse.json(
          { error: "Validation failed", details: parsed.error.flatten().fieldErrors },
          { status: 400 },
        );
      }

      const { name, slug: customSlug } = parsed.data as { name?: string; slug?: string };

      const existing = await prismaModel.findUnique({ where: { id } });
      if (!existing) {
        return NextResponse.json(
          { error: `${entityName} not found` },
          { status: 404 },
        );
      }

      if (name && name !== existing.name) {
        const duplicate = await prismaModel.findUnique({ where: { name } });
        if (duplicate) {
          return NextResponse.json(
            { error: `${entityName} with this name already exists` },
            { status: 400 },
          );
        }
      }

      const slug = customSlug || (name ? slugify(name) : undefined);

      if (slug && slug !== existing.slug) {
        const slugConflict = await prismaModel.findUnique({ where: { slug } });
        if (slugConflict) {
          return NextResponse.json(
            { error: `A ${model} with this slug already exists` },
            { status: 400 },
          );
        }
      }

      const updated = await prismaModel.update({
        where: { id },
        data: buildUpdateData(parsed.data as Record<string, unknown>, slug),
      });

      return NextResponse.json(updated, { status: 200 });
    } catch (error) {
      if (isPrismaUniqueError(error)) {
        return NextResponse.json({ error: "Name already exists" }, { status: 400 });
      }
      console.error(`[PUT ${routeLabel}]`, error);
      return NextResponse.json(
        { error: `Failed to update ${model}` },
        { status: 500 },
      );
    }
  }

  async function DELETE(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> },
  ) {
    try {
      const session = await requireAuth(request);
      if (!session) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
      }

      const { id } = await params;

      const existing = await prismaModel.findUnique({ where: { id } });
      if (!existing) {
        return NextResponse.json(
          { error: `${entityName} not found` },
          { status: 404 },
        );
      }

      await prismaModel.delete({ where: { id } });

      return NextResponse.json(
        { message: `${entityName} deleted successfully` },
        { status: 200 },
      );
    } catch (error) {
      console.error(`[DELETE ${routeLabel}]`, error);
      return NextResponse.json(
        { error: `Failed to delete ${model}` },
        { status: 500 },
      );
    }
  }

  return { PUT, DELETE };
}
