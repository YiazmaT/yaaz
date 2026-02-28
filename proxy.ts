import {NextRequest, NextResponse} from "next/server";

const INTRANET_PUBLIC_PATHS = ["/login", "/reset-password", "/setup-password"];

export function proxy(request: NextRequest) {
  const {pathname} = request.nextUrl;

  // Protect yaaz pages (except the login page itself)
  if (pathname.startsWith("/yaaz") && !pathname.startsWith("/yaaz/login")) {
    const yaazToken = request.cookies.get("yaaz_token");
    if (!yaazToken) {
      return NextResponse.redirect(new URL("/yaaz/login", request.url));
    }
  }

  // Protect intranet pages
  const isIntranetPublic = INTRANET_PUBLIC_PATHS.some((p) => pathname.startsWith(p));
  const isStaticOrApi = pathname.startsWith("/api") || pathname.startsWith("/_next") || pathname.includes(".");
  const isYaaz = pathname.startsWith("/yaaz");

  if (!isYaaz && !isStaticOrApi && !isIntranetPublic) {
    const token = request.cookies.get("token");
    if (!token) {
      return NextResponse.redirect(new URL("/login", request.url));
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico|assets/).*)"],
};
