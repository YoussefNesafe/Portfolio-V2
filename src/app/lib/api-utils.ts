import { NextRequest, NextResponse } from "next/server";
import { validateSession } from "./auth";
import { Prisma } from "@prisma/client";

export async function requireAuth(request: NextRequest) {
  const sessionToken = request.cookies.get("session")?.value;
  if (!sessionToken) return null;
  return validateSession(sessionToken);
}

export function requireJson(request: NextRequest): NextResponse | null {
  if (!request.headers.get("content-type")?.includes("application/json")) {
    return NextResponse.json(
      { error: "Content-Type must be application/json" },
      { status: 415 }
    );
  }
  return null;
}

export function isPrismaUniqueError(error: unknown): boolean {
  return (
    error instanceof Prisma.PrismaClientKnownRequestError &&
    error.code === "P2002"
  );
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type RouteContext = { params: Promise<any> };

type RouteHandler = (
  request: NextRequest,
  context?: RouteContext,
) => Promise<NextResponse>;

export function withAuth(handler: (
  request: NextRequest,
  session: Awaited<ReturnType<typeof requireAuth>>,
  context?: RouteContext,
) => Promise<NextResponse>): RouteHandler {
  return async (request, context) => {
    const session = await requireAuth(request);
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    return handler(request, session, context);
  };
}

export function errorResponse(message: string | Record<string, unknown>, status: number = 400) {
  const body = typeof message === "string" ? { error: message } : message;
  return NextResponse.json(body, { status });
}

export function successResponse(data: unknown, status: number = 200) {
  return NextResponse.json(data, { status });
}
