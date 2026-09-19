'use client';

import { useRef, useState, useEffect, Suspense, lazy } from 'react';
import {
  motion,
  useScroll,
  useTransform,
  useSpring,
  useMotionValue,
  animate,
} from 'motion/react';
import { TextEffect } from '@/frontend/components/ui/text-effect';
import { AnimatedGroup } from '@/frontend/components/ui/animated-group';
import { InView } from '@/frontend/components/ui/in-view';
import { TextLoop } from '@/frontend/components/ui/text-loop';
import QRCard from '@/frontend/components/QRCard';
import GitHubHeatmap from '@/frontend/components/GitHubHeatmap';
import { TypewriterRoles } from '@/frontend/components/ui/typewriter-roles';

const ThreeScene = lazy(() => import('@/frontend/components/canvas/ThreeScene'));

/* ─── Types ──────────────────────────────────────────────────── */
type Project = { id: string; title: string; desc: string; url: string; tags: string[]; featured: boolean; color: string };
type Skill = { id?: string; name: string; icon: string; color: string };
type Hero = { name: string; title: string; bio: string; email: string; linkedin: string; instagram: string };

/* ─── Floating orb ───────────────────────────────────────────── */
function FloatingOrb({ x, y, size, color, delay }: { x: string; y: string; size: number; color: string; delay: number }) {
  return (
    <motion.div
      className="absolute rounded-full pointer-events-none"
      style={{
        left: x, top: y,
        width: size, height: size,
        background: `radial-gradient(circle at 30% 30%, ${color}, transparent 70%)`,
        filter: 'blur(40px)', opacity: 0.35,
      }}
      animate={{ y: [0, -30, 0], x: [0, 15, 0], scale: [1, 1.08, 1] }}
      transition={{ duration: 8 + delay, repeat: Infinity, ease: 'easeInOut', delay }}
    />
  );
}

/* ─── 3D tilt card ───────────────────────────────────────────── */
function TiltCard({ children, className, intensity = 10 }: { children: React.ReactNode; className?: string; intensity?: number }) {
  const ref = useRef<HTMLDivElement>(null);
  const x = useMotionValue(0);
  const y = useMotionValue(0);
  const rotateX = useSpring(useTransform(y, [-0.5, 0.5], [intensity, -intensity]), { stiffness: 300, damping: 35 });
  const rotateY = useSpring(useTransform(x, [-0.5, 0.5], [-intensity, intensity]), { stiffness: 300, damping: 35 });
  const scale = useSpring(1, { stiffness: 300, damping: 30 });

  function handleMouse(e: React.MouseEvent) {
    const rect = ref.current!.getBoundingClientRect();
    x.set((e.clientX - rect.left) / rect.width - 0.5);
    y.set((e.clientY - rect.top) / rect.height - 0.5);
    scale.set(1.02);
  }
  function handleLeave() { x.set(0); y.set(0); scale.set(1); }

  return (
    <motion.div
      ref={ref}
      onMouseMove={handleMouse}
      onMouseLeave={handleLeave}
      style={{ rotateX, rotateY, scale, transformStyle: 'preserve-3d', perspective: 1200 }}
      className={className}
    >
      {children}
    </motion.div>
  );
}

/* ─── Depth parallax wrapper ─────────────────────────────────── */
function ParallaxSection({ children, depth = 0.15 }: { children: React.ReactNode; depth?: number }) {
  const ref = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ['start end', 'end start'] });
  const y = useTransform(scrollYProgress, [0, 1], [`${depth * 100}px`, `-${depth * 100}px`]);
  return <motion.div ref={ref} style={{ y }}>{children}</motion.div>;
}

/* ─── Animated counter ───────────────────────────────────────── */
function Counter({ to, suffix = '' }: { to: number; suffix?: string }) {
  const [count, setCount] = useState(0);
  const ref = useRef<HTMLSpanElement>(null);
  const seen = useRef(false);
  useEffect(() => {
    const observer = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting && !seen.current) {
        seen.current = true;
        const controls = animate(0, to, { duration: 2, ease: [0.16, 1, 0.3, 1], onUpdate: (v) => setCount(Math.round(v)) });
        return () => controls.stop();
      }
    }, { threshold: 0.5 });
    if (ref.current) observer.observe(ref.current);
    return () => observer.disconnect();
  }, [to]);
  return <span ref={ref}>{count.toLocaleString()}{suffix}</span>;
}

/* ─── Scramble text ──────────────────────────────────────────── */
function ScrambleText({ text }: { text: string }) {
  const [display, setDisplay] = useState(text);
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  function scramble() {
    let iter = 0;
    const interval = setInterval(() => {
      setDisplay(text.split('').map((char, i) => {
        if (char === ' ') return ' ';
        if (i < iter) return text[i];
        return chars[Math.floor(Math.random() * chars.length)];
      }).join(''));
      if (iter >= text.length) clearInterval(interval);
      iter += 0.5;
    }, 30);
  }
  return (
    <span onMouseEnter={scramble} className="cursor-default font-mono select-none">{display}</span>
  );
}

/* ─── Magnetic button ────────────────────────────────────────── */
function MagneticButton({ children, className, href, onClick, style }: { children: React.ReactNode; className?: string; href?: string; onClick?: () => void; style?: React.CSSProperties }) {
  const ref = useRef<HTMLButtonElement>(null);
  const x = useSpring(0, { stiffness: 200, damping: 20 });
  const y = useSpring(0, { stiffness: 200, damping: 20 });
  function handleMouse(e: React.MouseEvent) {
    if (!ref.current) return;
    const rect = ref.current.getBoundingClientRect();
    x.set((e.clientX - rect.left - rect.width / 2) * 0.3);
    y.set((e.clientY - rect.top - rect.height / 2) * 0.3);
  }
  function handleLeave() { x.set(0); y.set(0); }

  if (href) {
    return (
      <motion.a
        href={href}
        target="_blank"
        rel="noopener noreferrer"
        style={{ x, y, ...style }}
        onMouseMove={handleMouse as any}
        onMouseLeave={handleLeave}
        whileTap={{ scale: 0.95 }}
        className={className}
      >
        {children}
      </motion.a>
    );
  }

  return (
    <motion.button
      ref={ref}
      style={{ x, y, ...style }}
      onMouseMove={handleMouse}
      onMouseLeave={handleLeave}
      whileTap={{ scale: 0.95 }}
      className={className}
      onClick={onClick}
    >
      {children}
    </motion.button>
  );
}

/* ─── Tech Marquee ───────────────────────────────────────────── */
function SkillsMarquee({ skills }: { skills: Skill[] }) {
  const items = [...skills, ...skills];
  return (
    <div className="relative overflow-hidden py-4" style={{ maskImage: 'linear-gradient(90deg, transparent, black 10%, black 90%, transparent)' }}>
      <motion.div
        className="flex gap-6 whitespace-nowrap"
        animate={{ x: ['0%', '-50%'] }}
        transition={{ duration: 25, repeat: Infinity, ease: 'linear' }}
      >
        {items.map((s, i) => (
          <span key={i} className="text-sm font-medium px-4 py-2 rounded-full flex items-center gap-2"
            style={{ color: s.color || 'var(--text-secondary)', border: '1px solid var(--border)', background: 'var(--surface)' }}>
            <span>{s.icon}</span>
            <span style={{ color: 'var(--text-secondary)' }}>{s.name}</span>
          </span>
        ))}
      </motion.div>
    </div>
  );
}

/* ─── Project Card ───────────────────────────────────────────── */
function ProjectCard({ project }: { project: Project }) {
  return (
    <TiltCard intensity={12} className="h-full">
      <motion.a
        href={project.url}
        target="_blank"
        rel="noopener noreferrer"
        whileHover={{ borderColor: project.color }}
        className="h-full p-7 rounded-2xl flex flex-col gap-5 relative overflow-hidden group"
        style={{
          background: 'linear-gradient(135deg, rgba(10,10,26,0.9), rgba(5,5,15,0.95))',
          border: '1px solid rgba(255,255,255,0.07)',
          transformStyle: 'preserve-3d',
          textDecoration: 'none', display: 'flex',
        }}
      >
        {/* top accent line */}
        <div className="absolute top-0 left-6 right-6 h-px rounded-full"
          style={{ background: `linear-gradient(90deg, transparent, ${project.color}60, transparent)` }} />

        {/* Glow blob */}
        <div className="absolute -top-12 -right-12 w-40 h-40 rounded-full pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity duration-700"
          style={{ background: `radial-gradient(circle, ${project.color}20, transparent 70%)`, filter: 'blur(20px)' }} />

        {/* Color dot */}
        <div className="w-12 h-12 rounded-xl flex items-center justify-center text-2xl flex-shrink-0"
          style={{ background: `${project.color}15`, border: `1px solid ${project.color}40`, boxShadow: `0 0 25px ${project.color}40` }}>
          🚀
        </div>

        <div className="flex-1">
          <h3 className="text-xl font-black mb-2 tracking-tight" style={{ color: '#f1f0ff', transform: 'translateZ(6px)' }}>
            {project.title}
          </h3>
          <p className="text-sm leading-relaxed" style={{ color: 'var(--text-secondary)', transform: 'translateZ(4px)' }}>
            {project.desc}
          </p>
        </div>

        {/* Tags */}
        <div className="flex flex-wrap gap-2">
          {(project.tags || []).map(tag => (
            <span key={tag} className="text-xs px-3 py-1 rounded-full font-medium"
              style={{ background: `${project.color}15`, color: project.color, border: `1px solid ${project.color}30` }}>
              {tag}
            </span>
          ))}
        </div>

        <motion.div className="text-sm font-semibold flex items-center gap-1" style={{ color: project.color }}
          whileHover={{ x: 5 }}>
          View Project ↗
        </motion.div>
      </motion.a>
    </TiltCard>
  );
}

/* ─── Main Page ──────────────────────────────────────────────── */
export default function Page() {
  const containerRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({ target: containerRef });
  const heroY = useTransform(scrollYProgress, [0, 0.3], [0, -140]);
  const heroOpacity = useTransform(scrollYProgress, [0, 0.28], [1, 0]);
  const heroScale = useTransform(scrollYProgress, [0, 0.3], [1, 0.92]);

  const [portfolioData, setPortfolioData] = useState<{ hero: Hero; projects: Project[]; skills: Skill[] } | null>(null);
  const [contactForm, setContactForm] = useState({ name: '', email: '', message: '' });
  const [formStatus, setFormStatus] = useState<'idle' | 'sending' | 'sent'>('idle');

  useEffect(() => {
    fetch('/api/portfolio').then(r => r.json()).then(setPortfolioData);
  }, []);

  const hero = portfolioData?.hero;
  const projects = portfolioData?.projects || [];
  const skills = portfolioData?.skills || [];

  async function handleContact(e: React.FormEvent) {
    e.preventDefault();
    if (!contactForm.name || !contactForm.email || !contactForm.message) return;
    setFormStatus('sending');
    try {
      const res = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(contactForm),
      });
      if (res.ok) {
        setFormStatus('sent');
        setContactForm({ name: '', email: '', message: '' });
      } else {
        setFormStatus('idle');
        alert('Failed to send message. Please try again.');
      }
    } catch {
      setFormStatus('idle');
      alert('Network error. Please try again.');
    } finally {
      setTimeout(() => setFormStatus('idle'), 4000);
    }
  }

  const NAV_LINKS = ['About', 'Projects', 'Skills', 'GitHub', 'Contact'];

  return (
    <div ref={containerRef} style={{ background: 'var(--bg)', minHeight: '100vh', overflowX: 'hidden' }}>

      {/* ── Nav ─────────────────────────────────────────────────── */}
      <motion.nav
        initial={{ y: -20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
        className="fixed top-0 left-0 right-0 z-50 flex items-center justify-between px-6 sm:px-10 py-4"
        style={{
          background: 'rgba(7, 10, 20, 0.45)',
          backdropFilter: 'blur(24px) saturate(180%)',
          WebkitBackdropFilter: 'blur(24px) saturate(180%)',
          borderBottom: '1px solid rgba(53, 228, 255, 0.12)',
          boxShadow: '0 1px 0 0 rgba(53,228,255,0.06), inset 0 1px 0 0 rgba(255,255,255,0.06)',
        }}
      >
        <a href="#top" className="flex items-center gap-3" style={{ textDecoration: 'none' }}>
          <img
            src="/favicon.png"
            alt="VK Logo"
            className="w-9 h-9 rounded-xl object-cover border border-[rgba(53,228,255,0.4)] shadow-[0_0_15px_rgba(53,228,255,0.3)] transition-transform duration-300 hover:scale-105"
          />
          <span className="text-base font-bold gradient-text tracking-tight hidden xs:inline-block sm:inline-block">Varun Kehlawat</span>
        </a>
        <div className="hidden sm:flex items-center gap-8">
          {NAV_LINKS.map((item) => (
            <a key={item} href={`#${item.toLowerCase()}`} className="text-sm transition-colors"
              style={{ color: 'var(--text-secondary)' }}
              onMouseEnter={e => (e.currentTarget.style.color = '#35E4FF')}
              onMouseLeave={e => (e.currentTarget.style.color = 'var(--text-secondary)')}>
              {item}
            </a>
          ))}
        </div>
        <MagneticButton
          href="mailto:varunkehlawat@gmail.com"
          className="px-4 py-2 rounded-lg text-sm font-semibold text-white transition-all"
          style={{ background: 'var(--grad)', color: '#04060f', boxShadow: '0 0 20px rgba(53,228,255,0.3)', textDecoration: 'none', display: 'inline-block' } as React.CSSProperties}
        >
          Hire Me →
        </MagneticButton>
      </motion.nav>

      {/* ── Hero ──────────────────────────────────────────────────── */}
      <section className="relative min-h-screen flex flex-col items-center justify-center overflow-hidden">
        {/* Three.js WebGL Canvas */}
        <div className="absolute inset-0 z-0">
          <Suspense fallback={null}>
            <ThreeScene className="w-full h-full" />
          </Suspense>
        </div>

        {/* Overlays */}
        <div className="absolute inset-0 z-[1] pointer-events-none"
          style={{ background: 'radial-gradient(ellipse at center, transparent 25%, rgba(5,5,15,0.65) 100%)' }} />
        <div className="absolute inset-0 z-[1] pointer-events-none"
          style={{ background: 'linear-gradient(to bottom, rgba(5,5,15,0.4) 0%, transparent 35%, rgba(5,5,15,0.85) 100%)' }} />
        <div className="absolute inset-0 z-[1] grid-bg opacity-15 pointer-events-none" />

        {/* Foreground */}
        <motion.div
          className="relative z-10 flex flex-col items-center text-center px-6 max-w-5xl mx-auto"
          style={{ y: heroY, opacity: heroOpacity, scale: heroScale }}
        >
          {/* Status Badge */}
          <div className="inline-flex items-center gap-2.5 text-xs text-[#96A2C6] font-mono tracking-wide mb-6 px-3.5 py-1.5 border border-[rgba(150,162,198,0.15)] rounded-full bg-[rgba(16,21,44,0.4)]">
            <span className="w-2 h-2 rounded-full bg-[#3ce6a4] shadow-[0_0_10px_#3ce6a4] animate-pulse" />
            <span>Open to internships &amp; freelance</span>
          </div>

          {/* Name */}
          <h1 className="text-6xl sm:text-7xl md:text-8xl font-black tracking-tighter leading-none mb-4">
            <TextEffect preset="blur" per="word" delay={0.2} as="span" className="block gradient-text">
              Varun Kehlawat
            </TextEffect>
          </h1>

          {/* Typewriter Roles */}
          <TypewriterRoles roles={['Full-Stack Developer', 'BCA · AI & Data Science', 'Builder of AI-powered things']} />

          {/* Bio / Hook */}
          <TextEffect preset="fade-in-blur" per="word" delay={0.8} as="p"
            className="text-lg max-w-2xl leading-relaxed mb-10 text-[#96A2C6]">
            {hero?.bio || 'Full-stack developer and BCA student in AI & Data Science, building complete products end to end and experimenting with the latest AI models.'}
          </TextEffect>

          {/* CTA buttons */}
          <AnimatedGroup preset="blur-slide" className="flex flex-wrap gap-4 justify-center mb-12">
            <MagneticButton
              href="#projects"
              className="px-8 py-4 rounded-xl text-base font-semibold text-white"
              style={{ background: 'var(--grad)', color: '#04060f', boxShadow: '0 8px 30px rgba(53,228,255,0.22)', textDecoration: 'none', display: 'inline-block' } as React.CSSProperties}
            >
              View My Work →
            </MagneticButton>
            <MagneticButton
              href={hero?.linkedin || 'https://www.linkedin.com/in/varun-kehlawat-662a81379/'}
              className="px-8 py-4 rounded-xl text-base font-semibold glass"
              style={{ color: 'var(--text-primary)', textDecoration: 'none', display: 'inline-block' } as React.CSSProperties}
            >
              LinkedIn ↗
            </MagneticButton>
          </AnimatedGroup>

          {/* Social links row */}
          <AnimatedGroup preset="blur-slide" className="flex gap-4 flex-wrap justify-center">
            {[
              { icon: '💼', label: 'LinkedIn', color: '#0077b5', glow: 'rgba(0,119,181,0.3)', href: hero?.linkedin || 'https://www.linkedin.com/in/varun-kehlawat-662a81379/' },
              { icon: '📸', label: 'Instagram', color: '#e1306c', glow: 'rgba(225,48,108,0.3)', href: hero?.instagram || 'https://www.instagram.com/varunkehlawatt' },
              { icon: '✉️', label: 'Email', color: '#a78bfa', glow: 'rgba(167,139,250,0.3)', href: `mailto:${hero?.email || 'varunkehlawat@gmail.com'}` },
              { icon: '🚀', label: 'Abroadly', color: '#7c3aed', glow: 'rgba(124,58,237,0.3)', href: 'https://abroadly-sepia.vercel.app/' },
              { icon: '🏢', label: 'Shri Balaji', color: '#06b6d4', glow: 'rgba(6,182,212,0.3)', href: 'https://www.shribalajilogisticsandservices.com/' },
            ].map(({ icon, label, color, glow, href }) => (
              <TiltCard key={label} intensity={15} className="flex-shrink-0">
                <a href={href} target="_blank" rel="noopener noreferrer" style={{ textDecoration: 'none' }}>
                  <div className="w-20 h-20 rounded-2xl flex flex-col items-center justify-center gap-1 relative overflow-hidden"
                    style={{
                      background: `linear-gradient(135deg, ${color}22, ${color}08)`,
                      border: `1px solid ${color}40`,
                      boxShadow: `0 0 20px ${glow}, inset 0 0 20px ${color}10`,
                      transformStyle: 'preserve-3d',
                    }}>
                    <span className="text-2xl" style={{ transform: 'translateZ(8px)' }}>{icon}</span>
                    <span className="text-xs font-medium" style={{ color, transform: 'translateZ(4px)' }}>{label}</span>
                    <div className="absolute inset-0 rounded-2xl pointer-events-none"
                      style={{ background: 'linear-gradient(135deg, rgba(255,255,255,0.08) 0%, transparent 60%)' }} />
                  </div>
                </a>
              </TiltCard>
            ))}
          </AnimatedGroup>
        </motion.div>

        {/* Scroll cue */}
        <motion.div
          className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 z-10"
          animate={{ y: [0, 10, 0] }}
          transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
          style={{ color: 'var(--text-secondary)', opacity: 0.6 } as React.CSSProperties}
        >
          <span className="text-xs tracking-widest uppercase">Scroll</span>
          <div className="w-px h-10 rounded-full"          style={{ background: 'linear-gradient(to bottom, #35E4FF, transparent)', borderRadius: '999px' }} />
        </motion.div>
      </section>

      {/* ── About ─────────────────────────────────────────────────── */}
      <section className="py-28 px-6" id="about">
        <div className="max-w-5xl mx-auto">
          <InView>
            <div className="grid md:grid-cols-2 gap-12 items-center">
              <div>
                <p className="text-xs tracking-widest uppercase font-semibold mb-3" style={{ color: '#35E4FF' }}>About Me</p>
                <h2 className="text-4xl sm:text-5xl font-black tracking-tight mb-6">
                  Building the{' '}
                  <span className="gradient-text"><ScrambleText text="future with code" /></span>
                </h2>
                <p className="text-base leading-relaxed mb-4" style={{ color: 'var(--text-secondary)' }}>
                  I&apos;m <strong style={{ color: '#f1f0ff' }}>Varun Kehlawat</strong> — a full-stack developer and BCA (AI &amp; DS) student, obsessed with pushing the boundaries of what&apos;s possible with technology.
                </p>
                <p className="text-base leading-relaxed mb-8" style={{ color: 'var(--text-secondary)' }}>
                  From building production-grade web apps to experimenting with cutting-edge AI models — I&apos;m always chasing the next big thing in tech.
                </p>
                <div className="flex flex-wrap gap-3">
                  <MagneticButton href="mailto:varunkehlawat@gmail.com"
                    className="px-6 py-3 rounded-xl text-sm font-semibold"
                    style={{ background: 'var(--grad)', color: '#04060f', boxShadow: '0 0 30px rgba(53,228,255,0.3)', textDecoration: 'none', display: 'inline-block' } as React.CSSProperties}>
                    Get in Touch →
                  </MagneticButton>
                  <MagneticButton href={hero?.linkedin || 'https://www.linkedin.com/in/varun-kehlawat-662a81379/'}
                    className="px-6 py-3 rounded-xl text-sm font-semibold glass"
                    style={{ color: 'var(--text-primary)', textDecoration: 'none', display: 'inline-block' } as React.CSSProperties}>
                    LinkedIn ↗
                  </MagneticButton>
                </div>
              </div>

              {/* Stats */}
              <ParallaxSection depth={0.05}>
                <AnimatedGroup preset="blur-slide" className="grid grid-cols-2 gap-4">
                  {[
                    { val: 2, suffix: '+', label: 'Live Projects' },
                    { val: 1, suffix: '+', label: 'Years Building' },
                    { val: 10, suffix: '+', label: 'Technologies' },
                    { val: 100, suffix: '%', label: 'Passion' },
                  ].map(({ val, suffix, label }) => (
                    <TiltCard key={label} intensity={10} className="h-full">
                      <div className="flex flex-col items-center text-center py-8 rounded-2xl relative overflow-hidden"
                        style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.08)' }}>
                        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-24 h-px rounded-full"
                          style={{ background: 'linear-gradient(90deg, transparent, rgba(53,228,255,0.6), transparent)' }} />
                        <span className="text-4xl font-black gradient-text mb-1">
                          <Counter to={val} suffix={suffix} />
                        </span>
                        <span className="text-xs mt-1" style={{ color: 'var(--text-secondary)' }}>{label}</span>
                      </div>
                    </TiltCard>
                  ))}
                </AnimatedGroup>
              </ParallaxSection>
            </div>
          </InView>
        </div>
      </section>

      {/* ── Skills Marquee ────────────────────────────────────────── */}
      <section className="py-10 overflow-hidden" style={{ borderTop: '1px solid var(--border)', borderBottom: '1px solid var(--border)' }}>
        <SkillsMarquee skills={skills.length > 0 ? skills : [
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
        ]} />
      </section>

      {/* ── Projects ──────────────────────────────────────────────── */}
      <section className="py-28 px-6" id="projects">
        <div className="max-w-6xl mx-auto">
          <InView>
            <div className="text-center mb-16">
              <p className="text-xs tracking-widest uppercase font-semibold mb-3" style={{ color: '#35E4FF' }}>My Work</p>
              <h2 className="text-4xl sm:text-6xl font-black tracking-tight mb-4">
                Projects I&apos;ve{' '}
                <span className="gradient-text">built</span>
              </h2>
              <p className="text-lg max-w-xl mx-auto" style={{ color: 'var(--text-secondary)' }}>
                Real-world applications shipped and live on the internet.
              </p>
            </div>
          </InView>

          <div className="grid sm:grid-cols-2 gap-6">
            {(projects.length > 0 ? projects : [
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
            ] as Project[]).map((project, i) => (
              <InView key={project.id} viewOptions={{ once: true, margin: '-40px' }}>
                <ParallaxSection depth={0.03 * (i % 2)}>
                  <ProjectCard project={project} />
                </ParallaxSection>
              </InView>
            ))}
          </div>
        </div>
      </section>

      {/* ── Skills Grid ───────────────────────────────────────────── */}
      <section className="py-28 px-6" id="skills">
        <div className="max-w-6xl mx-auto">
          <InView>
            <div className="text-center mb-16">
              <p className="text-xs tracking-widest uppercase font-semibold mb-3" style={{ color: '#35E4FF' }}>Tech Stack</p>
              <h2 className="text-4xl sm:text-5xl font-black tracking-tight mb-4">
                Tools &amp; <span className="gradient-text">Technologies</span>
              </h2>
            </div>
          </InView>

          <AnimatedGroup preset="blur-slide" className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
            {(skills.length > 0 ? skills : [
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
            ] as Skill[]).map((skill) => (
              <TiltCard key={skill.name} intensity={15}>
                <div className="flex flex-col items-center gap-2 py-6 px-4 rounded-2xl relative overflow-hidden"
                  style={{
                    background: `linear-gradient(135deg, ${skill.color}15, ${skill.color}05)`,
                    border: `1px solid ${skill.color}30`,
                    boxShadow: `0 0 20px ${skill.color}15`,
                  }}>
                  <span className="text-3xl">{skill.icon}</span>
                  <span className="text-xs font-semibold text-center" style={{ color: skill.color }}>{skill.name}</span>
                </div>
              </TiltCard>
            ))}
          </AnimatedGroup>
        </div>
      </section>


      {/* ── GitHub Heatmap ────────────────────────────────────────── */}
      <section className="py-28 px-6" id="github">
        <div className="max-w-6xl mx-auto">
          <InView>
            <GitHubHeatmap username="varunkehlawat-crypto" />
          </InView>
        </div>
      </section>

      {/* ── QR Codes ──────────────────────────────────────────────── */}
      <section className="py-28 px-6 relative overflow-hidden" id="qr">
        <FloatingOrb x="10%" y="20%" size={350} color="#7c3aed" delay={0} />
        <FloatingOrb x="70%" y="40%" size={280} color="#e1306c" delay={2} />
        <div className="max-w-4xl mx-auto relative z-10">
          <InView>
            <div className="text-center mb-16">
              <p className="text-xs tracking-widest uppercase font-semibold mb-3" style={{ color: '#35E4FF' }}>Connect</p>
              <h2 className="text-4xl sm:text-5xl font-black tracking-tight mb-4">
                Scan to{' '}
                <span className="gradient-text">Connect</span>
              </h2>
              <p className="text-base max-w-lg mx-auto" style={{ color: 'var(--text-secondary)' }}>
                Scan these QR codes to connect with Varun on social media — or download them for a business card, event, or presentation.
              </p>
            </div>
          </InView>

          <div className="grid sm:grid-cols-2 gap-8 max-w-2xl mx-auto">
            <QRCard
              title="LinkedIn"
              subtitle="Varun Kehlawat"
              url="https://www.linkedin.com/in/varun-kehlawat-662a81379/"
              icon="💼"
              color="#0077b5"
              glow="rgba(0,119,181,0.25)"
            />
            <QRCard
              title="Instagram"
              subtitle="@varunkehlawatt"
              url="https://www.instagram.com/varunkehlawatt"
              icon="📸"
              color="#e1306c"
              glow="rgba(225,48,108,0.25)"
            />
          </div>
        </div>
      </section>

      {/* ── Contact ───────────────────────────────────────────────── */}
      <section className="py-28 px-6 relative overflow-hidden" id="contact">
        <div className="absolute inset-0 grid-bg opacity-30" />
        <FloatingOrb x="60%" y="10%" size={400} color="#7c3aed" delay={0} />
        <div className="max-w-5xl mx-auto relative z-10">
          <InView>
            <div className="text-center mb-16">
              <p className="text-xs tracking-widest uppercase font-semibold mb-3" style={{ color: '#35E4FF' }}>Get In Touch</p>
              <h2 className="text-4xl sm:text-6xl font-black tracking-tight mb-4">
                Let&apos;s{' '}
                <span className="gradient-text">collaborate</span>
              </h2>
              <p className="text-lg max-w-xl mx-auto" style={{ color: 'var(--text-secondary)' }}>
                Have a project in mind? Let&apos;s build something amazing together.
              </p>
            </div>
          </InView>

          <div className="grid md:grid-cols-2 gap-12 items-start">
            {/* Left: info */}
            <div className="space-y-6">
              {[
                { icon: '✉️', label: 'Email', value: 'varunkehlawat@gmail.com', href: 'mailto:varunkehlawat@gmail.com' },
                { icon: '💼', label: 'LinkedIn', value: 'varun-kehlawat-662a81379', href: 'https://www.linkedin.com/in/varun-kehlawat-662a81379/' },
                { icon: '📸', label: 'Instagram', value: '@varunkehlawatt', href: 'https://www.instagram.com/varunkehlawatt' },
              ].map(({ icon, label, value, href }) => (
                <TiltCard key={label} intensity={8}>
                  <a href={href} target="_blank" rel="noopener noreferrer" style={{ textDecoration: 'none' }}>
                    <div className="flex items-center gap-4 p-5 rounded-2xl glass transition-all hover:border-violet-500/30"
                      style={{ borderColor: 'rgba(255,255,255,0.08)' }}>
                      <div className="w-11 h-11 rounded-xl flex items-center justify-center text-xl flex-shrink-0"
                      style={{ background: 'rgba(53,228,255,0.1)', border: '1px solid rgba(53,228,255,0.25)' }}>
                        {icon}
                      </div>
                      <div>
                        <div className="text-xs font-semibold tracking-wider uppercase" style={{ color: '#9290b0' }}>{label}</div>
                        <div className="text-sm font-medium" style={{ color: '#f1f0ff' }}>{value}</div>
                      </div>
                    </div>
                  </a>
                </TiltCard>
              ))}
            </div>

            {/* Right: form */}
            <TiltCard intensity={5} className="h-full">
              <div className="p-8 rounded-2xl h-full"
                style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.08)' }}>
                <h3 className="text-lg font-bold mb-6">Send a Message</h3>
                <form onSubmit={handleContact} className="space-y-4">
                  {[
                    { id: 'name', label: 'Your Name', type: 'text', placeholder: 'John Doe' },
                    { id: 'email', label: 'Your Email', type: 'email', placeholder: 'john@example.com' },
                  ].map(({ id, label, type, placeholder }) => (
                    <div key={id}>
                      <label className="block text-xs font-semibold tracking-wider uppercase mb-2" style={{ color: '#9290b0' }}>{label}</label>
                      <input
                        type={type}
                        placeholder={placeholder}
                        value={(contactForm as any)[id]}
                        onChange={e => setContactForm(f => ({ ...f, [id]: e.target.value }))}
                        required
                        style={{
                          width: '100%', padding: '11px 14px',
                          background: 'rgba(255,255,255,0.05)',
                          border: '1px solid rgba(255,255,255,0.1)',
                          borderRadius: 10, color: '#f1f0ff', fontSize: 14,
                          outline: 'none', boxSizing: 'border-box',
                          fontFamily: 'Inter, system-ui, sans-serif',
                        }}
                        onFocus={e => (e.target.style.borderColor = 'rgba(124,58,237,0.5)')}
                        onBlur={e => (e.target.style.borderColor = 'rgba(255,255,255,0.1)')}
                      />
                    </div>
                  ))}
                  <div>
                    <label className="block text-xs font-semibold tracking-wider uppercase mb-2" style={{ color: '#9290b0' }}>Message</label>
                    <textarea
                      placeholder="Tell me about your project…"
                      value={contactForm.message}
                      onChange={e => setContactForm(f => ({ ...f, message: e.target.value }))}
                      required
                      rows={4}
                      style={{
                        width: '100%', padding: '11px 14px',
                        background: 'rgba(255,255,255,0.05)',
                        border: '1px solid rgba(255,255,255,0.1)',
                        borderRadius: 10, color: '#f1f0ff', fontSize: 14,
                        outline: 'none', boxSizing: 'border-box', resize: 'vertical',
                        fontFamily: 'Inter, system-ui, sans-serif',
                      }}
                      onFocus={e => (e.target.style.borderColor = 'rgba(124,58,237,0.5)')}
                      onBlur={e => (e.target.style.borderColor = 'rgba(255,255,255,0.1)')}
                    />
                  </div>
                  <motion.button
                    type="submit"
                    disabled={formStatus !== 'idle'}
                    whileHover={{ scale: formStatus === 'idle' ? 1.02 : 1 }}
                    whileTap={{ scale: 0.97 }}
                    style={{
                      width: '100%', padding: '13px',
                      background: formStatus === 'sent' ? 'rgba(16,185,129,0.3)' : 'var(--grad)',
                      border: formStatus === 'sent' ? '1px solid rgba(16,185,129,0.4)' : '1px solid transparent',
                      borderRadius: 10, color: formStatus === 'sent' ? '#34d399' : '#fff',
                      fontWeight: 700, fontSize: 15, cursor: formStatus !== 'idle' ? 'not-allowed' : 'pointer',
                      boxShadow: formStatus === 'sent' ? '0 0 20px rgba(16,185,129,0.3)' : '0 0 30px rgba(124,58,237,0.4)',
                      fontFamily: 'Inter, system-ui, sans-serif',
                    }}
                  >
                    {formStatus === 'idle' ? 'Send Message →'
                      : formStatus === 'sending' ? 'Sending…'
                      : '✅ Message Sent!'}
                  </motion.button>
                </form>
              </div>
            </TiltCard>
          </div>
        </div>
      </section>

      {/* ── Footer ────────────────────────────────────────────────── */}
      <footer className="py-8 px-8 text-center text-xs" style={{ borderTop: '1px solid var(--border)', color: 'var(--text-secondary)' }}>
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 max-w-5xl mx-auto">
          <span className="font-black gradient-text text-sm">Varun Kehlawat</span>
          <TextLoop interval={4} className="text-xs text-slate-400 font-medium">
            <span className="flex items-center gap-1.5">
              <span className="text-cyan-400 font-semibold">Full Stack Developer</span>
              <span>·</span>
              <span className="text-purple-400 font-semibold">BCA AI &amp; DS Student</span>
            </span>
            <span className="flex items-center gap-1.5">
              <span className="text-indigo-400 font-semibold">Building Modern Web &amp; AI Apps</span>
              <span>·</span>
              <span className="text-teal-400 font-semibold">Passionate about Tech</span>
            </span>
          </TextLoop>
          <div className="flex items-center gap-4">
            <a href="https://www.linkedin.com/in/varun-kehlawat-662a81379/" target="_blank" rel="noopener noreferrer" style={{ color: 'var(--text-secondary)', textDecoration: 'none' }}
              onMouseEnter={e => (e.currentTarget.style.color = '#a78bfa')}
              onMouseLeave={e => (e.currentTarget.style.color = 'var(--text-secondary)')}>
              LinkedIn
            </a>
            <a href="https://www.instagram.com/varunkehlawatt" target="_blank" rel="noopener noreferrer" style={{ color: 'var(--text-secondary)', textDecoration: 'none' }}
              onMouseEnter={e => (e.currentTarget.style.color = '#a78bfa')}
              onMouseLeave={e => (e.currentTarget.style.color = 'var(--text-secondary)')}>
              Instagram
            </a>
            <a href="/admin" style={{ color: 'var(--text-secondary)', textDecoration: 'none' }}
              onMouseEnter={e => (e.currentTarget.style.color = '#a78bfa')}
              onMouseLeave={e => (e.currentTarget.style.color = 'var(--text-secondary)')}>
              Admin ⚙
            </a>
            <span>© 2026</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
