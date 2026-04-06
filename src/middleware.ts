// import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
// import { getToken } from "next-auth/jwt";

export async function middleware(request: NextRequest) {
//   const token = await getToken({
//     req: request,
//     secret: process.env.NEXTAUTH_SECRET,
//   });

// //   console.log( token , "TOKEN");

//   const { pathname } = request.nextUrl;
//   console.log('pathname', pathname)

//   if (!token && pathname !== "/signin") {
//     return NextResponse.redirect(new URL("/signin", request.url));
//   }

//   if (token && pathname === "/signin") {
//     return NextResponse.redirect(new URL("/", request.url));
//   }

//   return NextResponse.next();
}

export const config = {
  // matcher: ["/((?!api|_next|favicon.ico).*)"],
};