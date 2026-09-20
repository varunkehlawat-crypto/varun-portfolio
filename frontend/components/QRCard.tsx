'use client';

import { ElementType, useRef } from 'react';
import { QRCodeCanvas } from 'qrcode.react';
import { motion } from 'motion/react';

interface QRCardProps {
  title: string;
  subtitle: string;
  url: string;
  icon: ElementType | string;
  iconBg?: string;
  color: string;
  glow: string;
}

export default function QRCard({ title, subtitle, url, icon, iconBg, color, glow }: QRCardProps) {
  const canvasRef = useRef<HTMLDivElement>(null);

  function downloadQR() {
    const canvas = canvasRef.current?.querySelector('canvas');
    if (!canvas) return;
    const link = document.createElement('a');
    link.download = `${title.toLowerCase().replace(/\s+/g, '-')}-qr.png`;
    link.href = canvas.toDataURL('image/png');
    link.click();
  }

  const renderIcon = () => {
    if (typeof icon === 'string') {
      if (icon.startsWith('http')) {
        return <img src={icon} alt={title} className="w-5 h-5 object-contain" />;
      }
      return icon;
    }
    const IconComp = icon;
    return <IconComp className="w-5 h-5 text-white" style={{ color: iconBg ? '#ffffff' : color }} />;
  };

  return (
    <motion.div
      whileHover={{ y: -4, scale: 1.02 }}
      transition={{ type: 'spring', stiffness: 300, damping: 25 }}
      className="p-5 sm:p-7 flex flex-col items-center gap-4 sm:gap-5 text-center relative overflow-hidden"
      style={{
        background: `linear-gradient(135deg, ${color}15, rgba(10,10,26,0.85))`,
        backdropFilter: 'blur(20px)',
        border: `1px solid ${color}40`,
        borderRadius: 20,
        boxShadow: `0 0 35px ${glow}, inset 0 0 25px ${color}10`,
        cursor: 'default',
        width: '100%',
      }}
    >
      {/* Top gradient line */}
      <div style={{
        position: 'absolute', top: 0, left: '15%', right: '15%', height: 1,
        background: `linear-gradient(90deg, transparent, ${color}, transparent)`,
      }} />

      {/* Glow orb behind QR */}
      <div style={{
        position: 'absolute', bottom: -40, left: '50%', transform: 'translateX(-50%)',
        width: 220, height: 220, borderRadius: '50%',
        background: `radial-gradient(circle, ${glow}, transparent 70%)`,
        filter: 'blur(30px)', pointerEvents: 'none', opacity: 0.6,
      }} />

      {/* Icon + Title */}
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8 }}>
        <div style={{
          width: 48, height: 48, borderRadius: 12,
          background: iconBg || `linear-gradient(135deg, ${color}30, ${color}10)`,
          border: iconBg ? 'none' : `1px solid ${color}50`,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontSize: 22, boxShadow: `0 0 20px ${glow}`,
        }}>
          {renderIcon()}
        </div>
        <div>
          <div style={{ fontWeight: 800, fontSize: 16, color: '#f1f0ff', letterSpacing: '-0.02em' }}>{title}</div>
          <div style={{ fontSize: 12, color: '#9290b0', marginTop: 2 }}>{subtitle}</div>
        </div>
      </div>

      {/* QR Code */}
      <div ref={canvasRef} style={{
        background: '#ffffff',
        padding: 10,
        borderRadius: 12,
        boxShadow: `0 0 30px ${glow}`,
        position: 'relative', zIndex: 1,
      }}>
        <QRCodeCanvas
          value={url}
          size={140}
          bgColor="#ffffff"
          fgColor="#0a0a1a"
          level="H"
          includeMargin={false}
        />
      </div>

      {/* URL */}
      <p style={{ fontSize: 11, color: '#9290b0', wordBreak: 'break-all', maxWidth: 220, lineHeight: 1.4 }} className="truncate max-w-full px-2">
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
