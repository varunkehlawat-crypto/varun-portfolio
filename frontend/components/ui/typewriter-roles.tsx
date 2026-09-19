'use client';
import { useState, useEffect } from 'react';

export function TypewriterRoles({ roles }: { roles: string[] }) {
  const [text, setText] = useState('');

  useEffect(() => {
    if (!roles || roles.length === 0) return;
    let ri = 0;
    let ci = 0;
    let deleting = false;
    let timerId: NodeJS.Timeout;

    function tick() {
      const word = roles[ri];
      if (deleting) {
        setText(word.slice(0, ci--));
      } else {
        setText(word.slice(0, ci++));
      }

      let delay = deleting ? 45 : 90;

      if (!deleting && ci === word.length + 1) {
        delay = 1500;
        deleting = true;
      } else if (deleting && ci < 0) {
        deleting = false;
        ri = (ri + 1) % roles.length;
        ci = 0;
        delay = 260;
      }

      timerId = setTimeout(tick, delay);
    }

    tick();

    return () => clearTimeout(timerId);
  }, [roles]);

  return (
    <div
      className="text-[clamp(15px,2.4vw,22px)] text-[#35E4FF] min-h-[1.4em] mb-[22px] flex items-center justify-center tracking-normal font-normal select-none"
      style={{ fontFamily: '"JetBrains Mono", monospace' }}
    >
      <span>{text}</span>
      <span
        className="inline-block w-[9px] h-[1.05em] bg-[#35E4FF] ml-[3px] align-[-2px]"
        style={{ animation: 'blink 1.05s step-end infinite' }}
        aria-hidden="true"
      />
      <style dangerouslySetInnerHTML={{
        __html: `
        @keyframes blink { 50% { opacity: 0; } }
      `}} />
    </div>
  );
}
