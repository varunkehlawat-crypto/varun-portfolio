'use client';

import { useRef } from 'react';
import { QRCodeCanvas } from 'qrcode.react';
import { motion } from 'motion/react';

interface QRCardProps {
  title: string;
  subtitle: string;
  url: string;
  icon: string;
  color: string;
  glow: string;
}

export default function QRCard({ title, subtitle, url, icon, color, glow }: QRCardProps) {
  const canvasRef = useRef<HTMLDivElement>(null);

  function downloadQR() {
    const canvas = canvasRef.current?.querySelector('canvas');
    if (!canvas) return;
    const link = document.createElement('a');
    link.download = `${title.toLowerCase().replace(/\s+/g, '-')}-qr.png`;
    link.href = canvas.toDataURL('image/png');
    link.click();
  }

  return (
    <motion.div
      whileHover={{ y: -4, scale: 1.02 }}
      transition={{ type: 'spring', stiffness: 300, damping: 25 }}
      style={{
        background: 'rgba(255,255,255,0.04)',
        backdropFilter: 'blur(20px)',
        border: `1px solid ${color}30`,
        borderRadius: 20,
        padding: '28px 24px',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: 18,
        boxShadow: `0 0 40px ${glow}`,
        cursor: 'default',
        textAlign: 'center',
        position: 'relative',
        overflow: 'hidden',
      }}
    >
      {/* Top gradient line */}
      <div style={{
        position: 'absolute', top: 0, left: '20%', right: '20%', height: 1,
        background: `linear-gradient(90deg, transparent, ${color}80, transparent)`,
      }} />

      {/* Glow orb behind QR */}
      <div style={{
        position: 'absolute', bottom: -40, left: '50%', transform: 'translateX(-50%)',
        width: 200, height: 200, borderRadius: '50%',
        background: `radial-gradient(circle, ${glow}, transparent 70%)`,
        filter: 'blur(30px)', pointerEvents: 'none', opacity: 0.4,
      }} />

      {/* Icon + Title */}
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8 }}>
        <div style={{
          width: 48, height: 48, borderRadius: 12,
          background: `linear-gradient(135deg, ${color}30, ${color}10)`,
          border: `1px solid ${color}50`,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontSize: 22, boxShadow: `0 0 20px ${glow}`,
        }}>
          {icon}
        </div>
        <div>
          <div style={{ fontWeight: 800, fontSize: 16, color: '#f1f0ff', letterSpacing: '-0.02em' }}>{title}</div>
          <div style={{ fontSize: 12, color: '#9290b0', marginTop: 2 }}>{subtitle}</div>
        </div>
      </div>

      {/* QR Code */}
      <div ref={canvasRef} style={{
        background: '#ffffff',
        padding: 12,
        borderRadius: 12,
        boxShadow: `0 0 30px ${glow}`,
        position: 'relative', zIndex: 1,
      }}>
        <QRCodeCanvas
          value={url}
          size={160}
          bgColor="#ffffff"
          fgColor="#0a0a1a"
          level="H"
          includeMargin={false}
        />
      </div>

      {/* URL */}
      <p style={{ fontSize: 11, color: '#9290b0', wordBreak: 'break-all', maxWidth: 200, lineHeight: 1.5 }}>
        {url}
      </p>

      {/* Download button */}
      <motion.button
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        onClick={downloadQR}
        style={{
          padding: '9px 20px', borderRadius: 10, border: `1px solid ${color}40`,
          background: `${color}15`, color, fontWeight: 600, fontSize: 13,
          cursor: 'pointer', transition: 'all 0.2s',
          fontFamily: 'Inter, system-ui, sans-serif',
          boxShadow: `0 0 15px ${glow}`,
        }}
      >
        ⬇ Download QR
      </motion.button>
    </motion.div>
  );
}
