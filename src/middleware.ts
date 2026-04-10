import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { getToken } from "next-auth/jwt";

export async function middleware(request: NextRequest) {
  const token = await getToken({
    req: request,
    secret: process.env.NEXTAUTH_SECRET,
    cookieName: "next-auth.session-token-delivaryboy",
  });

  const { pathname } = request.nextUrl;
  const isSigninPage = pathname === "/signin";

  if (!token && !isSigninPage) {
    return NextResponse.redirect(new URL("/signin", request.url));
  }

  if (token && isSigninPage) {
    return NextResponse.redirect(new URL("/", request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico).*)"],
};
