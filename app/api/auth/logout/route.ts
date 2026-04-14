import { NextRequest, NextResponse } from "next/server";
import { shouldUseSecureCookie } from "@/lib/cookies";

export async function POST(request: NextRequest) {
  const response = NextResponse.json({ message: "Wasohotse neza" });
  response.cookies.set("token", "", {
    httpOnly: true,
    sameSite: "strict",
    secure: shouldUseSecureCookie(request),
    path: "/",
    maxAge: 0
  });

  return response;
}
