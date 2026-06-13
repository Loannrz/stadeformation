import { NextRequest, NextResponse } from 'next/server';
import { getAdminSessionToken } from '@/lib/admin-auth';

export function middleware(request: NextRequest) {
  const pathname = request.nextUrl.pathname;

  if (pathname.startsWith('/admin') && !pathname.startsWith('/admin/login')) {
    const sessionToken = getAdminSessionToken();
    const token = request.cookies.get('admin-token');

    if (!sessionToken || token?.value !== sessionToken) {
      return NextResponse.redirect(new URL('/admin/login', request.url));
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/admin/:path*'],
};
