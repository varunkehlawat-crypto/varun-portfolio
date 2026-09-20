import { NextResponse } from 'next/server';
import { isAdminAuthenticated } from '@/backend/lib/auth';
import { STATIC_PORTFOLIO } from '@/backend/data/static-portfolio';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

async function getSupabaseClient(serviceRole = false) {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  if (!url || url.length < 5) return null;
  const { createClient } = await import('@supabase/supabase-js');
  const key = serviceRole
    ? process.env.SUPABASE_SERVICE_ROLE_KEY!
    : process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
  return createClient(url, key);
}

export async function GET() {
  try {
    const db = await getSupabaseClient();
    if (db) {
      const [{ data: hero }, { data: projects }, { data: skills }] = await Promise.all([
        db.from('hero').select('*').single(),
        db.from('projects').select('*').order('created_at'),
        db.from('skills').select('*').order('sort_order'),
      ]);
      if (hero) return NextResponse.json({ hero, projects: projects ?? [], skills: skills ?? [] });
    }
  } catch { /* fall through */ }
  return NextResponse.json(STATIC_PORTFOLIO);
}

export async function POST(request: Request) {
  if (!isAdminAuthenticated())
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const db = await getSupabaseClient(true);
  if (!db)
    return NextResponse.json({ error: 'Supabase not configured' }, { status: 503 });

  try {
    const body = await request.json();
    if (body.hero)          await db.from('hero').upsert({ id: 1, ...body.hero });
    if (body.project?.id)   await db.from('projects').upsert(body.project);
    else if (body.project)  await db.from('projects').insert(body.project);
    if (body.deleteProject) await db.from('projects').delete().eq('id', body.deleteProject);
    if (body.skill)         await db.from('skills').upsert(body.skill);
    if (body.deleteSkill)   await db.from('skills').delete().eq('id', body.deleteSkill);
    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json({ error: 'Database error' }, { status: 500 });
  }
}
