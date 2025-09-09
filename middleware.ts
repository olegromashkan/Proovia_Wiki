import { NextResponse } from "next/server";

const PROTECT_PATHS = [
  /^\/admin(\/.*)?$/,
  /^\/api\/(articles|quick-articles|quick-links|uploads)(\/.*)?$/,
];

export function middleware(req: Request) {
  const url = new URL(req.url);
  const pathname = url.pathname;
  const shouldProtect = PROTECT_PATHS.some((re) => re.test(pathname));
  if (!shouldProtect) return NextResponse.next();
  // Do not enforce auth in dev to simplify LAN access
  if (process.env.NODE_ENV !== 'production') return NextResponse.next();
  const user = process.env.ADMIN_USER;
  const pass = process.env.ADMIN_PASS;
  if (!user || !pass) return NextResponse.next();
  const auth = req.headers.get("authorization") || "";
  if (!auth.startsWith("Basic ")) return unauthorized();
  const decoded = Buffer.from(auth.slice(6), "base64").toString();
  const [u, p] = decoded.split(":");
  if (u === user && p === pass) return NextResponse.next();
  return unauthorized();
}

function unauthorized() {
  return new NextResponse("Unauthorized", { status: 401, headers: { "WWW-Authenticate": 'Basic realm="Admin"' } });
}

export const config = { matcher: ["/admin/:path*", "/api/:path*"] };
