// Static fallback data — used when Supabase is not configured or unreachable.
// Edit this file to update the default content shown on the site.

export type Hero = {
  name: string; title: string; bio: string;
  email: string; linkedin: string; instagram: string;
};
export type Project = {
  id: string; title: string; desc: string; url: string;
  tags: string[]; featured: boolean; color: string;
};
export type Skill = { name: string; icon: string; color: string };

export const STATIC_HERO: Hero = {
  name: 'Varun Kehlawat',
  title: 'Full Stack Developer & BCA AI + DS Student',
  bio: 'Furious about crazy tech and AI models. I build full-stack web apps, experiment with AI, and turn ideas into reality with code.',
  email: 'varunkehlawat@gmail.com',
  linkedin: 'https://www.linkedin.com/in/varun-kehlawat-662a81379/',
  instagram: 'https://www.instagram.com/varunkehlawatt',
};

export const STATIC_PROJECTS: Project[] = [
  {
    id: '1', title: 'Abroadly', featured: true, color: '#7c3aed',
    desc: 'A full-stack platform for students aspiring to study abroad — with guidance, resources, and community support.',
    url: 'https://abroadly-sepia.vercel.app/',
    tags: ['Next.js', 'TypeScript', 'Full Stack'],
  },
  {
    id: '2', title: 'Shri Balaji Logistics', featured: true, color: '#06b6d4',
    desc: 'Complete full-stack website for a local logistics business — modern design, service showcase, and contact system.',
    url: 'https://www.shribalajilogisticsandservices.com/',
    tags: ['Full Stack', 'Business', 'Web Design'],
  },
];

export const STATIC_SKILLS: Skill[] = [
  { name: 'React',        icon: '⚛️', color: '#61dafb' },
  { name: 'Next.js',      icon: '▲',  color: '#ffffff' },
  { name: 'TypeScript',   icon: '📘', color: '#3178c6' },
  { name: 'Node.js',      icon: '🟢', color: '#5fa04e' },
  { name: 'PostgreSQL',   icon: '🐘', color: '#4169e1' },
  { name: 'Tailwind CSS', icon: '🎨', color: '#38bdf8' },
  { name: 'Three.js',     icon: '⬡',  color: '#7c3aed' },
  { name: 'Python',       icon: '🐍', color: '#f7c948' },
  { name: 'AI / ML',      icon: '🤖', color: '#ec4899' },
  { name: 'Supabase',     icon: '⚡', color: '#3ecf8e' },
];

export const STATIC_PORTFOLIO = {
  hero: STATIC_HERO,
  projects: STATIC_PROJECTS,
  skills: STATIC_SKILLS,
};
