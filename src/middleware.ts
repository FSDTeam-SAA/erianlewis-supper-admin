// import { NextResponse } from "next/server";
// import type { NextRequest } from "next/server";

// export function middleware(request: NextRequest) {
//   const token = request.cookies.get("next-auth.session-token-dashboard")?.value;

//   const publicPaths = ["/login", "/api/auth"];
//   const path = request.nextUrl.pathname;

//   if (!token && !publicPaths.some((p) => path.startsWith(p))) {
//     return NextResponse.redirect(new URL("/signin", request.url));
//   }

//   return NextResponse.next();
// }

// export const config = {
//   matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"],
// };