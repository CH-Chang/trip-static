import { useEffect, useMemo, useRef } from 'react';
import L from 'leaflet';
import { HOTEL_COORDS, ITINERARY_DAYS } from '../data/tripData';
import { getBearingAndDistance, getGoogleMapsDirectionsUrl, getGoogleMapsUrl } from '../utils/geo';

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
        activeAltLabel: found.label,
        isAlternativeActive: true
      };
    }
  }
  return { ...item, isAlternativeActive: false };
}

export default function InteractiveMapSection({
  selectedDay,
  onSelectDay,
  selectedItemId,
  onSelectItemId,
  altSelections,
  onToggleAlternative,
  onJumpToMtr
}) {
  const mapContainerRef = useRef(null);
  const mapRef = useRef(null);
  const layerGroupRef = useRef(null);

  const hkItemsForDay = useMemo(() => {
    const dayObj = ITINERARY_DAYS.find((d) => d.day === selectedDay) || ITINERARY_DAYS[0];
    return dayObj.items
      .filter((it) => it.isHK)
      .map((it) => resolveEffectiveItem(it, altSelections));
  }, [selectedDay, altSelections]);

  const rawSelectedItem = useMemo(() => {
    for (const d of ITINERARY_DAYS) {
      const found = d.items.find((i) => i.id === selectedItemId);
      if (found) return found;
    }
    return hkItemsForDay[0] || null;
  }, [selectedItemId, hkItemsForDay]);

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
      center: [22.302, 114.165],
      zoom: 12,
      scrollWheelZoom: true
    });

    L.tileLayer('https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png', {
      attribution:
        '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> &copy; <a href="https://carto.com/attribution/">CARTO</a>',
      subdomains: 'abcd',
      maxZoom: 19
    }).addTo(map);

    mapRef.current = map;
    layerGroupRef.current = L.layerGroup().addTo(map);

    // Tab 切換顯示後確保 Leaflet 重新計算容器尺寸
    setTimeout(() => map.invalidateSize(), 120);

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

    const hotelIcon = L.divIcon({
      className: '',
      html: `<div style="background:#1B4332;color:#F4EFE6;border:2px solid #FAF6EE;padding:3px 8px;font-family:'IBM Plex Mono',monospace;font-size:11px;font-weight:700;white-space:nowrap;box-shadow:3px 3px 0 rgba(28,27,25,0.25);">🏨 帝京酒店 BASE</div>`,
      iconSize: [120, 26],
      iconAnchor: [60, 13]
    });
    L.marker(HOTEL_COORDS, { icon: hotelIcon, zIndexOffset: 500 })
      .addTo(group)
      .bindPopup('<strong>帝京酒店 Royal Plaza Hotel</strong><br/>旺角東站 D 出口・三天住宿基地');

    if (hkItemsForDay.length > 1) {
      L.polyline(
        hkItemsForDay.map((it) => it.coords),
        { color: '#1B4332', weight: 2.5, opacity: 0.72 }
      ).addTo(group);
    }

    hkItemsForDay.forEach((item, idx) => {
      const isSelected = selectedItem?.id === item.id;
      const markerIcon = L.divIcon({
        className: '',
        html: `<div style="width:28px;height:28px;display:flex;align-items:center;justify-content:center;font-family:'IBM Plex Mono',monospace;font-size:12px;font-weight:700;border:2px solid #FAF6EE;background:${
          isSelected ? '#A63429' : item.districtColor
        };color:#FAF6EE;box-shadow:0 3px 8px rgba(0,0,0,0.25);transform:${
          isSelected ? 'scale(1.22)' : 'scale(1)'
        };transition:transform 0.2s;">${idx + 1}</div>`,
        iconSize: [28, 28],
        iconAnchor: [14, 14]
      });

      const marker = L.marker(item.coords, {
        icon: markerIcon,
        zIndexOffset: isSelected ? 900 : 100
      }).addTo(group);

      marker.on('click', () => onSelectItemId(item.id));
      marker.bindTooltip(`${idx + 1}. ${item.title}`, { direction: 'top', offset: [0, -10] });
    });

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

      map.flyTo(selectedItem.coords, 14, { duration: 0.75 });
    } else if (hkItemsForDay.length > 0) {
      const bounds = L.latLngBounds([HOTEL_COORDS, ...hkItemsForDay.map((i) => i.coords)]);
      map.fitBounds(bounds.pad(0.18), { animate: true });
    }
  }, [hkItemsForDay, selectedItem, onSelectItemId]);

  return (
    <section className="max-w-7xl mx-auto px-5 sm:px-8 pt-6 pb-28">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-6">
        <div>
          <span className="font-mono text-xs tracking-[0.25em] text-[#A63429] uppercase">
            HONG KONG MAP &amp; BEARING
          </span>
          <h2 className="font-serif text-2xl sm:text-3xl font-bold text-[#1C1B19] mt-1">
            實景地圖與方位導航
          </h2>
        </div>

        <div className="flex items-center gap-1.5 overflow-x-auto pb-1">
          {ITINERARY_DAYS.map((d) => (
            <button
              key={d.day}
              onClick={() => {
                onSelectDay(d.day);
                const firstHK = d.items.find((i) => i.isHK);
                if (firstHK) onSelectItemId(firstHK.id);
              }}
              className={`px-3.5 py-1.5 text-xs font-mono transition cursor-pointer whitespace-nowrap border ${
                selectedDay === d.day
                  ? 'bg-[#1B4332] text-[#F4EFE6] border-[#1B4332]'
                  : 'bg-[#FAF6EE] text-[#5A554C] border-[#1C1B19]/20 hover:border-[#1C1B19]/50'
              }`}
            >
              DAY 0{d.day} 路線
            </button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
        {/* 主視窗大地圖 */}
        <div className="lg:col-span-8 border border-[#1C1B19]/25 bg-[#FAF6EE] p-2 shadow-[6px_6px_0px_rgba(27,67,50,0.1)]">
          <div ref={mapContainerRef} className="w-full h-[420px] sm:h-[540px] z-0" />
        </div>

        {/* 右側景點方位與備案切換面板 */}
        <div className="lg:col-span-4 flex flex-col justify-between gap-4 bg-[#FAF6EE] border border-[#1C1B19]/25 p-5 sm:p-6">
          <div>
            <div className="flex items-center justify-between pb-3 mb-4 border-b border-[#1C1B19]/15">
              <span className="font-mono text-xs font-bold text-[#1B4332]">SELECTED SPOT</span>
              <span className="font-mono text-[11px] text-[#5A554C]">DAY 0{selectedDay}</span>
            </div>

            {selectedItem ? (
              <div>
                {selectedItem.image && (
                  <div className="mb-4 overflow-hidden border border-[#1C1B19]/15 bg-[#EFE8DA] aspect-[16/9]">
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

                <div className="inline-flex items-center gap-2 mb-2">
                  <span className="w-2.5 h-2.5 inline-block" style={{ backgroundColor: selectedItem.districtColor }} />
                  <span className="font-mono text-xs text-[#5A554C]">
                    {selectedItem.district} ・ {selectedItem.timeLabel}
                  </span>
                </div>

                <h3 className="font-serif text-xl sm:text-2xl font-bold text-[#1C1B19] mb-1.5">
                  {selectedItem.title}
                </h3>
                <p className="font-mono text-xs text-[#A63429] mb-4">📍 {selectedItem.location}</p>

                {/* 替代方案切換器（若此景點有備案） */}
                {rawSelectedItem?.alternatives?.length > 0 && (
                  <div className="mb-4 p-3 bg-[#EFE8DA]/75 border border-[#1C1B19]/15">
                    <span className="block font-mono text-[10px] tracking-widest text-[#5A554C] mb-2">
                      人太多或下雨？切換方案：
                    </span>
                    <div className="flex flex-wrap gap-1.5">
                      <button
                        onClick={() => onToggleAlternative(rawSelectedItem.id, null)}
                        className={`px-2.5 py-1 text-[11px] font-mono border cursor-pointer transition ${
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
                          className={`px-2.5 py-1 text-[11px] font-mono border cursor-pointer transition ${
                            selectedItem.isAlternativeActive
                              ? 'bg-[#A63429] text-[#F4EFE6] border-[#A63429]'
                              : 'bg-[#FAF6EE] text-[#A63429] border-[#A63429]/40'
                          }`}
                        >
                          🔄 {alt.label}
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {bearingInfo && Number(bearingInfo.distanceKm) > 0 && (
                  <div className="p-3.5 bg-[#F4EFE6] border border-[#1C1B19]/15 mb-4">
                    <span className="block font-mono text-[10px] tracking-widest text-[#5A554C] mb-1">
                      RELATIVE TO ROYAL PLAZA HOTEL
                    </span>
                    <div className="flex items-baseline justify-between">
                      <span className="font-serif text-base font-bold text-[#1C1B19]">
                        {bearingInfo.dirLabel}方 ({bearingInfo.bearingDeg}°)
                      </span>
                      <span className="font-mono text-sm font-bold text-[#A63429]">
                        直線 {bearingInfo.distanceKm} km
                      </span>
                    </div>
                  </div>
                )}

                <p className="text-sm text-[#4A463F] leading-relaxed">{selectedItem.description}</p>
              </div>
            ) : (
              <p className="text-sm text-[#5A554C]">請點選左側地圖編號查看方位與導航。</p>
            )}
          </div>

          {selectedItem && (
            <div className="space-y-2 pt-4 border-t border-dashed border-[#1C1B19]/20">
              <a
                href={getGoogleMapsUrl(selectedItem)}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full py-2.5 px-4 bg-[#1B4332] text-[#F4EFE6] hover:bg-[#143326] transition font-mono text-xs tracking-wider flex items-center justify-center gap-2"
              >
                <span>↗ 在 GOOGLE MAPS 查看地點</span>
              </a>
              {selectedItem.isHK && (
                <a
                  href={getGoogleMapsDirectionsUrl(HOTEL_COORDS, selectedItem.coords, 'transit')}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full py-2.5 px-4 border border-[#1C1B19]/30 bg-[#F4EFE6] text-[#1C1B19] hover:bg-[#1C1B19] hover:text-[#F4EFE6] transition font-mono text-xs tracking-wider flex items-center justify-center gap-2"
                >
                  <span>🚇 從帝京酒店出發（大眾運輸導航）</span>
                </a>
              )}
              {selectedItem.mtrId && (
                <button
                  onClick={() => onJumpToMtr(selectedItem.mtrId)}
                  className="w-full py-1.5 px-4 text-[#A63429] hover:underline font-mono text-xs cursor-pointer"
                >
                  切換至港鐵路網查看此站轉乘 →
                </button>
              )}
            </div>
          )}
        </div>
      </div>

      <div className="mt-5 flex flex-wrap gap-2">
        {hkItemsForDay.map((it, idx) => (
          <button
            key={it.id}
            onClick={() => onSelectItemId(it.id)}
            className={`px-3 py-1.5 text-xs font-mono border transition cursor-pointer ${
              selectedItem?.id === it.id
                ? 'bg-[#A63429] text-[#F4EFE6] border-[#A63429]'
                : 'bg-[#FAF6EE] text-[#1C1B19] border-[#1C1B19]/15 hover:border-[#1C1B19]/45'
            }`}
          >
            {idx + 1}. {it.title}
          </button>
        ))}
      </div>
    </section>
  );
}
