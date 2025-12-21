import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { getToken } from "next-auth/jwt";

export async function middleware(request: NextRequest) {
  const token = await getToken({
    req: request,
    secret: process.env.NEXTAUTH_SECRET,
    cookieName: "next-auth.session-token-delivaryboy", // authOptions এর সাথে same
  });

  const path = request.nextUrl.pathname;

  // 🔓 public routes (এগুলোতে auth লাগবে না)
  const publicPaths = ["/signin", "/api/auth"];

  // ❌ login না থাকলে → /signin
  if (!token && !publicPaths.some((p) => path.startsWith(p))) {
    return NextResponse.redirect(new URL("/signin", request.url));
  }

  // ❌ deliveryboy ছাড়া কেউ না
  if (token && token.role !== "deliveryboy") {
    return NextResponse.redirect(new URL("/signin", request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"],
};
