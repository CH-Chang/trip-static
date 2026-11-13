import { useState } from 'react';
import { MTR_LINES, MTR_STATIONS } from '../data/tripData';
import { getBearingAndDistance, getGoogleMapsDirectionsUrl } from '../utils/geo';
import { IconArrowUpRight, IconPin, IconWalk } from './Icons';

export default function MtrMapSection({ selectedStationId, onSelectStation }) {
  const [userCoords, setUserCoords] = useState(null);
  const [locStatus, setLocStatus] = useState('idle');
  const [locMessage, setLocMessage] = useState('');
  const [nearestInfo, setNearestInfo] = useState(null);

  const activeStation =
    MTR_STATIONS.find((s) => s.id === selectedStationId) ||
    MTR_STATIONS.find((s) => s.id === 'mong-kok-east');

  const computeNearestStation = (coords, label = '您的目前位置') => {
    let best = null;
    let bestMetrics = null;

    MTR_STATIONS.forEach((st) => {
      const metrics = getBearingAndDistance(coords, st.coords);
      const dist = Number(metrics.distanceKm);
      if (!best || dist < Number(bestMetrics.distanceKm)) {
        best = st;
        bestMetrics = metrics;
      }
    });

    if (best && bestMetrics) {
      setUserCoords(coords);
      setNearestInfo({ station: best, ...bestMetrics, sourceLabel: label });
      onSelectStation(best.id);
    }
  };

  const handleLocateMe = () => {
    if (!navigator.geolocation) {
      setLocStatus('error');
      setLocMessage('瀏覽器不支援 GPS 定位，可使用右側模擬位置測試。');
      return;
    }

    setLocStatus('loading');
    setLocMessage('正在取得 GPS 定位...');

    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const coords = [pos.coords.latitude, pos.coords.longitude];
        setLocStatus('success');
        computeNearestStation(coords, '真實 GPS 定位');
        const distCheck = getBearingAndDistance(coords, [22.302, 114.165]);
        if (Number(distCheck.distanceKm) > 80) {
          setLocMessage(`目前距香港約 ${distCheck.distanceKm} km，可點右側模擬香港位置測試。`);
        } else {
          setLocMessage('已鎖定目前位置，為您標出最近港鐵站。');
        }
      },
      () => {
        setLocStatus('error');
        setLocMessage('無法取得定位權限，可使用右側模擬位置體驗。');
      },
      { enableHighAccuracy: true, timeout: 8000 }
    );
  };

  return (
    <div className="space-y-5">
      {/* 定位控制列 */}
      <div className="p-3.5 bg-[#F4EFE6] border border-[#1C1B19]/20 flex flex-col gap-3">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <button
            onClick={handleLocateMe}
            disabled={locStatus === 'loading'}
            className="px-3.5 py-2 bg-[#A63429] text-[#F4EFE6] hover:bg-[#8A2920] transition font-mono text-xs font-bold tracking-wider cursor-pointer disabled:opacity-60 inline-flex items-center gap-1.5"
          >
            <IconPin className="w-3.5 h-3.5" />
            <span>{locStatus === 'loading' ? '定位中...' : '定位最近港鐵站'}</span>
          </button>

          <div className="flex flex-wrap items-center gap-1.5">
            <span className="text-[11px] font-mono text-[#5A554C]">模擬：</span>
            {[
              { label: '尖沙咀海濱', coords: [22.2935, 114.1718] },
              { label: '中環蘭桂坊', coords: [22.2809, 114.1556] },
              { label: '旺角女人街', coords: [22.3188, 114.1704] }
            ].map((preset) => (
              <button
                key={preset.label}
                onClick={() => {
                  setLocStatus('success');
                  setLocMessage(`已模擬位於「${preset.label}」`);
                  computeNearestStation(preset.coords, preset.label);
                }}
                className="px-2 py-1 text-[11px] font-mono border border-[#1C1B19]/20 bg-[#FAF6EE] hover:bg-[#1B4332] hover:text-[#F4EFE6] transition cursor-pointer"
              >
                {preset.label}
              </button>
            ))}
          </div>
        </div>

        {locMessage && <p className="text-xs text-[#4A463F]">{locMessage}</p>}
      </div>

      {/* 路線圖例 */}
      <div className="flex flex-wrap gap-1.5">
        {MTR_LINES.map((line) => (
          <span
            key={line.id}
            className="inline-flex items-center gap-1.5 px-2 py-0.5 text-[10px] font-mono bg-[#F4EFE6] border border-[#1C1B19]/15"
          >
            <span className="w-2.5 h-1.5 inline-block" style={{ backgroundColor: line.color }} />
            <span>{line.name.split(' ')[0]}</span>
          </span>
        ))}
      </div>

      {/* SVG 港鐵路線圖 */}
      <div className="bg-[#F4EFE6] border border-[#1C1B19]/20 p-3 overflow-x-auto">
        <svg viewBox="0 0 820 430" className="w-full min-w-[540px] h-auto select-none">
          <path
            d="M 0 305 Q 240 290, 480 310 T 820 300 L 820 335 Q 540 345, 300 325 T 0 335 Z"
            fill="#5B9BD5"
            fillOpacity="0.1"
          />
          <text x="675" y="318" fontSize="10" fill="#5A554C" opacity="0.7" fontFamily="IBM Plex Mono, monospace">
            VICTORIA HARBOUR
          </text>

          {MTR_LINES.map((line) => (
            <polyline
              key={line.id}
              points={line.points.map((p) => p.join(',')).join(' ')}
              fill="none"
              stroke={line.color}
              strokeWidth="6"
              strokeLinecap="round"
              strokeLinejoin="round"
              opacity="0.88"
            />
          ))}

          {MTR_STATIONS.map((st) => {
            const isSelected = activeStation?.id === st.id;
            const isNearest = nearestInfo?.station?.id === st.id;
            const isLabelLeft = [
              'prince-edward',
              'mong-kok',
              'yau-ma-tei',
              'jordan',
              'tsim-sha-tsui',
              'kowloon'
            ].includes(st.id);
            const isLabelBottom = [
              'sheung-wan',
              'central',
              'admiralty',
              'wan-chai',
              'causeway-bay',
              'disneyland'
            ].includes(st.id);

            let textX = st.x + 12;
            let textY = st.y + 4;
            let anchor = 'start';
            if (isLabelLeft) {
              textX = st.x - 13;
              anchor = 'end';
            } else if (isLabelBottom) {
              textX = st.x;
              textY = st.y + 22;
              anchor = 'middle';
            } else if (st.id === 'hong-kong') {
              textX = st.x - 12;
              textY = st.y - 14;
              anchor = 'end';
            } else if (st.id === 'exhibition') {
              textX = st.x + 12;
              textY = st.y - 6;
              anchor = 'start';
            }

            return (
              <g key={st.id} onClick={() => onSelectStation(st.id)} className="cursor-pointer">
                {st.isBase && (
                  <circle cx={st.x} cy={st.y} r="14" fill="none" stroke="#1B4332" strokeWidth="2" strokeDasharray="3 3" />
                )}
                {isNearest && (
                  <circle cx={st.x} cy={st.y} r="17" fill="#A63429" fillOpacity="0.18" stroke="#A63429" strokeWidth="1.5" />
                )}
                {isSelected && <circle cx={st.x} cy={st.y} r="12" fill="#A63429" fillOpacity="0.22" />}
                <circle
                  cx={st.x}
                  cy={st.y}
                  r={isSelected ? 8 : 6}
                  fill="#FAF6EE"
                  stroke={isSelected ? '#A63429' : '#1C1B19'}
                  strokeWidth={isSelected ? 3 : 2}
                />
                <text
                  x={textX}
                  y={textY}
                  textAnchor={anchor}
                  fontSize={isSelected ? '12' : '11'}
                  fontWeight={isSelected || st.isBase ? '700' : '500'}
                  fill={isSelected ? '#A63429' : '#1C1B19'}
                >
                  {st.name.split(' ')[0]}
                  {st.isBase ? ' ★' : ''}
                </text>
              </g>
            );
          })}
        </svg>
      </div>

      {/* 選中車站詳情卡 */}
      <div className="bg-[#1B4332] text-[#F4EFE6] p-5 border border-[#1B4332] space-y-3">
        <div className="flex flex-wrap items-center justify-between gap-2 pb-2.5 border-b border-[#F4EFE6]/20">
          <div className="flex flex-wrap gap-1.5">
            {activeStation.lines.map((ln) => (
              <span key={ln} className="px-2 py-0.5 text-[10px] font-mono border border-[#F4EFE6]/30">
                {ln}
              </span>
            ))}
          </div>
          {nearestInfo?.station?.id === activeStation.id ? (
            <span className="px-2 py-0.5 text-[10px] font-mono bg-[#A63429] text-white font-bold">
              最近車站 ・ {nearestInfo.distanceKm} km
            </span>
          ) : activeStation.isBase ? (
            <span className="px-2 py-0.5 text-[10px] font-mono bg-[#D4C5A9] text-[#1C1B19] font-bold">
              帝京酒店基地
            </span>
          ) : null}
        </div>

        <h3 className="font-serif text-xl font-bold">{activeStation.name}</h3>

        {nearestInfo?.station?.id === activeStation.id && (
          <p className="text-xs text-[#D4C5A9]">
            位於「{nearestInfo.sourceLabel}」{nearestInfo.dirLabel}方（{nearestInfo.bearingDeg}°），直線距離約{' '}
            <strong className="text-white">{nearestInfo.distanceKm} km</strong>
          </p>
        )}

        <p className="text-xs sm:text-sm text-[#F4EFE6]/90 leading-relaxed">{activeStation.fromHotel}</p>
        <p className="text-xs text-[#D4C5A9]">周邊景點：{activeStation.nearby}</p>

        <div className="flex flex-col sm:flex-row gap-2 pt-2">
          {userCoords && (
            <a
              href={getGoogleMapsDirectionsUrl(userCoords, activeStation.coords, 'walking')}
              target="_blank"
              rel="noopener noreferrer"
              className="flex-1 py-2 px-3 bg-[#A63429] text-[#F4EFE6] hover:bg-[#8A2920] transition font-mono text-xs font-bold flex items-center justify-center gap-1.5"
            >
              <IconWalk />
              <span>步行導航前往此站</span>
            </a>
          )}
          <a
            href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
              `港鐵${activeStation.name.split(' ')[0]}站`
            )}`}
            target="_blank"
            rel="noopener noreferrer"
            className="flex-1 py-2 px-3 bg-[#F4EFE6] text-[#1C1B19] hover:bg-[#D4C5A9] transition font-mono text-xs font-bold flex items-center justify-center gap-1.5"
          >
            <IconArrowUpRight />
            <span>Google Maps 車站出口</span>
          </a>
        </div>
      </div>
    </div>
  );
}
