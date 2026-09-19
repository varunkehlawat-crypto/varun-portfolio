'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'motion/react';

type Project = { id: string; title: string; desc: string; url: string; tags: string[]; featured: boolean; color: string };
type Skill = { id: string; name: string; icon: string; color: string };
type Hero = { name: string; title: string; bio: string; email: string; linkedin: string; instagram: string };
type ClientMessage = { id: string; name: string; email: string; message: string; read: boolean; created_at: string };

const TAB_STYLE = (active: boolean) => ({
  padding: '8px 18px', borderRadius: 8, border: 'none', cursor: 'pointer',
  fontWeight: 600, fontSize: 13, transition: 'all 0.2s',
  fontFamily: 'Inter, system-ui, sans-serif',
  background: active ? 'rgba(124,58,237,0.3)' : 'transparent',
  color: active ? '#a78bfa' : '#9290b0',
  borderBottom: active ? '1px solid rgba(124,58,237,0.5)' : '1px solid transparent',
  display: 'inline-flex', alignItems: 'center', gap: 6,
});

const INPUT_STYLE = {
  width: '100%', padding: '10px 14px',
  background: 'rgba(255,255,255,0.05)',
  border: '1px solid rgba(255,255,255,0.1)',
  borderRadius: 8, color: '#f1f0ff', fontSize: 13,
  outline: 'none', boxSizing: 'border-box' as const,
  fontFamily: 'Inter, system-ui, sans-serif',
};

const BTN = (variant: 'primary' | 'danger' | 'ghost' | 'success') => ({
  padding: '8px 16px', borderRadius: 8, border: 'none', cursor: 'pointer',
  fontWeight: 600, fontSize: 13, transition: 'all 0.2s',
  fontFamily: 'Inter, system-ui, sans-serif',
  background:
    variant === 'primary' ? 'linear-gradient(135deg, #7c3aed, #4f46e5)'
    : variant === 'danger' ? 'rgba(239,68,68,0.2)'
    : variant === 'success' ? 'rgba(16,185,129,0.2)'
    : 'rgba(255,255,255,0.06)',
  color:
    variant === 'primary' ? '#fff'
    : variant === 'danger' ? '#fca5a5'
    : variant === 'success' ? '#6ee7b7'
    : '#9290b0',
  border:
    variant === 'danger' ? '1px solid rgba(239,68,68,0.3)'
    : variant === 'success' ? '1px solid rgba(16,185,129,0.3)'
    : variant === 'ghost' ? '1px solid rgba(255,255,255,0.1)'
    : 'none',
});

function formatDate(isoStr: string) {
  try {
    const d = new Date(isoStr);
    return d.toLocaleString('en-US', {
      month: 'short', day: 'numeric', year: 'numeric',
      hour: 'numeric', minute: '2-digit', hour12: true,
    });
  } catch {
    return isoStr;
  }
}

export default function AdminDashboard() {
  const router = useRouter();
  const [tab, setTab] = useState<'hero' | 'projects' | 'skills' | 'inbox'>('hero');
  const [data, setData] = useState<{ hero: Hero; projects: Project[]; skills: Skill[] } | null>(null);
  const [messages, setMessages] = useState<ClientMessage[]>([]);
  const [saving, setSaving] = useState(false);
  const [toast, setToast] = useState('');
  const [newProject, setNewProject] = useState<Partial<Project>>({ title: '', desc: '', url: '', tags: [], featured: false, color: '#7c3aed' });
  const [newSkill, setNewSkill] = useState<Partial<Skill>>({ name: '', icon: '⭐', color: '#7c3aed' });
  const [editingProject, setEditingProject] = useState<Project | null>(null);

  useEffect(() => {
    fetch('/api/portfolio').then(r => r.json()).then(setData);
    fetchMessages();
  }, []);

  function fetchMessages() {
    fetch('/api/contact')
      .then(r => r.json())
      .then(res => {
        if (res.messages) setMessages(res.messages);
      })
      .catch(() => {});
  }

  function showToast(msg: string) {
    setToast(msg);
    setTimeout(() => setToast(''), 3000);
  }

  async function saveHero() {
    setSaving(true);
    await fetch('/api/portfolio', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ hero: data?.hero }) });
    setSaving(false);
    showToast('✅ Hero section saved!');
  }

  async function saveProject(project: Partial<Project>) {
    await fetch('/api/portfolio', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ project }) });
    const fresh = await fetch('/api/portfolio').then(r => r.json());
    setData(fresh);
    setNewProject({ title: '', desc: '', url: '', tags: [], featured: false, color: '#7c3aed' });
    setEditingProject(null);
    showToast('✅ Project saved!');
  }

  async function deleteProject(id: string) {
    await fetch('/api/portfolio', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ deleteProject: id }) });
    const fresh = await fetch('/api/portfolio').then(r => r.json());
    setData(fresh);
    showToast('🗑️ Project deleted');
  }

  async function saveSkill(skill: Partial<Skill>) {
    await fetch('/api/portfolio', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ skill }) });
    const fresh = await fetch('/api/portfolio').then(r => r.json());
    setData(fresh);
    setNewSkill({ name: '', icon: '⭐', color: '#7c3aed' });
    showToast('✅ Skill saved!');
  }

  async function deleteSkill(id: string) {
    await fetch('/api/portfolio', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ deleteSkill: id }) });
    const fresh = await fetch('/api/portfolio').then(r => r.json());
    setData(fresh);
    showToast('🗑️ Skill deleted');
  }

  async function toggleReadStatus(id: string, currentRead: boolean) {
    await fetch('/api/contact', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id, read: !currentRead }),
    });
    setMessages(msgs => msgs.map(m => m.id === id ? { ...m, read: !currentRead } : m));
    showToast(!currentRead ? '✓ Marked as Read' : '✉️ Marked as Unread');
  }

  async function deleteClientMessage(id: string) {
    await fetch(`/api/contact?id=${id}`, { method: 'DELETE' });
    setMessages(msgs => msgs.filter(m => m.id !== id));
    showToast('🗑️ Message deleted');
  }

  async function logout() {
    await fetch('/api/admin/logout', { method: 'POST' });
    router.push('/admin');
  }

  const unreadCount = messages.filter(m => !m.read).length;

  if (!data) return (
    <div style={{ minHeight: '100vh', background: '#05050f', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#9290b0', fontFamily: 'Inter, system-ui, sans-serif' }}>
      Loading…
    </div>
  );

  return (
    <div style={{ minHeight: '100vh', background: '#05050f', fontFamily: 'Inter, system-ui, sans-serif', color: '#f1f0ff' }}>
      {/* Topbar */}
      <nav style={{
        position: 'sticky', top: 0, zIndex: 50,
        background: 'rgba(5,5,15,0.85)', backdropFilter: 'blur(20px)',
        borderBottom: '1px solid rgba(255,255,255,0.06)',
        padding: '14px 32px',
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <span style={{ fontSize: 20 }}>⚡</span>
          <span style={{ fontWeight: 800, fontSize: 16, letterSpacing: '-0.02em' }}>Portfolio Admin</span>
          <span style={{
            padding: '2px 10px', borderRadius: 20, fontSize: 11, fontWeight: 600,
            background: 'rgba(16,185,129,0.15)', color: '#34d399', border: '1px solid rgba(16,185,129,0.3)',
          }}>LIVE</span>
        </div>
        <div style={{ display: 'flex', gap: 10 }}>
          <button onClick={() => window.open('/', '_blank')} style={BTN('ghost')}>View Site ↗</button>
          <button onClick={logout} style={BTN('danger')}>Logout</button>
        </div>
      </nav>

      <div style={{ maxWidth: 880, margin: '0 auto', padding: '40px 24px' }}>
        {/* Welcome */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} style={{ marginBottom: 32 }}>
          <h1 style={{ fontSize: 28, fontWeight: 800, margin: 0, letterSpacing: '-0.03em' }}>
            Welcome back, Varun 👋
          </h1>
          <p style={{ color: '#9290b0', marginTop: 6, fontSize: 14 }}>
            Manage your portfolio content, projects, skills, and client messages.
          </p>
        </motion.div>

        {/* Tabs */}
        <div style={{ display: 'flex', gap: 4, marginBottom: 28, background: 'rgba(255,255,255,0.03)', borderRadius: 10, padding: 4, width: 'fit-content', border: '1px solid rgba(255,255,255,0.07)' }}>
          {(['hero', 'projects', 'skills', 'inbox'] as const).map(t => (
            <button key={t} onClick={() => setTab(t)} style={TAB_STYLE(tab === t)}>
              {t === 'hero' ? '🙋 Hero' : t === 'projects' ? '🚀 Projects' : t === 'skills' ? '🛠️ Skills' : '📨 Inbox'}
              {t === 'inbox' && unreadCount > 0 && (
                <span style={{
                  padding: '1px 6px', borderRadius: 10, fontSize: 10, fontWeight: 800,
                  background: '#7c3aed', color: '#fff', marginLeft: 4,
                  boxShadow: '0 0 10px rgba(124,58,237,0.6)',
                }}>
                  {unreadCount}
                </span>
              )}
            </button>
          ))}
        </div>

        {/* ─── HERO TAB ─── */}
        {tab === 'hero' && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} key="hero">
            <div style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 16, padding: 28 }}>
              <h2 style={{ fontSize: 17, fontWeight: 700, margin: '0 0 20px' }}>Hero Section</h2>
              <div style={{ display: 'grid', gap: 14 }}>
                {(['name', 'title', 'email', 'linkedin', 'instagram'] as const).map(field => (
                  <div key={field}>
                    <label style={{ display: 'block', color: '#9290b0', fontSize: 11, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 6 }}>{field}</label>
                    <input style={INPUT_STYLE} value={(data.hero as any)[field] || ''} onChange={e => setData(d => d ? { ...d, hero: { ...d.hero, [field]: e.target.value } } : d)} />
                  </div>
                ))}
                <div>
                  <label style={{ display: 'block', color: '#9290b0', fontSize: 11, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 6 }}>Bio</label>
                  <textarea style={{ ...INPUT_STYLE, height: 100, resize: 'vertical' }} value={data.hero.bio || ''} onChange={e => setData(d => d ? { ...d, hero: { ...d.hero, bio: e.target.value } } : d)} />
                </div>
                <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} onClick={saveHero} disabled={saving} style={{ ...BTN('primary'), padding: '12px 24px', fontSize: 14, width: 'fit-content' }}>
                  {saving ? 'Saving…' : 'Save Hero Section →'}
                </motion.button>
              </div>
            </div>
          </motion.div>
        )}

        {/* ─── PROJECTS TAB ─── */}
        {tab === 'projects' && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} key="projects" style={{ display: 'grid', gap: 20 }}>
            {/* Existing Projects */}
            {data.projects.map(p => (
              <div key={p.id} style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 14, padding: 20, display: 'flex', alignItems: 'flex-start', gap: 16 }}>
                <div style={{ width: 6, height: 60, borderRadius: 3, background: p.color || '#7c3aed', flexShrink: 0 }} />
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 4 }}>
                    <span style={{ fontWeight: 700, fontSize: 15 }}>{p.title}</span>
                    {p.featured && <span style={{ padding: '2px 8px', borderRadius: 10, fontSize: 10, fontWeight: 700, background: 'rgba(124,58,237,0.2)', color: '#a78bfa', border: '1px solid rgba(124,58,237,0.3)' }}>FEATURED</span>}
                  </div>
                  <p style={{ color: '#9290b0', fontSize: 13, margin: '0 0 8px' }}>{p.desc}</p>
                  <a href={p.url} target="_blank" style={{ color: '#a78bfa', fontSize: 12 }}>{p.url}</a>
                </div>
                <div style={{ display: 'flex', gap: 8, flexShrink: 0 }}>
                  <button onClick={() => setEditingProject(p)} style={BTN('ghost')}>Edit</button>
                  <button onClick={() => deleteProject(p.id)} style={BTN('danger')}>Delete</button>
                </div>
              </div>
            ))}

            {/* Add / Edit Form */}
            <div style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(124,58,237,0.2)', borderRadius: 14, padding: 24 }}>
              <h3 style={{ fontSize: 15, fontWeight: 700, margin: '0 0 16px', color: '#a78bfa' }}>
                {editingProject ? '✏️ Edit Project' : '➕ Add New Project'}
              </h3>
              <div style={{ display: 'grid', gap: 12 }}>
                {(['title', 'desc', 'url', 'color'] as const).map(field => (
                  <div key={field}>
                    <label style={{ display: 'block', color: '#9290b0', fontSize: 11, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 5 }}>{field}</label>
                    <input style={INPUT_STYLE} value={((editingProject || newProject) as any)[field] || ''}
                      onChange={e => editingProject ? setEditingProject({ ...editingProject, [field]: e.target.value }) : setNewProject(p => ({ ...p, [field]: e.target.value }))} />
                  </div>
                ))}
                <div>
                  <label style={{ display: 'block', color: '#9290b0', fontSize: 11, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 5 }}>Tags (comma-separated)</label>
                  <input style={INPUT_STYLE}
                    value={((editingProject || newProject).tags || []).join(', ')}
                    onChange={e => {
                      const tags = e.target.value.split(',').map(t => t.trim()).filter(Boolean);
                      editingProject ? setEditingProject({ ...editingProject, tags }) : setNewProject(p => ({ ...p, tags }));
                    }} />
                </div>
                <div style={{ display: 'flex', gap: 10 }}>
                  <motion.button whileTap={{ scale: 0.97 }} onClick={() => saveProject(editingProject || newProject)} style={{ ...BTN('primary'), padding: '10px 20px' }}>
                    {editingProject ? 'Update Project' : 'Add Project →'}
                  </motion.button>
                  {editingProject && <button onClick={() => setEditingProject(null)} style={BTN('ghost')}>Cancel</button>}
                </div>
              </div>
            </div>
          </motion.div>
        )}

        {/* ─── SKILLS TAB ─── */}
        {tab === 'skills' && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} key="skills" style={{ display: 'grid', gap: 20 }}>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))', gap: 12 }}>
              {data.skills.map((s: any) => (
                <div key={s.id || s.name} style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 12, padding: '14px 16px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                    <span style={{ fontSize: 20 }}>{s.icon}</span>
                    <span style={{ fontWeight: 600, fontSize: 13, color: s.color }}>{s.name}</span>
                  </div>
                  <button onClick={() => deleteSkill(s.id || s.name)} style={{ ...BTN('danger'), padding: '4px 8px', fontSize: 11 }}>✕</button>
                </div>
              ))}
            </div>
            <div style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(124,58,237,0.2)', borderRadius: 14, padding: 24 }}>
              <h3 style={{ fontSize: 15, fontWeight: 700, margin: '0 0 16px', color: '#a78bfa' }}>➕ Add Skill</h3>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 100px 140px', gap: 12, alignItems: 'end' }}>
                <div>
                  <label style={{ display: 'block', color: '#9290b0', fontSize: 11, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 5 }}>Name</label>
                  <input style={INPUT_STYLE} value={newSkill.name} onChange={e => setNewSkill(s => ({ ...s, name: e.target.value }))} />
                </div>
                <div>
                  <label style={{ display: 'block', color: '#9290b0', fontSize: 11, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 5 }}>Icon</label>
                  <input style={INPUT_STYLE} value={newSkill.icon} onChange={e => setNewSkill(s => ({ ...s, icon: e.target.value }))} />
                </div>
                <div>
                  <label style={{ display: 'block', color: '#9290b0', fontSize: 11, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 5 }}>Color</label>
                  <input style={INPUT_STYLE} value={newSkill.color} onChange={e => setNewSkill(s => ({ ...s, color: e.target.value }))} />
                </div>
              </div>
              <motion.button whileTap={{ scale: 0.97 }} onClick={() => saveSkill(newSkill)} style={{ ...BTN('primary'), padding: '10px 20px', marginTop: 14 }}>
                Add Skill →
              </motion.button>
            </div>
          </motion.div>
        )}

        {/* ─── INBOX TAB ─── */}
        {tab === 'inbox' && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} key="inbox" style={{ display: 'grid', gap: 20 }}>
            {/* Header info bar */}
            <div style={{
              display: 'flex', alignItems: 'center', justifyContent: 'space-between',
              background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.08)',
              borderRadius: 14, padding: '18px 24px',
            }}>
              <div>
                <h2 style={{ fontSize: 18, fontWeight: 800, margin: 0, letterSpacing: '-0.02em' }}>
                  Client Inquiries
                </h2>
                <p style={{ color: '#9290b0', fontSize: 13, margin: '4px 0 0' }}>
                  {messages.length} total message{messages.length === 1 ? '' : 's'} · {unreadCount} unread
                </p>
              </div>
              <button onClick={fetchMessages} style={{ ...BTN('ghost'), fontSize: 12 }}>
                🔄 Refresh
              </button>
            </div>

            {/* Messages List */}
            {messages.length === 0 ? (
              <div style={{
                textAlign: 'center', padding: '60px 24px',
                background: 'rgba(255,255,255,0.02)', border: '1px dashed rgba(255,255,255,0.08)',
                borderRadius: 16, color: '#9290b0',
              }}>
                <div style={{ fontSize: 40, marginBottom: 12 }}>📭</div>
                <h3 style={{ fontSize: 16, fontWeight: 700, color: '#f1f0ff', margin: 0 }}>No messages yet</h3>
                <p style={{ fontSize: 13, marginTop: 6, maxWidth: 400, margin: '6px auto 0' }}>
                  When clients send inquiries using the contact form on your portfolio website, they will show up here.
                </p>
              </div>
            ) : (
              <div style={{ display: 'grid', gap: 16 }}>
                {messages.map(msg => (
                  <motion.div
                    key={msg.id}
                    layout
                    initial={{ opacity: 0, y: 12 }}
                    animate={{ opacity: 1, y: 0 }}
                    style={{
                      background: msg.read ? 'rgba(255,255,255,0.025)' : 'rgba(124,58,237,0.08)',
                      border: msg.read ? '1px solid rgba(255,255,255,0.08)' : '1px solid rgba(124,58,237,0.35)',
                      borderRadius: 16,
                      padding: 24,
                      boxShadow: msg.read ? 'none' : '0 0 30px rgba(124,58,237,0.12)',
                      transition: 'all 0.2s ease',
                    }}
                  >
                    {/* Header */}
                    <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 16, marginBottom: 14 }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                        {/* Avatar */}
                        <div style={{
                          width: 44, height: 44, borderRadius: '50%',
                          background: msg.read
                            ? 'linear-gradient(135deg, rgba(255,255,255,0.1), rgba(255,255,255,0.04))'
                            : 'linear-gradient(135deg, #7c3aed, #4f46e5)',
                          display: 'flex', alignItems: 'center', justifyContent: 'center',
                          fontWeight: 800, fontSize: 16, color: '#fff',
                          flexShrink: 0,
                        }}>
                          {msg.name ? msg.name.charAt(0).toUpperCase() : '?'}
                        </div>
                        <div>
                          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                            <span style={{ fontWeight: 700, fontSize: 16, color: '#f1f0ff' }}>{msg.name}</span>
                            {!msg.read && (
                              <span style={{
                                padding: '2px 8px', borderRadius: 10, fontSize: 10, fontWeight: 800,
                                background: 'rgba(124,58,237,0.3)', color: '#a78bfa',
                                border: '1px solid rgba(124,58,237,0.5)', letterSpacing: '0.04em',
                              }}>
                                NEW
                              </span>
                            )}
                          </div>
                          <a href={`mailto:${msg.email}`} style={{ color: '#a78bfa', fontSize: 13, textDecoration: 'none' }}>
                            {msg.email}
                          </a>
                        </div>
                      </div>

                      <span style={{ color: '#9290b0', fontSize: 12, flexShrink: 0 }}>
                        {formatDate(msg.created_at)}
                      </span>
                    </div>

                    {/* Message Content */}
                    <div style={{
                      background: 'rgba(0,0,0,0.25)', border: '1px solid rgba(255,255,255,0.05)',
                      borderRadius: 12, padding: '14px 18px', marginBottom: 16,
                      color: '#d4d3e8', fontSize: 14, lineHeight: 1.6, whiteSpace: 'pre-wrap',
                    }}>
                      {msg.message}
                    </div>

                    {/* Actions */}
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 10 }}>
                      <a
                        href={`mailto:${msg.email}?subject=${encodeURIComponent(`Re: Inquiry from ${msg.name}`)}&body=${encodeURIComponent(`Hi ${msg.name},\n\nThank you for reaching out via my portfolio.\n\nBest regards,\nVarun Kehlawat`)}`}
                        style={{ ...BTN('primary'), textDecoration: 'none', display: 'inline-flex', alignItems: 'center', gap: 6, fontSize: 12 }}
                      >
                        📧 Reply via Email
                      </a>

                      <div style={{ display: 'flex', gap: 8 }}>
                        <button
                          onClick={() => toggleReadStatus(msg.id, msg.read)}
                          style={{ ...BTN('ghost'), fontSize: 12 }}
                        >
                          {msg.read ? '✉️ Mark Unread' : '✓ Mark Read'}
                        </button>
                        <button
                          onClick={() => deleteClientMessage(msg.id)}
                          style={{ ...BTN('danger'), fontSize: 12 }}
                        >
                          🗑️ Delete
                        </button>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            )}
          </motion.div>
        )}
      </div>

      {/* Toast */}
      <AnimatePresence>
        {toast && (
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 20 }}
            style={{
              position: 'fixed', bottom: 24, right: 24,
              background: 'rgba(16,185,129,0.15)', border: '1px solid rgba(16,185,129,0.3)',
              borderRadius: 10, padding: '12px 20px', color: '#34d399', fontWeight: 600, fontSize: 14,
              backdropFilter: 'blur(10px)', zIndex: 1000, boxShadow: '0 0 30px rgba(16,185,129,0.2)',
            }}>
            {toast}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
