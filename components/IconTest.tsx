import React from 'react';

// Test: 4 hand-coded SVG illustrations matching the generated PNGs

// 1. EMAIL — Open envelope with @ letter
export const IconEmail = ({ size = 80 }: { size?: number }) => (
  <svg viewBox="0 0 80 80" width={size} height={size}>
    {/* Envelope body */}
    <path d="M12,35 L12,65 Q12,68 15,68 L65,68 Q68,68 68,65 L68,35 L40,52 Z" fill="#a8c8f0" stroke="#3576cc" strokeWidth="2.5" strokeLinejoin="round" />
    {/* Envelope back flap (behind letter) */}
    <path d="M12,35 L40,18 L68,35" fill="#7baadf" stroke="#3576cc" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
    {/* Letter paper */}
    <rect x="18" y="20" width="44" height="34" rx="3" fill="#dce8f8" stroke="#3576cc" strokeWidth="2" />
    {/* @ symbol */}
    <circle cx="40" cy="36" r="8" fill="none" stroke="#3576cc" strokeWidth="2.2" />
    <path d="M44,36 A4,4 0 1,0 40,40 L44,40" fill="none" stroke="#3576cc" strokeWidth="2" strokeLinecap="round" />
    {/* Envelope front flap */}
    <path d="M12,35 L40,55 L68,35" fill="none" stroke="#3576cc" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
    {/* Bottom fold lines */}
    <path d="M12,65 L30,50" fill="none" stroke="#3576cc" strokeWidth="1.5" opacity="0.3" />
    <path d="M68,65 L50,50" fill="none" stroke="#3576cc" strokeWidth="1.5" opacity="0.3" />
  </svg>
);

// 2. PHONE — Handset with signal waves
export const IconPhone = ({ size = 80 }: { size?: number }) => (
  <svg viewBox="0 0 80 80" width={size} height={size}>
    {/* Phone handset */}
    <path
      d="M22,58 Q14,54 16,44 L20,30 Q22,26 26,28 L30,30 Q33,32 32,36 L30,42 Q29,44 31,46 L36,50 Q38,52 40,51 L46,48 Q50,46 52,49 L56,53 Q58,57 54,60 L42,66 Q32,68 22,58 Z"
      fill="#34a853" stroke="#1e7e34" strokeWidth="2.5" strokeLinejoin="round"
    />
    {/* Inner shadow */}
    <path
      d="M26,52 Q20,48 22,40 L24,34 Q26,32 28,33 L30,34"
      fill="none" stroke="#1e7e34" strokeWidth="1.5" opacity="0.3" strokeLinecap="round"
    />
    {/* Signal waves */}
    <path d="M50,28 Q58,36 50,44" fill="none" stroke="#34a853" strokeWidth="2.5" strokeLinecap="round" opacity="0.7" />
    <path d="M56,22 Q68,34 56,48" fill="none" stroke="#34a853" strokeWidth="2.5" strokeLinecap="round" opacity="0.45" />
    <path d="M62,16 Q78,32 62,52" fill="none" stroke="#34a853" strokeWidth="2.5" strokeLinecap="round" opacity="0.25" />
  </svg>
);

// 3. JOBS — Gear with hard hat and wrench
export const IconJobs = ({ size = 80 }: { size?: number }) => (
  <svg viewBox="0 0 80 80" width={size} height={size}>
    {/* Gear - 8 teeth */}
    <path
      d="M40,12 L44,12 L46,17 L51,15 L54,13 L57,17 L53,21 L56,25 L61,24 L63,28 L59,31 L60,36 L65,37 L65,41 L60,43 L59,48 L63,51 L61,55 L56,53 L53,57 L57,61 L54,64 L51,62 L46,64 L44,68 L36,68 L34,64 L29,62 L26,64 L23,61 L27,57 L24,53 L19,55 L17,51 L21,48 L20,43 L15,41 L15,37 L20,36 L21,31 L17,28 L19,24 L24,25 L27,21 L23,17 L26,13 L29,15 L34,17 L36,12 Z"
      fill="#4caf50" stroke="#2e7d32" strokeWidth="2" strokeLinejoin="round"
    />
    {/* Inner circle */}
    <circle cx="40" cy="40" r="14" fill="white" stroke="#2e7d32" strokeWidth="2" />
    {/* Hard hat */}
    <path d="M30,42 L30,36 Q30,28 40,28 Q50,28 50,36 L50,42 Z" fill="#ff9800" stroke="#e65100" strokeWidth="1.8" strokeLinejoin="round" />
    {/* Hat brim */}
    <path d="M26,42 L54,42" stroke="#e65100" strokeWidth="2.5" strokeLinecap="round" />
    {/* Hat lines */}
    <path d="M36,36 L36,28" stroke="#e65100" strokeWidth="1" opacity="0.3" />
    <path d="M44,36 L44,28" stroke="#e65100" strokeWidth="1" opacity="0.3" />
    {/* Wrench */}
    <path
      d="M50,52 L60,62 Q62,64 60,66 Q58,68 56,66 L46,56"
      fill="#4caf50" stroke="#2e7d32" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"
    />
    <circle cx="60" cy="64" r="1.5" fill="white" />
  </svg>
);

// 4. FINANCE — Dollar sign with chart arrow
export const IconFinance = ({ size = 80 }: { size?: number }) => (
  <svg viewBox="0 0 80 80" width={size} height={size}>
    {/* Chart area background */}
    <path d="M14,65 L14,40 L38,55 L55,30 L68,65 Z" fill="#a8e6cf" opacity="0.5" />
    <path d="M14,65 L14,50 L38,60 L55,45 L68,65 Z" fill="#a8e6cf" opacity="0.7" />
    {/* Base line */}
    <path d="M10,65 L70,65" stroke="#059669" strokeWidth="2.5" strokeLinecap="round" />
    {/* Chart arrow line */}
    <path d="M14,58 L30,52 L42,56 L56,32" fill="none" stroke="#059669" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
    {/* Arrow head */}
    <path d="M52,38 L56,32 L62,36" fill="none" stroke="#059669" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
    {/* Dollar sign */}
    <text x="22" y="42" fontFamily="Arial, sans-serif" fontWeight="900" fontSize="28" fill="#059669" opacity="0.85">$</text>
    <text x="22" y="42" fontFamily="Arial, sans-serif" fontWeight="900" fontSize="28" fill="#a8e6cf" opacity="0.4">$</text>
  </svg>
);

// Preview component
const IconTest: React.FC = () => (
  <div style={{ display: 'flex', gap: 24, padding: 40, background: '#f0f4f8' }}>
    {[
      { Icon: IconEmail, label: 'Email' },
      { Icon: IconPhone, label: 'Phone' },
      { Icon: IconJobs, label: 'Jobs' },
      { Icon: IconFinance, label: 'Finance' },
    ].map(({ Icon, label }) => (
      <div key={label} style={{ width: 120, textAlign: 'center' }}>
        <div style={{ background: 'white', borderRadius: 16, padding: 16, boxShadow: '0 2px 8px rgba(0,0,0,0.08)' }}>
          <Icon size={88} />
        </div>
        <p style={{ marginTop: 8, fontSize: 14, fontWeight: 600, color: '#475569' }}>{label}</p>
      </div>
    ))}
  </div>
);

export default IconTest;
