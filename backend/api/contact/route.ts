import { NextResponse } from 'next/server';
import { isAdminAuthenticated } from '@/backend/lib/auth';

export interface ClientMessage {
  id: string; name: string; email: string;
  message: string; read: boolean; created_at: string;
}

// In-memory fallback (persists for the server process lifetime)
let fallbackMessages: ClientMessage[] = [
  { id: 'msg-1', name: 'Sarah Connor', email: 'sarah@techfuture.io', read: false,
    created_at: new Date(Date.now() - 7200000).toISOString(),
    message: 'Hi Varun! We love your Abroadly project. Are you available for freelance full-stack work next month?' },
  { id: 'msg-2', name: 'Alex Rivera', email: 'arivera@logistics-global.com', read: true,
    created_at: new Date(Date.now() - 86400000).toISOString(),
    message: 'Hey, saw the Shri Balaji Logistics site. Would like to consult on an AI data model integration for our dashboard.' },
];

async function getDB() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  if (!url || url.length < 5) return null;
  const { createClient } = await import('@supabase/supabase-js');
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
  return createClient(url, key);
}

export async function GET() {
  if (!isAdminAuthenticated())
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  try {
    const db = await getDB();
    if (db) {
      const { data, error } = await db.from('messages').select('*').order('created_at', { ascending: false });
      if (!error && data) return NextResponse.json({ messages: data });
    }
  } catch { /* fall through */ }
  const sorted = [...fallbackMessages].sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
  return NextResponse.json({ messages: sorted });
}

export async function POST(request: Request) {
  try {
    const { name, email, message } = await request.json();
    if (!name?.trim() || !email?.trim() || !message?.trim())
      return NextResponse.json({ error: 'All fields are required' }, { status: 400 });

    const msg: ClientMessage = {
      id: `msg_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`,
      name: name.trim(), email: email.trim(), message: message.trim(),
      read: false, created_at: new Date().toISOString(),
    };

    let savedToSupabase = false;
    try {
      const db = await getDB();
      if (db) { const { error } = await db.from('messages').insert([msg]); if (!error) savedToSupabase = true; }
    } catch { /* ignore */ }

    fallbackMessages.unshift(msg);
    return NextResponse.json({ success: true, message: msg, savedToSupabase });
  } catch {
    return NextResponse.json({ error: 'Failed to send message' }, { status: 500 });
  }
}

export async function PATCH(request: Request) {
  if (!isAdminAuthenticated())
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  try {
    const { id, read } = await request.json();
    if (!id) return NextResponse.json({ error: 'Message ID required' }, { status: 400 });
    fallbackMessages = fallbackMessages.map(m => m.id === id ? { ...m, read: Boolean(read) } : m);
    try { const db = await getDB(); if (db) await db.from('messages').update({ read: Boolean(read) }).eq('id', id); } catch { /* ignore */ }
    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json({ error: 'Failed to update' }, { status: 500 });
  }
}

export async function DELETE(request: Request) {
  if (!isAdminAuthenticated())
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id') || (await request.json().catch(() => ({}))).id;
    if (!id) return NextResponse.json({ error: 'Message ID required' }, { status: 400 });
    fallbackMessages = fallbackMessages.filter(m => m.id !== id);
    try { const db = await getDB(); if (db) await db.from('messages').delete().eq('id', id); } catch { /* ignore */ }
    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json({ error: 'Failed to delete' }, { status: 500 });
  }
}
