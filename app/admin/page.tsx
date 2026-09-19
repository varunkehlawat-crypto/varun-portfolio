'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'motion/react';

export default function AdminLoginPage() {
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const res = await fetch('/api/admin/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ password }),
      });

      if (res.ok) {
        router.push('/admin/dashboard');
      } else {
        const data = await res.json();
        setError(data.error || 'Invalid password');
      }
    } catch {
      setError('Network error. Try again.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div style={{
      minHeight: '100vh',
      background: '#05050f',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      fontFamily: 'Inter, system-ui, sans-serif',
      padding: '24px',
    }}>
      {/* Background grid */}
      <div style={{
        position: 'fixed', inset: 0, zIndex: 0,
        backgroundImage: 'linear-gradient(rgba(124,58,237,0.06) 1px, transparent 1px), linear-gradient(90deg, rgba(124,58,237,0.06) 1px, transparent 1px)',
        backgroundSize: '60px 60px',
      }} />
      {/* Glow orb */}
      <div style={{
        position: 'fixed', top: '30%', left: '50%', transform: 'translateX(-50%)',
        width: 500, height: 500, borderRadius: '50%',
        background: 'radial-gradient(circle, rgba(124,58,237,0.15), transparent 70%)',
        filter: 'blur(60px)', pointerEvents: 'none', zIndex: 0,
      }} />

      <motion.div
        initial={{ opacity: 0, y: 30, scale: 0.96 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
        style={{ position: 'relative', zIndex: 1, width: '100%', maxWidth: 420 }}
      >
        {/* Card */}
        <div style={{
          background: 'rgba(255,255,255,0.04)',
          backdropFilter: 'blur(20px)',
          border: '1px solid rgba(255,255,255,0.09)',
          borderRadius: 20,
          padding: '40px 36px',
          boxShadow: '0 0 80px rgba(124,58,237,0.12)',
        }}>
          {/* Lock icon */}
          <div style={{ textAlign: 'center', marginBottom: 28 }}>
            <div style={{
              display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
              width: 56, height: 56, borderRadius: 16,
              background: 'linear-gradient(135deg, rgba(124,58,237,0.3), rgba(79,70,229,0.2))',
              border: '1px solid rgba(124,58,237,0.4)',
              boxShadow: '0 0 30px rgba(124,58,237,0.3)',
              fontSize: 26, marginBottom: 16,
            }}>
              🔐
            </div>
            <h1 style={{ color: '#f1f0ff', fontSize: 22, fontWeight: 800, margin: 0, letterSpacing: '-0.02em' }}>
              Admin Access
            </h1>
            <p style={{ color: '#9290b0', fontSize: 13, marginTop: 6 }}>
              Varun&apos;s Portfolio Dashboard
            </p>
          </div>

          <form onSubmit={handleSubmit}>
            <div style={{ marginBottom: 16 }}>
              <label style={{ display: 'block', color: '#9290b0', fontSize: 12, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 8 }}>
                Password
              </label>
              <input
                type="password"
                value={password}
                onChange={e => setPassword(e.target.value)}
                placeholder="Enter admin password"
                required
                autoFocus
                style={{
                  width: '100%', padding: '12px 16px',
                  background: 'rgba(255,255,255,0.05)',
                  border: '1px solid rgba(255,255,255,0.1)',
                  borderRadius: 10, color: '#f1f0ff', fontSize: 14,
                  outline: 'none', boxSizing: 'border-box',
                  transition: 'border-color 0.2s',
                  fontFamily: 'Inter, system-ui, sans-serif',
                }}
                onFocus={e => (e.target.style.borderColor = 'rgba(124,58,237,0.6)')}
                onBlur={e => (e.target.style.borderColor = 'rgba(255,255,255,0.1)')}
              />
            </div>

            {error && (
              <motion.div
                initial={{ opacity: 0, y: -6 }}
                animate={{ opacity: 1, y: 0 }}
                style={{
                  background: 'rgba(239,68,68,0.12)', border: '1px solid rgba(239,68,68,0.3)',
                  borderRadius: 8, padding: '10px 14px', marginBottom: 16,
                  color: '#fca5a5', fontSize: 13,
                }}
              >
                {error}
              </motion.div>
            )}

            <motion.button
              type="submit"
              disabled={loading}
              whileHover={{ scale: loading ? 1 : 1.02 }}
              whileTap={{ scale: loading ? 1 : 0.98 }}
              style={{
                width: '100%', padding: '13px',
                background: loading ? 'rgba(124,58,237,0.4)' : 'linear-gradient(135deg, #7c3aed, #4f46e5)',
                border: 'none', borderRadius: 10,
                color: '#fff', fontWeight: 700, fontSize: 15,
                cursor: loading ? 'not-allowed' : 'pointer',
                boxShadow: loading ? 'none' : '0 0 30px rgba(124,58,237,0.4)',
                transition: 'all 0.2s',
                fontFamily: 'Inter, system-ui, sans-serif',
                letterSpacing: '-0.01em',
              }}
            >
              {loading ? 'Authenticating…' : 'Enter Dashboard →'}
            </motion.button>
          </form>

          <p style={{ textAlign: 'center', marginTop: 20, color: '#9290b0', fontSize: 12 }}>
            🔒 JWT-secured · bcrypt-hashed · HttpOnly cookie
          </p>
        </div>
      </motion.div>
    </div>
  );
}
