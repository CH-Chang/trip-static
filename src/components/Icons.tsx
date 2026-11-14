import type React from 'react';
interface IconProps {
  className?: string;
}

export function IconPin({ className = 'w-3.5 h-3.5' }: IconProps) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 21s-6-5.33-6-10a6 6 0 1 1 12 0c0 4.67-6 10-6 10z" />
      <circle cx="12" cy="11" r="2.2" />
    </svg>
  );
}

export function IconClock({ className = 'w-3.5 h-3.5' }: IconProps) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="9" />
      <path d="M12 7v5l3 2" />
    </svg>
  );
}

export function IconSwap({ className = 'w-3 h-3' }: IconProps) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M7 16V4m0 0L3 8m4-4l4 4M17 8v12m0 0l4-4m-4 4l-4-4" />
    </svg>
  );
}

export function IconTransit({ className = 'w-3.5 h-3.5' }: IconProps) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <rect x="5" y="4" width="14" height="14" rx="2" />
      <path d="M5 12h14M9 18l-2 3M15 18l2 3M8.5 15h.01M15.5 15h.01" />
    </svg>
  );
}

export function IconWalk({ className = 'w-3.5 h-3.5' }: IconProps) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="13" cy="4.5" r="1.5" />
      <path d="M10 21l2-6-3-3 2-4 3 1 2 3M7 17l2-3" />
    </svg>
  );
}

export function IconArrowUpRight({ className = 'w-3 h-3' }: IconProps) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M7 17L17 7M9 7h8v8" />
    </svg>
  );
}

function StrokeIcon({ className = 'w-4 h-4', children }: IconProps & { children: React.ReactNode }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      {children}
    </svg>
  );
}

export const IconPlus = (p: IconProps) => <StrokeIcon {...p}><path d="M12 5v14M5 12h14" /></StrokeIcon>;
export const IconMinus = (p: IconProps) => <StrokeIcon {...p}><path d="M5 12h14" /></StrokeIcon>;
export const IconSearch = (p: IconProps) => <StrokeIcon {...p}><circle cx="11" cy="11" r="6.5" /><path d="M20 20l-4.2-4.2" /></StrokeIcon>;
export const IconClose = (p: IconProps) => <StrokeIcon {...p}><path d="M6 6l12 12M18 6L6 18" /></StrokeIcon>;
export const IconFit = (p: IconProps) => <StrokeIcon {...p}><path d="M4 9V4h5M20 9V4h-5M4 15v5h5M20 15v5h-5" /></StrokeIcon>;
export const IconExpand = (p: IconProps) => <StrokeIcon {...p}><path d="M14 4h6v6M10 20H4v-6M20 4l-7 7M4 20l7-7" /></StrokeIcon>;
export const IconShrink = (p: IconProps) => <StrokeIcon {...p}><path d="M4 14h6v6M20 10h-6V4M10 14l-7 7M14 10l7-7" /></StrokeIcon>;
export const IconDownload = (p: IconProps) => <StrokeIcon {...p}><path d="M12 4v11m0 0l-4.5-4.5M12 15l4.5-4.5M5 20h14" /></StrokeIcon>;
export const IconLayers = (p: IconProps) => <StrokeIcon {...p}><path d="M12 3l9 5-9 5-9-5 9-5z" /><path d="M3 13l9 5 9-5" /></StrokeIcon>;
export const IconCrosshair = (p: IconProps) => (
  <StrokeIcon {...p}><circle cx="12" cy="12" r="7" /><circle cx="12" cy="12" r="2" /><path d="M12 2v3M12 19v3M2 12h3M19 12h3" /></StrokeIcon>
);
export const IconNavArrow = (p: IconProps) => (
  <svg className={p.className ?? 'w-4 h-4'} viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M12 2l7 19-7-4-7 4 7-19z" /></svg>
);
