import { motion } from 'motion/react';

/**
 * 香港天際線描邊插畫：環球貿易廣場、唐樓招牌、摩天輪、國金二期、中銀大廈、中環廣場、叮叮車
 * 以 pathLength 逐筆描出（像鋼筆速寫），顏色跟隨 currentColor，可配合暗黑模式。
 */
const P = {
  ground: 'M0,200 H1440',
  water: 'M0,212 C60,208 120,216 180,212 S300,208 360,212 S480,216 540,212 S660,208 720,212 S840,216 900,212 S1020,208 1080,212 S1200,216 1260,212 S1380,208 1440,212',
  // 環球貿易廣場 ICC
  icc: 'M150,200 V46 L160,34 H186 L196,46 V200 M160,34 V200 M186,34 V200 M150,90 H196 M150,140 H196',
  // 唐樓＋招牌
  tong1: 'M228,200 V120 H288 V200 M228,140 H288 M228,160 H288 M228,180 H288 M243,120 V200 M258,120 V200 M273,120 V200',
  tong2: 'M292,200 V100 H350 V200 M292,122 H350 M292,144 H350 M292,166 H350 M292,188 H350',
  signs: 'M288,128 H318 V146 H288 M350,108 H384 V132 H350 M350,150 H376 V176 H350 M266,150 H228',
  // 摩天輪
  wheelRim: 'M520,124 m-56,0 a56,56 0 1,0 112,0 a56,56 0 1,0 -112,0',
  wheelSpokes: 'M520,68 V180 M464,124 H576 M480,84 L560,164 M480,164 L560,84 M520,124 L496,200 M520,124 L544,200',
  // 匯豐總行（懸吊結構）
  hsbc: 'M610,200 V92 H676 V200 M610,92 L643,76 L676,92 M610,124 H676 M610,156 H676 M626,92 V200 M660,92 V200',
  // 國金二期 IFC2
  ifc: 'M724,200 V58 L732,50 V34 L740,26 V14 L746,8 L752,14 V26 L760,34 V50 L768,58 V200 M738,58 V200 M754,58 V200',
  // 中銀大廈 Bank of China
  boc: 'M820,200 V96 L852,32 L884,96 V200 M820,96 L884,160 M884,96 L820,160 M852,32 V200 M836,64 L868,64 M852,32 L852,10',
  // 中環廣場 Central Plaza
  cplaza: 'M926,200 V62 L944,40 L962,62 V200 M944,40 V18 M926,90 H962 M926,120 H962 M926,150 H962',
  towers: 'M984,200 V110 H1018 V200 M1022,200 V136 H1050 V200 M1056,200 V88 H1086 V200 M1070,88 V70',
  // 叮叮車
  tram: 'M1150,198 V150 H1252 V198 Z M1150,174 H1252 M1162,156 H1180 V168 H1162 Z M1188,156 H1206 V168 H1188 Z M1214,156 H1232 V168 H1214 Z M1162,180 H1180 V192 H1162 Z M1188,180 H1206 V192 H1188 Z M1214,180 H1232 V192 H1214 Z M1201,150 L1210,120 M1196,120 H1224',
  trolley: 'M1100,120 H1440',
  more: 'M1290,200 V124 H1330 V200 M1336,200 V100 H1372 V200 M1380,200 V140 H1420 V200'
};

const ORDER: Array<[keyof typeof P, number]> = [
  ['ground', 0],
  ['water', 0.2],
  ['icc', 0.3],
  ['tong1', 0.6],
  ['tong2', 0.75],
  ['signs', 1.2],
  ['wheelRim', 0.9],
  ['wheelSpokes', 1.4],
  ['hsbc', 1.1],
  ['ifc', 0.5],
  ['boc', 0.8],
  ['cplaza', 1.0],
  ['towers', 1.3],
  ['trolley', 1.5],
  ['tram', 1.6],
  ['more', 1.4]
];

export default function SkylineSketch({ className = '', delay = 0 }: { className?: string; delay?: number }) {
  return (
    <svg viewBox="0 0 1440 220" preserveAspectRatio="xMidYMax slice" className={className} fill="none" aria-hidden="true">
      {ORDER.map(([key, d]) => (
        <motion.path
          key={key}
          d={P[key]}
          stroke="currentColor"
          strokeWidth={key === 'ground' || key === 'water' ? 1 : 1.2}
          strokeLinecap="round"
          strokeLinejoin="round"
          vectorEffect="non-scaling-stroke"
          strokeOpacity={key === 'water' || key === 'trolley' ? 0.5 : 1}
          initial={{ pathLength: 0, opacity: 0 }}
          animate={{ pathLength: 1, opacity: 1 }}
          transition={{ pathLength: { delay: delay + d, duration: 2.2, ease: [0.45, 0, 0.25, 1] }, opacity: { delay: delay + d, duration: 0.3 } }}
        />
      ))}
      {/* 摩天輪慢慢轉 */}
      <motion.g
        style={{ originX: '520px', originY: '124px' }}
        animate={{ rotate: 360 }}
        transition={{ duration: 80, repeat: Infinity, ease: 'linear', delay: delay + 2.5 }}
      >
        {Array.from({ length: 12 }, (_, i) => {
          const a = (i / 12) * Math.PI * 2;
          return (
            <motion.circle
              key={i}
              cx={520 + Math.cos(a) * 56}
              cy={124 + Math.sin(a) * 56}
              r={4}
              stroke="currentColor"
              strokeWidth={1}
              vectorEffect="non-scaling-stroke"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: delay + 2 + i * 0.05 }}
            />
          );
        })}
      </motion.g>
      {/* 招牌上的一點朱紅 */}
      <motion.rect x={350} y={108} width={34} height={24} fill="var(--color-accent)" fillOpacity={0.18} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: delay + 2.6 }} />
      <motion.rect x={1150} y={150} width={102} height={48} fill="#00AB4E" fillOpacity={0.12} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: delay + 2.8 }} />
    </svg>
  );
}
