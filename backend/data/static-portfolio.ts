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
  { name: 'React',        icon: 'https://cdn.simpleicons.org/react/61DAFB',        color: '#61dafb' },
  { name: 'Next.js',      icon: 'https://cdn.simpleicons.org/nextdotjs/ffffff',     color: '#ffffff' },
  { name: 'TypeScript',   icon: 'https://cdn.simpleicons.org/typescript/3178C6',   color: '#3178c6' },
  { name: 'Node.js',      icon: 'https://cdn.simpleicons.org/nodedotjs/5FA04E',     color: '#5fa04e' },
  { name: 'PostgreSQL',   icon: 'https://cdn.simpleicons.org/postgresql/4169E1',   color: '#4169e1' },
  { name: 'Tailwind CSS', icon: 'https://cdn.simpleicons.org/tailwindcss/06B6D4',   color: '#38bdf8' },
  { name: 'Three.js',     icon: 'https://cdn.simpleicons.org/threedotjs/ffffff',   color: '#ffffff' },
  { name: 'Python',       icon: 'https://cdn.simpleicons.org/python/3776AB',       color: '#f7c948' },
  { name: 'Supabase',     icon: 'https://cdn.simpleicons.org/supabase/3ECF8E',     color: '#3ecf8e' },
  { name: 'Git',          icon: 'https://cdn.simpleicons.org/git/F05032',          color: '#f05032' },
  { name: 'Prisma',       icon: 'https://cdn.simpleicons.org/prisma/ffffff',       color: '#a78bfa' },
  { name: 'Java',         icon: 'https://cdn.jsdelivr.net/gh/devicons/devicon@latest/icons/java/java-original.svg', color: '#e76f51' },
  { name: 'AI / ML',      icon: 'https://cdn.simpleicons.org/tensorflow/FF6F00',   color: '#ec4899' },
];

export const STATIC_PORTFOLIO = {
  hero: STATIC_HERO,
  projects: STATIC_PROJECTS,
  skills: STATIC_SKILLS,
};
