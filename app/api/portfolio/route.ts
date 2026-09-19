import { NextResponse } from 'next/server';
import jwt from 'jsonwebtoken';
import { cookies } from 'next/headers';

// Static fallback data — used when Supabase is not yet configured
export const STATIC_PORTFOLIO = {
  hero: {
    name: 'Varun Kehlawat',
    title: 'Full Stack Developer & BCA AI + DS Student',
    bio: 'Furious about crazy tech and AI models. I build full-stack web apps, experiment with AI, and turn ideas into reality with code.',
    email: 'varunkehlawat@gmail.com',
    linkedin: 'https://www.linkedin.com/in/varun-kehlawat-662a81379/',
    instagram: 'https://www.instagram.com/varunkehlawatt',
  },
  projects: [
    {
      id: '1',
      title: 'Abroadly',
      desc: 'A full-stack platform for students aspiring to study abroad — with guidance, resources, and community support.',
      url: 'https://abroadly-sepia.vercel.app/',
      tags: ['Next.js', 'TypeScript', 'Full Stack'],
      featured: true,
      color: '#7c3aed',
    },
    {
      id: '2',
      title: 'Shri Balaji Logistics',
      desc: 'Complete full-stack website for a local logistics business — modern design, service showcase, and contact system.',
      url: 'https://www.shribalajilogisticsandservices.com/',
      tags: ['Full Stack', 'Business', 'Web Design'],
      featured: true,
      color: '#06b6d4',
    },
  ],
  skills: [
    { name: 'React', icon: '⚛️', color: '#61dafb' },
    { name: 'Next.js', icon: '▲', color: '#ffffff' },
    { name: 'TypeScript', icon: '📘', color: '#3178c6' },
    { name: 'Node.js', icon: '🟢', color: '#5fa04e' },
    { name: 'PostgreSQL', icon: '🐘', color: '#4169e1' },
    { name: 'Tailwind CSS', icon: '🎨', color: '#38bdf8' },
    { name: 'Three.js', icon: '⬡', color: '#7c3aed' },
    { name: 'Python', icon: '🐍', color: '#f7c948' },
    { name: 'AI / ML', icon: '🤖', color: '#ec4899' },
    { name: 'Supabase', icon: '⚡', color: '#3ecf8e' },
  ],
};

function isAdminAuthenticated(request: Request): boolean {
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

export async function GET() {
  // Try Supabase first
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  if (supabaseUrl && supabaseUrl.length > 5) {
    try {
      const { createClient } = await import('@supabase/supabase-js');
      const supabase = createClient(supabaseUrl, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!);

      const [{ data: hero }, { data: projects }, { data: skills }] = await Promise.all([
        supabase.from('hero').select('*').single(),
        supabase.from('projects').select('*').order('created_at'),
        supabase.from('skills').select('*').order('sort_order'),
      ]);

      if (hero) {
        return NextResponse.json({ hero, projects: projects ?? [], skills: skills ?? [] });
      }
    } catch {
      // fall through to static data
    }
  }

  return NextResponse.json(STATIC_PORTFOLIO);
}

export async function POST(request: Request) {
  if (!isAdminAuthenticated(request)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  if (!supabaseUrl || supabaseUrl.length < 5) {
    return NextResponse.json({ error: 'Supabase not configured' }, { status: 503 });
  }

  try {
    const body = await request.json();
    const { createClient } = await import('@supabase/supabase-js');
    const supabase = createClient(supabaseUrl, process.env.SUPABASE_SERVICE_ROLE_KEY!);

    if (body.hero) {
      await supabase.from('hero').upsert({ id: 1, ...body.hero });
    }
    if (body.project) {
      if (body.project.id) {
        await supabase.from('projects').upsert(body.project);
      } else {
        await supabase.from('projects').insert(body.project);
      }
    }
    if (body.deleteProject) {
      await supabase.from('projects').delete().eq('id', body.deleteProject);
    }
    if (body.skill) {
      await supabase.from('skills').upsert(body.skill);
    }
    if (body.deleteSkill) {
      await supabase.from('skills').delete().eq('id', body.deleteSkill);
    }

    return NextResponse.json({ success: true });
  } catch (err) {
    return NextResponse.json({ error: 'Database error' }, { status: 500 });
  }
}
