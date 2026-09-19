import { NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import { signAdminToken } from '@/backend/lib/auth';

export async function POST(request: Request) {
  try {
    const { password } = await request.json();
    const hash = process.env.ADMIN_PASSWORD_HASH;
    if (!hash || !process.env.JWT_SECRET)
      return NextResponse.json({ error: 'Server misconfiguration' }, { status: 500 });

    if (!(await bcrypt.compare(password, hash)))
      return NextResponse.json({ error: 'Invalid password' }, { status: 401 });

    const token = signAdminToken({ role: 'admin' });
    const response = NextResponse.json({ success: true });
    response.cookies.set('admin_token', token, {
      httpOnly: true, secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict', maxAge: 60 * 60 * 8, path: '/',
    });
    return response;
  } catch {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
