import bcrypt from "bcryptjs";
import { NextRequest, NextResponse } from "next/server";
import { shouldUseSecureCookie } from "@/lib/cookies";
import { ensureUserAccountOwner, migrateLegacyAccountData } from "@/lib/account";
import { connectDb } from "@/lib/db";
import { getRequestKey, takeRateLimit } from "@/lib/rate-limit";
import { buildSessionUser, signJwt } from "@/lib/jwt";
import { normalizePhone } from "@/lib/utils";
import { User } from "@/models/User";

export async function POST(request: NextRequest) {
  try {
    await connectDb();
    const { phone, password, recoveryPassword } = await request.json();
    const cleanPhone = normalizePhone(String(phone || ""));
    const ipKey = getRequestKey(request.headers.get("x-forwarded-for") || "local-login");
    const rateKey = getRequestKey(`${ipKey}:${cleanPhone || "no-phone"}`);
    const limited = takeRateLimit(`login:${rateKey}`, 12, 10 * 60 * 1000);

    if (!limited.allowed) {
      return NextResponse.json(
        { message: "Wagerageje kwinjira inshuro nyinshi. Ongera nyuma gato." },
        { status: 429 }
      );
    }

    if (!cleanPhone || (!password && !recoveryPassword)) {
      return NextResponse.json(
        { message: "Andika telefoni n'ijambo ry'ibanga cyangwa iryo kugarura." },
        { status: 400 }
      );
    }

    const user = await User.findOne({ phone: cleanPhone });
    if (!user) {
      return NextResponse.json({ message: "Konti ntiboneka" }, { status: 404 });
    }

    if (!user.isActive) {
      return NextResponse.json(
        { message: "Konti yawe yahagaritswe. Vugana n'umuyobozi mukuru." },
        { status: 403 }
      );
    }

    const primaryMatch = password ? await bcrypt.compare(password, user.password) : false;
    const recoveryMatch = recoveryPassword
      ? user.recoveryPassword
        ? await bcrypt.compare(recoveryPassword, user.recoveryPassword)
        : false
      : false;

    if (!primaryMatch && !recoveryMatch) {
      return NextResponse.json(
        {
          message:
            recoveryPassword && !user.recoveryPassword
              ? "Uyu mukoresha nta jambo ryo kugarura arashyirirwaho."
              : "Ijambo ry'ibanga cyangwa iryo kugarura si ryo"
        },
        { status: 401 }
      );
    }

    const accountOwnerId = await ensureUserAccountOwner(user);
    if (!accountOwnerId) {
      return NextResponse.json(
        { message: "Konti yawe ntirategurwa neza. Vugana n'umuyobozi mukuru." },
        { status: 409 }
      );
    }

    await migrateLegacyAccountData(accountOwnerId);

    const token = signJwt(buildSessionUser(user, accountOwnerId));

    const response = NextResponse.json({
      message: "Winjiye neza",
      user: { id: user._id, names: user.names, role: user.role }
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
