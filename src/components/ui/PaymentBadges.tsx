import type { PaymentInfo, PaymentMethod } from '../../types/trip';

const LABEL: Record<PaymentMethod, string> = {
  cash: '現金',
  octopus: '八達通',
  credit: '信用卡',
  alipay: '支付寶',
  wechat: '微信支付',
  payme: 'PayMe',
  applepay: 'Apple Pay'
};

/** 店家付款方式標籤；未填時顯示「待查」 */
export default function PaymentBadges({ payment, dark = false }: { payment?: PaymentInfo; dark?: boolean }) {
  const muted = dark ? 'text-white/55 border-white/25' : 'text-ink-soft border-ink/20';
  if (payment && payment.methods.length === 0 && payment.note) {
    return <span className={`text-[11px] ${dark ? 'text-white/60' : 'text-ink-soft'}`}>{payment.note}</span>;
  }
  if (!payment || payment.methods.length === 0) {
    return <span className={`inline-flex items-center px-1.5 py-0.5 border border-dashed text-[10px] ${muted}`}>付款方式待查</span>;
  }
  const cashOnly = payment.methods.length === 1 && payment.methods[0] === 'cash';
  return (
    <span className="inline-flex flex-wrap items-center gap-1">
      <span className={`text-[10px] font-mono ${dark ? 'text-white/50' : 'text-ink-soft'}`}>付款</span>
      {payment.methods.map((m) => (
        <span
          key={m}
          className={`px-1.5 py-0.5 text-[10px] font-bold border ${
            m === 'cash' && cashOnly
              ? 'bg-accent text-white border-accent'
              : m === 'credit'
              ? 'bg-jade text-white border-jade'
              : dark
              ? 'border-white/30 text-white'
              : 'border-ink/25 text-ink bg-card'
          }`}
        >
          {cashOnly ? '僅收現金' : LABEL[m]}
        </span>
      ))}
      {payment.note && <span className={`text-[10px] ${dark ? 'text-white/55' : 'text-ink-soft'}`}>{payment.note}</span>}
    </span>
  );
}
