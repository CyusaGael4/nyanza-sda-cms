import bcrypt from "bcryptjs";
import { NextRequest, NextResponse } from "next/server";
import { shouldUseSecureCookie } from "@/lib/cookies";
import { connectDb } from "@/lib/db";
import { createPermissions } from "@/lib/permissions";
import { getRequestKey, takeRateLimit } from "@/lib/rate-limit";
import { buildSessionUser, signJwt } from "@/lib/jwt";
import { hasValidPasswordLength, normalizePhone } from "@/lib/utils";
import { User } from "@/models/User";

export async function POST(request: NextRequest) {
  try {
    await connectDb();
    const body = await request.json();
    const names = String(body.names || "").trim();
    const phone = normalizePhone(String(body.phone || ""));
    const password = String(body.password || "");
    const recoveryPassword = String(body.recoveryPassword || "");
    const ipKey = getRequestKey(request.headers.get("x-forwarded-for") || "local-register");
    const limited = takeRateLimit(`register:${ipKey}`, 5, 10 * 60 * 1000);

    if (!limited.allowed) {
      return NextResponse.json(
        { message: "Wagerageje inshuro nyinshi. Ongera nyuma y'iminota mike." },
        { status: 429 }
      );
    }

    if (!names || !phone || !password || !recoveryPassword) {
      return NextResponse.json(
        { message: "Uzuza amazina, telefoni, ijambo ry'ibanga n'iryo kugarura." },
        { status: 400 }
      );
    }

    if (!hasValidPasswordLength(password) || !hasValidPasswordLength(recoveryPassword)) {
      return NextResponse.json(
        { message: "Ijambo ry'ibanga n'iryo kugarura bigomba kuba nibura inyuguti 8." },
        { status: 400 }
      );
    }

    const existingUser = await User.findOne({ phone });
    if (existingUser) {
      return NextResponse.json({ message: "Iyo telefoni isanzwe ihari" }, { status: 409 });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const user = await User.create({
      names,
      phone,
      password: hashedPassword,
      recoveryPassword: await bcrypt.hash(recoveryPassword, 10),
      role: "super_admin",
      permissions: createPermissions("super_admin"),
      isActive: true
    });
    user.accountOwnerId = user._id;
    await user.save();

    const token = signJwt(buildSessionUser(user));

    const response = NextResponse.json({
      message: "Konti yakozwe neza",
      user: {
        id: user._id,
        names: user.names,
        phone: user.phone,
        role: user.role
      }
    });
    response.cookies.set("token", token, {
      httpOnly: true,
      sameSite: "strict",
      secure: shouldUseSecureCookie(request),
      path: "/",
      maxAge: 60 * 60 * 24 * 7
    });

    return response;
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Hari ikibazo cyabaye kuri server";
    return NextResponse.json({ message }, { status: 500 });
  }
}
