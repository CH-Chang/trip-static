import { useEffect, useState } from 'react';
import { motion } from 'motion/react';

interface HandwrittenTextProps {
  text: string;
  /** 開始書寫前的延遲（秒） */
  delay?: number;
  /** 每個字寫多久（秒） */
  perChar?: number;
  className?: string;
  color?: string;
  glow?: string;
  /** 字與字之間錯開多少（秒） */
  stagger?: number;
  weight?: number;
}

/**
 * 手寫描字：每個字先以筆觸描出外框（stroke-dashoffset），再暈染填色＋柔光。
 * 等字型（霞鶩文楷）載入後才開始，避免用到替代字型描錯筆畫。
 */
export default function HandwrittenText({
  text,
  delay = 0,
  perChar = 0.9,
  stagger = 0.22,
  className = '',
  color = '#F7F5F0',
  glow = 'rgba(255,190,110,0.85)',
  weight = 700
}: HandwrittenTextProps) {
  const [ready, setReady] = useState(false);

  useEffect(() => {
    let alive = true;
    const fonts = (document as Document & { fonts?: FontFaceSet }).fonts;
    const go = () => alive && setReady(true);
    if (fonts?.load) {
      Promise.race([fonts.load(`${weight} 1em "Noto Serif TC"`, text), new Promise((r) => setTimeout(r, 1500))]).then(go, go);
    } else go();
    return () => {
      alive = false;
    };
  }, [text, weight]);

  const chars = Array.from(text);
  return (
    <span className={`inline-flex flex-wrap ${className}`} aria-label={text} role="text">
      {chars.map((ch, i) => {
        const d = delay + i * stagger;
        const isPunct = /[，。、・！？,.!?]/.test(ch);
        return (
          <svg
            key={`${ch}-${i}`}
            viewBox="0 0 100 110"
            className="inline-block overflow-visible"
            style={{ width: isPunct ? '0.7em' : '1em', height: '1.1em' }}
            aria-hidden="true"
          >
            {ready && (
              <>
                {/* 筆觸外框 */}
                <motion.text
                  x={isPunct ? 30 : 50}
                  y="88"
                  textAnchor="middle"
                  fontSize="96"
                  fontWeight={weight}
                  fill="transparent"
                  style={{ fontFamily: 'var(--font-hand)', stroke: color }}
                  strokeWidth="1.1"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeDasharray="1400"
                  initial={{ strokeDashoffset: 1400, opacity: 1 }}
                  animate={{ strokeDashoffset: 0, opacity: [1, 1, 0] }}
                  transition={{
                    strokeDashoffset: { delay: d, duration: perChar, ease: [0.45, 0, 0.25, 1] },
                    opacity: { delay: d, duration: perChar + 0.6, times: [0, 0.75, 1] }
                  }}
                >
                  {ch}
                </motion.text>
                {/* 墨水暈開填色 */}
                <motion.text
                  x={isPunct ? 30 : 50}
                  y="88"
                  textAnchor="middle"
                  fontSize="96"
                  fontWeight={weight}
                  style={{ fontFamily: 'var(--font-hand)', fill: color }}
                  initial={{ opacity: 0, filter: `drop-shadow(0 0 14px ${glow})` }}
                  animate={{ opacity: 1, filter: `drop-shadow(0 0 6px ${glow})` }}
                  transition={{ delay: d + perChar * 0.6, duration: 0.8, ease: 'easeOut' }}
                >
                  {ch}
                </motion.text>
              </>
            )}
          </svg>
        );
      })}
    </span>
  );
}
