import { useEffect, useMemo, useRef, useState } from 'react';
import L from 'leaflet';
import { HOTEL_COORDS, ITINERARY_DAYS } from '../data/tripData';
import { getBearingAndDistance, getGoogleMapsDirectionsUrl, getGoogleMapsUrl } from '../utils/geo';
import { IconArrowUpRight, IconPin, IconSwap, IconTransit } from './Icons';

function resolveEffectiveItem(item, altSelections) {
  const altId = altSelections?.[item.id];
  if (altId && item.alternatives) {
    const found = item.alternatives.find((a) => a.id === altId);
    if (found) {
      return {
        ...item,
        title: found.title,
        location: found.location,
        coords: found.coords,
        googleQuery: found.googleQuery,
        description: found.description,
        isAlternativeActive: true
      };
    }
  }
  return { ...item, isAlternativeActive: false };
}

export default function MapWorkspace({
  selectedDay,
  onSelectDay,
  selectedItemId,
  onSelectItemId,
  altSelections,
  onToggleAlternative,
  onJumpToMtr,
  tripStatus,
  effectiveNowMs
}) {
  const mapContainerRef = useRef(null);
  const mapRef = useRef(null);
  const layerGroupRef = useRef(null);

  const [drawerOpen, setDrawerOpen] = useState(true);
  const [spotCardOpen, setSpotCardOpen] = useState(true);

  const dayObj = useMemo(
    () => ITINERARY_DAYS.find((d) => d.day === selectedDay) || ITINERARY_DAYS[0],
    [selectedDay]
  );

  const dayItems = useMemo(
    () => dayObj.items.map((it) => resolveEffectiveItem(it, altSelections)),
    [dayObj, altSelections]
  );

  const hkItems = useMemo(() => dayItems.filter((it) => it.isHK), [dayItems]);

  const rawSelectedItem = useMemo(() => {
    for (const d of ITINERARY_DAYS) {
      const found = d.items.find((i) => i.id === selectedItemId);
      if (found) return found;
    }
    return hkItems[0] || dayItems[0] || null;
  }, [selectedItemId, hkItems, dayItems]);

  const selectedItem = useMemo(() => {
    if (!rawSelectedItem) return null;
    return resolveEffectiveItem(rawSelectedItem, altSelections);
  }, [rawSelectedItem, altSelections]);

  const bearingInfo = useMemo(() => {
    if (!selectedItem || !selectedItem.isHK) return null;
    return getBearingAndDistance(HOTEL_COORDS, selectedItem.coords);
  }, [selectedItem]);

  useEffect(() => {
    if (!mapContainerRef.current || mapRef.current) return;

    const map = L.map(mapContainerRef.current, {
      center: [22.304, 114.165],
      zoom: 13,
      zoomControl: false
    });

    L.control.zoom({ position: 'bottomright' }).addTo(map);

    L.tileLayer('https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png', {
      attribution:
        '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> &copy; <a href="https://carto.com/attribution/">CARTO</a>',
      subdomains: 'abcd',
      maxZoom: 19
    }).addTo(map);

    mapRef.current = map;
    layerGroupRef.current = L.layerGroup().addTo(map);

    setTimeout(() => map.invalidateSize(), 100);

    return () => {
      map.remove();
      mapRef.current = null;
      layerGroupRef.current = null;
    };
  }, []);

  useEffect(() => {
    const map = mapRef.current;
    const group = layerGroupRef.current;
    if (!map || !group) return;

    group.clearLayers();

    // 帝京酒店基地
    const hotelIcon = L.divIcon({
      className: '',
      html: `<div style="background:#1B4332;color:#F4EFE6;border:2px solid #FAF6EE;padding:3px 8px;font-family:'IBM Plex Mono',monospace;font-size:11px;font-weight:700;white-space:nowrap;box-shadow:3px 3px 0 rgba(28,27,25,0.25);">BASE ・ 帝京酒店</div>`,
      iconSize: [116, 26],
      iconAnchor: [58, 13]
    });
    L.marker(HOTEL_COORDS, { icon: hotelIcon, zIndexOffset: 500 })
      .addTo(group)
      .bindPopup('<strong>帝京酒店 Royal Plaza Hotel</strong><br/>旺角東站 D 出口・三天基地');

    // 當日路線軌跡
    if (hkItems.length > 1) {
      L.polyline(
        hkItems.map((it) => it.coords),
        { color: '#1B4332', weight: 3, opacity: 0.72 }
      ).addTo(group);
    }

    // 當日景點編號標記
    hkItems.forEach((item, idx) => {
      const isSelected = selectedItem?.id === item.id;
      const isLive = tripStatus.currentItem?.id === item.id;

      const markerIcon = L.divIcon({
        className: '',
        html: `<div style="width:30px;height:30px;display:flex;align-items:center;justify-content:center;font-family:'IBM Plex Mono',monospace;font-size:12px;font-weight:700;border:2px solid #FAF6EE;background:${
          isSelected || isLive ? '#A63429' : item.districtColor
        };color:#FAF6EE;box-shadow:0 3px 10px rgba(0,0,0,0.28);transform:${
          isSelected ? 'scale(1.25)' : 'scale(1)'
        };transition:transform 0.2s;">${idx + 1}</div>`,
        iconSize: [30, 30],
        iconAnchor: [15, 15]
      });

      const marker = L.marker(item.coords, {
        icon: markerIcon,
        zIndexOffset: isSelected ? 900 : 100
      }).addTo(group);

      marker.on('click', () => {
        onSelectItemId(item.id);
        setSpotCardOpen(true);
      });
      marker.bindTooltip(`${idx + 1}. ${item.title}`, { direction: 'top', offset: [0, -12] });
    });

    // 方位線 + 鏡頭聚焦
    if (selectedItem && selectedItem.isHK) {
      const isSameAsHotel =
        Math.abs(selectedItem.coords[0] - HOTEL_COORDS[0]) < 0.001 &&
        Math.abs(selectedItem.coords[1] - HOTEL_COORDS[1]) < 0.001;

      if (!isSameAsHotel) {
        L.polyline([HOTEL_COORDS, selectedItem.coords], {
          color: '#A63429',
          weight: 2,
          dashArray: '6 6',
          opacity: 0.85
        }).addTo(group);
      }

      map.flyTo(selectedItem.coords, 14, { duration: 0.7 });
    } else if (hkItems.length > 0) {
      const bounds = L.latLngBounds([HOTEL_COORDS, ...hkItems.map((i) => i.coords)]);
      map.fitBounds(bounds.pad(0.2), { animate: true });
    }
  }, [hkItems, selectedItem, tripStatus.currentItem, onSelectItemId]);

  const handleFitDayRoute = () => {
    const map = mapRef.current;
    if (!map || hkItems.length === 0) return;
    const bounds = L.latLngBounds([HOTEL_COORDS, ...hkItems.map((i) => i.coords)]);
    map.fitBounds(bounds.pad(0.22), { animate: true });
  };

  return (
    <div className="relative w-full h-[calc(100vh-3.75rem)] overflow-hidden bg-[#EFE8DA]">
      {/* 滿版互動地圖 */}
      <div ref={mapContainerRef} className="absolute inset-0 w-full h-full z-0" />

      {/* 頂部懸浮 Day 切換列 & 全覽按鈕 */}
      <div className="absolute top-3 left-3 right-3 z-20 flex flex-wrap items-center justify-between gap-2 pointer-events-none">
        <div className="flex items-center gap-1.5 bg-[#FAF6EE]/95 backdrop-blur-md border border-[#1C1B19]/20 p-1 shadow-md pointer-events-auto overflow-x-auto max-w-full">
          <button
            onClick={() => setDrawerOpen((v) => !v)}
            className="px-2.5 py-1.5 text-xs font-mono bg-[#1C1B19] text-[#F4EFE6] cursor-pointer shrink-0"
          >
            {drawerOpen ? '◧ 收合清單' : '◨ 展開清單'}
          </button>

          {ITINERARY_DAYS.map((d) => (
            <button
              key={d.day}
              onClick={() => {
                onSelectDay(d.day);
                const firstHK = d.items.find((i) => i.isHK);
                if (firstHK) {
                  onSelectItemId(firstHK.id);
                  setSpotCardOpen(true);
                }
              }}
              className={`px-3 py-1.5 text-xs font-mono transition cursor-pointer whitespace-nowrap ${
                selectedDay === d.day
                  ? 'bg-[#1B4332] text-[#F4EFE6] font-bold'
                  : 'text-[#5A554C] hover:bg-[#1C1B19]/10'
              }`}
            >
              DAY 0{d.day} ({d.date.slice(5).replace('-', '/')})
            </button>
          ))}

          <button
            onClick={handleFitDayRoute}
            title="縮放檢視當日完整路線"
            className="hidden sm:inline-block px-2.5 py-1.5 text-xs font-mono text-[#1B4332] hover:bg-[#1B4332]/10 cursor-pointer shrink-0"
          >
            ⛶ 全覽
          </button>
        </div>
      </div>

      {/* 左側懸浮簡潔行程抽屜 (桌機左側 / 手機隱藏或可收合) */}
      {drawerOpen && (
        <aside className="absolute top-16 left-3 bottom-24 z-20 w-[calc(100%-1.5rem)] sm:w-[330px] bg-[#FAF6EE]/95 backdrop-blur-md border border-[#1C1B19]/25 shadow-[6px_6px_0px_rgba(27,67,50,0.14)] flex flex-col overflow-hidden">
          <div className="px-4 py-3 bg-[#1B4332] text-[#F4EFE6] flex items-center justify-between shrink-0">
            <div>
              <span className="font-mono text-[10px] tracking-widest text-[#D4C5A9] block">
                DAY 0{dayObj.day} ・ {dayObj.dateLabel}
              </span>
              <h2 className="font-serif text-base font-bold">{dayObj.theme}</h2>
            </div>
            <button
              onClick={() => setDrawerOpen(false)}
              className="sm:hidden text-xs font-mono px-2 py-1 border border-[#F4EFE6]/30"
            >
              ✕
            </button>
          </div>

          <div className="flex-1 overflow-y-auto divide-y divide-[#1C1B19]/10">
            {dayItems.map((item, idx) => {
              const isSelected = selectedItem?.id === item.id;
              const isLive = tripStatus.currentItem?.id === item.id;
              const isDone = effectiveNowMs >= new Date(item.end).getTime();

              return (
                <button
                  key={item.id}
                  onClick={() => {
                    onSelectItemId(item.id);
                    setSpotCardOpen(true);
                    if (window.innerWidth < 640) setDrawerOpen(false);
                  }}
                  className={`w-full text-left p-3 flex items-center gap-3 transition cursor-pointer ${
                    isSelected
                      ? 'bg-[#EFE8DA] border-l-4 border-l-[#A63429]'
                      : isDone
                      ? 'opacity-55 hover:opacity-90'
                      : 'hover:bg-[#F4EFE6]'
                  }`}
                >
                  {/* 迷你實景縮圖 */}
                  <div className="w-14 h-14 shrink-0 bg-[#EFE8DA] border border-[#1C1B19]/15 overflow-hidden relative">
                    {item.image && (
                      <img
                        src={item.image}
                        alt={item.title}
                        loading="lazy"
                        onError={(e) => {
                          e.currentTarget.style.display = 'none';
                        }}
                        className="w-full h-full object-cover sepia-[0.08]"
                      />
                    )}
                    <span
                      className="absolute top-0 left-0 px-1 text-[10px] font-mono font-bold text-white"
                      style={{ backgroundColor: isSelected || isLive ? '#A63429' : item.districtColor }}
                    >
                      {idx + 1}
                    </span>
                  </div>

                  <div className="min-w-0 flex-1">
                    <div className="flex items-center justify-between gap-1 mb-0.5">
                      <span className="font-mono text-[10px] text-[#5A554C]">{item.timeLabel}</span>
                      {isLive && (
                        <span className="px-1.5 py-0.5 text-[9px] font-mono bg-[#A63429] text-white">LIVE</span>
                      )}
                      {item.isAlternativeActive && (
                        <span className="px-1.5 py-0.5 text-[9px] font-mono bg-[#B8863B] text-white">備案</span>
                      )}
                    </div>
                    <h3 className="font-serif text-sm font-bold text-[#1C1B19] truncate">{item.title}</h3>
                    <p className="text-[11px] font-mono text-[#5A554C] truncate">{item.location}</p>
                  </div>
                </button>
              );
            })}
          </div>
        </aside>
      )}

      {/* 右側懸浮景點詳情卡（含實景照、方位線數據、備案切換與 Google Maps 導航） */}
      {spotCardOpen && selectedItem && (
        <aside className="absolute top-16 right-3 bottom-24 sm:bottom-auto sm:max-h-[calc(100vh-11rem)] z-20 w-[calc(100%-1.5rem)] sm:w-[340px] bg-[#FAF6EE]/96 backdrop-blur-md border border-[#1C1B19]/25 shadow-[6px_6px_0px_rgba(27,67,50,0.16)] flex flex-col overflow-y-auto">
          <div className="relative">
            {selectedItem.image && (
              <div className="w-full aspect-[16/9] bg-[#EFE8DA] overflow-hidden border-b border-[#1C1B19]/15">
                <img
                  src={selectedItem.image}
                  alt={selectedItem.title}
                  onError={(e) => {
                    e.currentTarget.parentElement.style.display = 'none';
                  }}
                  className="w-full h-full object-cover sepia-[0.08] contrast-[1.03]"
                />
              </div>
            )}
            <button
              onClick={() => setSpotCardOpen(false)}
              aria-label="關閉景點卡片"
              className="absolute top-2.5 right-2.5 w-7 h-7 bg-[#1C1B19]/80 text-[#F4EFE6] text-xs font-mono flex items-center justify-center hover:bg-[#A63429] transition cursor-pointer"
            >
              ✕
            </button>
          </div>

          <div className="p-4 space-y-3">
            <div>
              <div className="flex items-center justify-between gap-2 mb-1">
                <span className="font-mono text-[11px] text-[#5A554C]">
                  {selectedItem.district} ・ {selectedItem.timeLabel}
                </span>
                {bearingInfo && Number(bearingInfo.distanceKm) > 0 && (
                  <span className="font-mono text-[11px] font-bold text-[#A63429]">
                    {bearingInfo.dirLabel} {bearingInfo.distanceKm}km
                  </span>
                )}
              </div>
              <h3 className="font-serif text-xl font-bold text-[#1C1B19] leading-snug">
                {selectedItem.title}
              </h3>
              <p className="font-mono text-xs text-[#1B4332] mt-1 inline-flex items-center gap-1">
                <IconPin className="w-3.5 h-3.5 shrink-0" />
                <span>{selectedItem.location}</span>
              </p>
            </div>

            {/* 替代景點一鍵切換 */}
            {rawSelectedItem?.alternatives?.length > 0 && (
              <div className="p-2.5 bg-[#EFE8DA]/80 border border-[#1C1B19]/15">
                <span className="block font-mono text-[10px] text-[#5A554C] mb-1.5">
                  人太多或下雨？切換替代點：
                </span>
                <div className="flex flex-wrap gap-1.5">
                  <button
                    onClick={() => onToggleAlternative(rawSelectedItem.id, null)}
                    className={`px-2 py-1 text-[10px] font-mono border cursor-pointer ${
                      !selectedItem.isAlternativeActive
                        ? 'bg-[#1B4332] text-[#F4EFE6] border-[#1B4332]'
                        : 'bg-[#FAF6EE] text-[#1C1B19] border-[#1C1B19]/20'
                    }`}
                  >
                    原定行程
                  </button>
                  {rawSelectedItem.alternatives.map((alt) => (
                    <button
                      key={alt.id}
                      onClick={() => onToggleAlternative(rawSelectedItem.id, alt.id)}
                      className={`px-2 py-1 text-[10px] font-mono border cursor-pointer inline-flex items-center gap-1 ${
                        selectedItem.isAlternativeActive
                          ? 'bg-[#A63429] text-[#F4EFE6] border-[#A63429]'
                          : 'bg-[#FAF6EE] text-[#A63429] border-[#A63429]/40'
                      }`}
                    >
                      <IconSwap />
                      <span>{alt.label}</span>
                    </button>
                  ))}
                </div>
              </div>
            )}

            <p className="text-xs text-[#4A463F] leading-relaxed">{selectedItem.description}</p>

            <div className="p-2.5 bg-[#F4EFE6] border-l-2 border-[#B8863B] text-[11px] text-[#5A554C]">
              <strong className="text-[#B8863B]">筆記：</strong>
              {selectedItem.tips}
            </div>

            <div className="space-y-1.5 pt-2 border-t border-dashed border-[#1C1B19]/20">
              <div className="flex gap-1.5">
                <a
                  href={getGoogleMapsUrl(selectedItem)}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex-1 py-2 px-2.5 bg-[#1B4332] text-[#F4EFE6] hover:bg-[#143326] transition font-mono text-[11px] inline-flex items-center justify-center gap-1"
                >
                  <IconArrowUpRight />
                  <span>Google 地點</span>
                </a>
                {selectedItem.isHK && (
                  <a
                    href={getGoogleMapsDirectionsUrl(HOTEL_COORDS, selectedItem.coords, 'transit')}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex-1 py-2 px-2.5 bg-[#A63429] text-[#F4EFE6] hover:bg-[#8A2920] transition font-mono text-[11px] inline-flex items-center justify-center gap-1"
                  >
                    <IconTransit />
                    <span>帝京出發導航</span>
                  </a>
                )}
              </div>

              {selectedItem.mtrId && (
                <button
                  onClick={() => onJumpToMtr(selectedItem.mtrId)}
                  className="w-full py-1.5 text-[11px] font-mono text-[#1B4332] hover:underline cursor-pointer"
                >
                  查看鄰近港鐵站轉乘方式 →
                </button>
              )}
            </div>
          </div>
        </aside>
      )}
    </div>
  );
}
