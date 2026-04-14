import { NextRequest } from "next/server";

export function shouldUseSecureCookie(request: NextRequest) {
  const forwardedProto = request.headers.get("x-forwarded-proto");
  return request.nextUrl.protocol === "https:" || forwardedProto === "https";
}
