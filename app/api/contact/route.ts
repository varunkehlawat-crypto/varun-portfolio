import { NextResponse } from 'next/server';
import jwt from 'jsonwebtoken';
import { cookies } from 'next/headers';

export interface ClientMessage {
  id: string;
  name: string;
  email: string;
  message: string;
  read: boolean;
  created_at: string;
}

// Fallback in-memory messages storage
let fallbackMessages: ClientMessage[] = [
  {
    id: 'msg-1',
    name: 'Sarah Connor',
    email: 'sarah@techfuture.io',
    message: 'Hi Varun! We love your Abroadly project. Are you available for freelance full-stack work next month?',
    read: false,
    created_at: new Date(Date.now() - 3600000 * 2).toISOString(),
  },
  {
    id: 'msg-2',
    name: 'Alex Rivera',
    email: 'arivera@logistics-global.com',
    message: 'Hey, saw the Shri Balaji Logistics site. Would like to consult on an AI data model integration for our dashboard.',
    read: true,
    created_at: new Date(Date.now() - 3600000 * 24).toISOString(),
  },
];

function isAdminAuthenticated(): boolean {
  const cookieStore = cookies();
  const token = cookieStore.get('admin_token')?.value;
  if (!token) return false;
  try {
    jwt.verify(token, process.env.JWT_SECRET!);
    return true;
  } catch {
    return false;
  }
}

// GET /api/contact — Fetch all client messages (Admin only)
export async function GET() {
  if (!isAdminAuthenticated()) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  if (supabaseUrl && supabaseUrl.length > 5) {
    try {
      const { createClient } = await import('@supabase/supabase-js');
      const supabase = createClient(supabaseUrl, process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!);
      const { data: messages, error } = await supabase
        .from('messages')
        .select('*')
        .order('created_at', { ascending: false });

      if (!error && messages) {
        return NextResponse.json({ messages });
      }
    } catch {
      // Fall through to fallback storage
    }
  }

  // Sort newest first
  const sorted = [...fallbackMessages].sort(
    (a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
  );
  return NextResponse.json({ messages: sorted });
}

// POST /api/contact — Submit a client message (Public)
export async function POST(request: Request) {
  try {
    const { name, email, message } = await request.json();

    if (!name?.trim() || !email?.trim() || !message?.trim()) {
      return NextResponse.json({ error: 'All fields are required' }, { status: 400 });
    }

    const newMessage: ClientMessage = {
      id: 'msg_' + Date.now() + '_' + Math.random().toString(36).substring(2, 7),
      name: name.trim(),
      email: email.trim(),
      message: message.trim(),
      read: false,
      created_at: new Date().toISOString(),
    };

    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    let savedToSupabase = false;

    if (supabaseUrl && supabaseUrl.length > 5) {
      try {
        const { createClient } = await import('@supabase/supabase-js');
        const supabase = createClient(supabaseUrl, process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!);
        const { error } = await supabase.from('messages').insert([newMessage]);
        if (!error) savedToSupabase = true;
      } catch {
        // Fall back to memory store
      }
    }

    // Always keep in fallback storage as backup
    fallbackMessages.unshift(newMessage);

    return NextResponse.json({ success: true, message: newMessage, savedToSupabase });
  } catch {
    return NextResponse.json({ error: 'Failed to send message' }, { status: 500 });
  }
}

// PATCH /api/contact — Mark message as read/unread (Admin only)
export async function PATCH(request: Request) {
  if (!isAdminAuthenticated()) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const { id, read } = await request.json();

    if (!id) {
      return NextResponse.json({ error: 'Message ID is required' }, { status: 400 });
    }

    // Update in fallback store
    fallbackMessages = fallbackMessages.map(m => (m.id === id ? { ...m, read: Boolean(read) } : m));

    // Update in Supabase if configured
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    if (supabaseUrl && supabaseUrl.length > 5) {
      try {
        const { createClient } = await import('@supabase/supabase-js');
        const supabase = createClient(supabaseUrl, process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!);
        await supabase.from('messages').update({ read: Boolean(read) }).eq('id', id);
      } catch {
        // Ignore fallback error
      }
    }

    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json({ error: 'Failed to update message status' }, { status: 500 });
  }
}

// DELETE /api/contact — Delete a message (Admin only)
export async function DELETE(request: Request) {
  if (!isAdminAuthenticated()) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const { searchParams } = new URL(request.url);
    let id = searchParams.get('id');

    if (!id) {
      const body = await request.json().catch(() => ({}));
      id = body.id;
    }

    if (!id) {
      return NextResponse.json({ error: 'Message ID is required' }, { status: 400 });
    }

    // Delete from fallback store
    fallbackMessages = fallbackMessages.filter(m => m.id !== id);

    // Delete from Supabase if configured
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    if (supabaseUrl && supabaseUrl.length > 5) {
      try {
        const { createClient } = await import('@supabase/supabase-js');
        const supabase = createClient(supabaseUrl, process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!);
        await supabase.from('messages').delete().eq('id', id);
      } catch {
        // Ignore fallback error
      }
    }

    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json({ error: 'Failed to delete message' }, { status: 500 });
  }
}
