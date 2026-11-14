import { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import { AnimatePresence, motion } from 'motion/react';
import type { PhotoSpot } from '../../types/trip';
import { IconArrowUpRight, IconClose } from '../Icons';

export const IG_GRADIENT = 'linear-gradient(45deg, #F58529 0%, #FEDA77 25%, #DD2A7B 55%, #8134AF 80%, #515BD4 100%)';

/** 熱門拍照打卡點標籤 */
export function PhotoSpotBadge({ size = 'md' }: { size?: 'sm' | 'md' }) {
  return (
    <span
      className={`inline-flex items-center gap-1 text-white font-bold shrink-0 ${size === 'sm' ? 'px-1 text-[9px]' : 'px-2 py-0.5 text-[10px]'}`}
      style={{ background: IG_GRADIENT }}
    >
      <IconInstagram className={size === 'sm' ? 'w-2.5 h-2.5' : 'w-3 h-3'} />
      熱門打卡點
    </span>
  );
}

/** IG 相機圖示（描邊） */
export function IconInstagram({ className = 'w-4 h-4' }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <rect x="3" y="3" width="18" height="18" rx="5" />
      <circle cx="12" cy="12" r="4.2" />
      <circle cx="17.4" cy="6.6" r="0.9" fill="currentColor" stroke="none" />
    </svg>
  );
}

const Heart = ({ filled }: { filled: boolean }) => (
  <svg className="w-6 h-6" viewBox="0 0 24 24" fill={filled ? '#ED4956' : 'none'} stroke={filled ? '#ED4956' : 'currentColor'} strokeWidth="1.8" strokeLinejoin="round" aria-hidden="true">
    <path d="M12 20.5s-7.5-4.6-9.2-9.3C1.6 7.8 3.9 4.5 7.3 4.5c2 0 3.6 1.1 4.7 2.7 1.1-1.6 2.7-2.7 4.7-2.7 3.4 0 5.7 3.3 4.5 6.7-1.7 4.7-9.2 9.3-9.2 9.3z" />
  </svg>
);
const Comment = () => (
  <svg className="w-6 h-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinejoin="round" aria-hidden="true">
    <path d="M20.5 11.5a8.5 8.5 0 0 1-12.6 7.4L3.5 20.5l1.6-4.2A8.5 8.5 0 1 1 20.5 11.5z" />
  </svg>
);
const Share = () => (
  <svg className="w-6 h-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinejoin="round" aria-hidden="true">
    <path d="M21.5 3 10.6 13.9M21.5 3l-7 18.5-3.9-7.6L3 11z" />
  </svg>
);
const Bookmark = ({ filled }: { filled: boolean }) => (
  <svg className="w-6 h-6" viewBox="0 0 24 24" fill={filled ? 'currentColor' : 'none'} stroke="currentColor" strokeWidth="1.8" strokeLinejoin="round" aria-hidden="true">
    <path d="M19 21l-7-5-7 5V4.5A1.5 1.5 0 0 1 6.5 3h11A1.5 1.5 0 0 1 19 4.5z" />
  </svg>
);

interface PhotoInspoProps {
  spot: PhotoSpot;
  /** 景點名稱與照片，用來組成 IG 貼文卡片 */
  title: string;
  location?: string;
  image?: string;
}

/**
 * 「看別人怎麼拍」：IG 貼文風格的對話框
 * IG 沒有可供靜態網站使用的公開搜尋 API（Basic Display API 已於 2024-12 停用，
 * Graph API 標籤搜尋需商業帳號與審核且不能放前端），所以卡片顯示景點照片與拍攝建議，
 * 再由按鈕開啟 IG 標籤頁；手機有安裝 IG 時會直接在 App 中開啟。
 */
export default function PhotoInspo({ spot, title, location, image }: PhotoInspoProps) {
  const [open, setOpen] = useState(false);
  return (
    <>
      <motion.button
        whileTap={{ scale: 0.95 }}
        onClick={() => setOpen(true)}
        className="group h-8 pl-1 pr-3 text-[12px] border border-ink/15 bg-card inline-flex items-center gap-2 cursor-pointer hover:border-transparent hover:text-white transition-colors relative overflow-hidden"
      >
        <span className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity" style={{ background: IG_GRADIENT }} />
        <span className="relative w-6 h-6 rounded-[7px] flex items-center justify-center text-white" style={{ background: IG_GRADIENT }}>
          <IconInstagram className="w-3.5 h-3.5" />
        </span>
        <span className="relative">看別人怎麼拍</span>
      </motion.button>
      {createPortal(
        <AnimatePresence>{open && <InspoDialog spot={spot} title={title} location={location} image={image} onClose={() => setOpen(false)} />}</AnimatePresence>,
        document.body
      )}
    </>
  );
}

function InspoDialog({ spot, title, location, image, onClose }: PhotoInspoProps & { onClose: () => void }) {
  const [liked, setLiked] = useState(false);
  const [saved, setSaved] = useState(false);
  const [imgOk, setImgOk] = useState(Boolean(image));
  const mainTag = spot.hashtags[0];

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        e.stopImmediatePropagation();
        onClose();
      }
    };
    window.addEventListener('keydown', onKey, true);
    return () => window.removeEventListener('keydown', onKey, true);
  }, [onClose]);

  const igUrl = (tag: string) => `https://www.instagram.com/explore/tags/${encodeURIComponent(tag)}/`;
  const others = [
    { label: '小紅書', sub: '免登入看筆記', url: `https://www.xiaohongshu.com/search_result?keyword=${encodeURIComponent(spot.keyword)}`, color: '#FF2442' },
    { label: 'Google 圖片', sub: '快速看構圖', url: `https://www.google.com/search?tbm=isch&q=${encodeURIComponent(spot.keyword)}`, color: '#4285F4' }
  ];

  return (
    <motion.div className="fixed inset-0 z-[90] flex items-end sm:items-center justify-center" role="dialog" aria-modal="true" aria-label={`${title} 拍照靈感`}>
      <motion.div className="absolute inset-0 bg-black/55 backdrop-blur-[3px]" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={onClose} />

      <motion.article
        initial={{ opacity: 0, y: 40, scale: 0.96 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, y: 30, scale: 0.97 }}
        transition={{ type: 'spring', stiffness: 360, damping: 32 }}
        className="relative w-full sm:w-[420px] max-h-[92dvh] overflow-y-auto bg-white text-[#262626] sm:rounded-xl rounded-t-2xl shadow-2xl pb-[env(safe-area-inset-bottom)]"
      >
        {/* 貼文頂部：帳號列 */}
        <header className="flex items-center gap-3 px-3.5 py-3">
          <span className="p-[2px] rounded-full shrink-0" style={{ background: IG_GRADIENT }}>
            <span className="block p-[2px] rounded-full bg-white">
              <span className="w-8 h-8 rounded-full bg-[#2B2A28] text-white font-serif text-sm flex items-center justify-center">港</span>
            </span>
          </span>
          <div className="min-w-0 flex-1 leading-tight">
            <p className="text-[13px] font-semibold truncate">{title}</p>
            {location && <p className="text-[11px] text-[#737373] truncate">{location}</p>}
          </div>
          <button onClick={onClose} aria-label="關閉" className="w-8 h-8 rounded-full flex items-center justify-center hover:bg-black/5 cursor-pointer">
            <IconClose className="w-4 h-4" />
          </button>
        </header>

        {/* 照片：雙擊按讚 */}
        <div className="relative aspect-square bg-[#efefef] overflow-hidden select-none" onDoubleClick={() => setLiked(true)}>
          {imgOk && image ? (
            <img src={image} alt={title} draggable={false} onError={() => setImgOk(false)} className="w-full h-full object-cover" />
          ) : (
            <div className="w-full h-full flex flex-col items-center justify-center text-white gap-2" style={{ background: IG_GRADIENT }}>
              <IconInstagram className="w-12 h-12" />
              <span className="text-sm font-semibold">#{mainTag}</span>
            </div>
          )}
          <AnimatePresence>
            {liked && (
              <motion.span
                key="burst"
                initial={{ scale: 0, opacity: 0 }}
                animate={{ scale: [0, 1.25, 1], opacity: [0, 1, 0] }}
                transition={{ duration: 0.9, times: [0, 0.35, 1] }}
                className="absolute inset-0 flex items-center justify-center pointer-events-none"
              >
                <svg className="w-24 h-24 drop-shadow-lg" viewBox="0 0 24 24" fill="white" aria-hidden="true">
                  <path d="M12 20.5s-7.5-4.6-9.2-9.3C1.6 7.8 3.9 4.5 7.3 4.5c2 0 3.6 1.1 4.7 2.7 1.1-1.6 2.7-2.7 4.7-2.7 3.4 0 5.7 3.3 4.5 6.7-1.7 4.7-9.2 9.3-9.2 9.3z" />
                </svg>
              </motion.span>
            )}
          </AnimatePresence>
          <span className="absolute bottom-2 right-2 px-2 py-0.5 rounded-full bg-black/55 text-white text-[10px]">景點參考照</span>
        </div>

        {/* 互動列 */}
        <div className="flex items-center gap-4 px-3.5 pt-3">
          <motion.button whileTap={{ scale: 0.8 }} animate={liked ? { scale: [1, 1.25, 1] } : {}} onClick={() => setLiked((v) => !v)} aria-label="喜歡" className="cursor-pointer">
            <Heart filled={liked} />
          </motion.button>
          <a href={igUrl(mainTag)} target="_blank" rel="noopener noreferrer" aria-label="到 IG 看留言">
            <Comment />
          </a>
          <button
            onClick={() => navigator.share?.({ title, text: `#${mainTag} ${spot.tip ?? ''}`, url: igUrl(mainTag) }).catch(() => undefined)}
            aria-label="分享"
            className="cursor-pointer"
          >
            <Share />
          </button>
          <motion.button whileTap={{ scale: 0.8 }} onClick={() => setSaved((v) => !v)} aria-label="收藏" className="ml-auto cursor-pointer">
            <Bookmark filled={saved} />
          </motion.button>
        </div>

        {/* 內文 */}
        <div className="px-3.5 pt-2 pb-3 space-y-1.5">
          <p className="text-[13px] font-semibold">拍攝靈感</p>
          {spot.tip && <p className="text-[13px] leading-relaxed">{spot.tip}</p>}
          <p className="text-[13px] text-[#00376B] flex flex-wrap gap-x-2">
            {spot.hashtags.map((t) => (
              <a key={t} href={igUrl(t)} target="_blank" rel="noopener noreferrer" className="hover:underline">
                #{t}
              </a>
            ))}
          </p>
        </div>

        {/* 行動按鈕 */}
        <div className="px-3.5 pb-4 space-y-2 border-t border-black/5 pt-3">
          <a
            href={igUrl(mainTag)}
            target="_blank"
            rel="noopener noreferrer"
            className="h-11 rounded-lg text-white text-[14px] font-semibold flex items-center justify-center gap-2 hover:brightness-110 active:scale-[0.98] transition"
            style={{ background: IG_GRADIENT }}
          >
            <IconInstagram className="w-5 h-5" />在 Instagram 看 #{mainTag}
          </a>
          <div className="grid grid-cols-2 gap-2">
            {others.map((l) => (
              <a
                key={l.url}
                href={l.url}
                target="_blank"
                rel="noopener noreferrer"
                className="h-11 rounded-lg border border-black/10 px-3 flex items-center gap-2 hover:bg-black/[0.03] transition-colors"
              >
                <span className="w-2.5 h-2.5 rounded-full shrink-0" style={{ backgroundColor: l.color }} />
                <span className="min-w-0 leading-tight">
                  <span className="block text-[13px] font-semibold">{l.label}</span>
                  <span className="block text-[10px] text-[#737373]">{l.sub}</span>
                </span>
                <IconArrowUpRight className="w-3 h-3 ml-auto text-[#737373]" />
              </a>
            ))}
          </div>
          <p className="text-[10px] text-[#737373] text-center pt-1">手機有安裝 IG 會直接開 App；IG 網頁版通常要先登入才能看標籤。</p>
        </div>
      </motion.article>
    </motion.div>
  );
}
