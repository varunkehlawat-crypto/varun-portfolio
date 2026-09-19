import { NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

export async function POST(request: Request) {
  try {
    const { password } = await request.json();

    const hash = process.env.ADMIN_PASSWORD_HASH;
    const secret = process.env.JWT_SECRET;

    if (!hash || !secret) {
      return NextResponse.json({ error: 'Server misconfiguration' }, { status: 500 });
    }

    const valid = await bcrypt.compare(password, hash);
    if (!valid) {
      return NextResponse.json({ error: 'Invalid password' }, { status: 401 });
    }

    const token = jwt.sign({ role: 'admin' }, secret, { expiresIn: '8h' });

    const response = NextResponse.json({ success: true });
    response.cookies.set('admin_token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 60 * 60 * 8, // 8 hours
      path: '/',
    });

    return response;
  } catch {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
