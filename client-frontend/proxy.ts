import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

const ACCESS = process.env.COOKIE_ACCESS_TOKEN ?? "odnowa_access_token";
const REFRESH = process.env.COOKIE_REFRESH_TOKEN ?? "odnowa_refresh_token";

export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const hasSession =
    Boolean(request.cookies.get(ACCESS)?.value) ||
    Boolean(request.cookies.get(REFRESH)?.value);

  if (pathname.startsWith("/dashboard") && !hasSession) {
    const loginUrl = new URL("/login", request.url);
    loginUrl.searchParams.set("next", pathname);
    return NextResponse.redirect(loginUrl);
  }

  if (
    hasSession &&
    (pathname === "/login" ||
      pathname === "/register" ||
      pathname === "/confirm")
  ) {
    return NextResponse.redirect(new URL("/dashboard", request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/dashboard/:path*", "/login", "/register", "/confirm"],
};
