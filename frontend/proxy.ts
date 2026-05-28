import { NextRequest, NextResponse } from "next/server";

const authGroup = ["/login", "/sign-up", "/password-reset"];

export function proxy(request: NextRequest) {
    const { pathname } = request.nextUrl;
    const refreshToken = request.cookies.get("refreshToken");
    if (refreshToken !== undefined && authGroup.includes(pathname)) {
        return NextResponse.redirect(new URL("/profile", request.url));
    }
    if (refreshToken === undefined && (pathname.startsWith('/profile') || pathname.startsWith('/checkout'))) {
        return NextResponse.redirect(new URL("/login", request.url));
    }
    return NextResponse.next();
}

export const config = {
    matcher: ["/login", "/sign-up", "/password-reset", "/profile", "/checkout"],
}