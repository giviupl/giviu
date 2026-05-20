import { NextRequest, NextResponse } from 'next/server';

export function middleware(request: NextRequest) {
  const isLoginPage = request.nextUrl.pathname === '/admin/login';
  const session = request.cookies.get('admin-session');

  // Zalogowany próbuje wejść na /admin/login → redirect na /admin
  if (isLoginPage && session) {
    return NextResponse.redirect(new URL('/admin', request.url));
  }

  // Niezalogowany próbuje wejść na /admin/* (poza login) → redirect na login
  if (!isLoginPage && !session) {
    return NextResponse.redirect(new URL('/admin/login', request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: '/admin/:path*',
};
