import { useState, useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

// Leaflet default icon fix for bundlers
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
});

// カスタムピンアイコン
const makePinIcon = (color) =>
  L.divIcon({
    className: '',
    html: `<div style="
      width:14px;height:14px;border-radius:50%;
      background:${color};border:2px solid white;
      box-shadow:0 1px 4px rgba(0,0,0,0.4);
    "></div>`,
    iconSize: [14, 14],
    iconAnchor: [7, 7],
    popupAnchor: [0, -10],
  });

const ACTIVE_PIN = makePinIcon('#c2410c');   // オレンジ（販売中）
const INACTIVE_PIN = makePinIcon('#a8a29e'); // グレー（その他）

// 国クリック時ズーム
function ZoomToCountry({ country }) {
  const map = useMap();
  useEffect(() => {
    if (country?.lat && country?.lng) {
      map.flyTo([country.lat, country.lng], country.zoom ?? 7, { duration: 1.2 });
    }
  }, [country, map]);
  return null;
}

export default function MapView({ countries, farms, beans, onNavigate }) {
  const [selectedCountry, setSelectedCountry] = useState(null);

  // 国ごとのアクティブ豆があるか判定
  const activeFarmSlugs = new Set(
    beans
      .filter((b) => b.status === '販売中' || b.status === '確認中')
      .flatMap((b) => {
        const matches = (b.region ?? '').matchAll(/farm:([\w-]+)/g);
        return [...matches].map((m) => m[1]);
      })
  );

  const farmsWithCoords = farms.filter((f) => f.lat && f.lng);
  const visibleFarms = selectedCountry
    ? farmsWithCoords.filter(
        (f) =>
          f.country_slug === selectedCountry.slug ||
          f.country_name === selectedCountry.name
      )
    : farmsWithCoords;

  const countriesWithCoords = countries.filter((c) => c.lat && c.lng);

  return (
    <div>
      {/* 国タブ */}
      <div className="flex gap-2 overflow-x-auto pb-3 mb-4 -mx-6 px-6 scrollbar-none">
        <button
          type="button"
          onClick={() => setSelectedCountry(null)}
          className={`whitespace-nowrap flex-shrink-0 px-3 py-1.5 text-[11px] tracking-wide border transition-colors cursor-pointer ${
            !selectedCountry
              ? 'bg-stone-800 text-white border-stone-800'
              : 'bg-white border-stone-300 text-stone-600 hover:border-stone-500'
          }`}
        >
          🌍 全体
        </button>
        {countriesWithCoords.map((c) => (
          <button
            key={c.slug}
            type="button"
            onClick={() => setSelectedCountry(c)}
            className={`whitespace-nowrap flex-shrink-0 px-3 py-1.5 text-[11px] tracking-wide border transition-colors cursor-pointer ${
              selectedCountry?.slug === c.slug
                ? 'bg-stone-800 text-white border-stone-800'
                : 'bg-white border-stone-300 text-stone-600 hover:border-stone-500'
            }`}
          >
            {c.flag} {c.name}
          </button>
        ))}
      </div>

      {/* 凡例 */}
      <div className="flex gap-4 mb-3 text-[11px] text-stone-500">
        <span className="flex items-center gap-1.5">
          <span className="inline-block w-3 h-3 rounded-full bg-orange-700 border-2 border-white shadow" />
          販売中・確認中
        </span>
        <span className="flex items-center gap-1.5">
          <span className="inline-block w-3 h-3 rounded-full bg-stone-400 border-2 border-white shadow" />
          その他
        </span>
      </div>

      {/* マップ */}
      <div className="rounded overflow-hidden border border-stone-200" style={{ height: '60vh', minHeight: 320 }}>
        <MapContainer
          center={[20, 20]}
          zoom={2}
          style={{ height: '100%', width: '100%' }}
          scrollWheelZoom={true}
        >
          <TileLayer
            attribution='&copy; <a href="https://carto.com/">CARTO</a>'
            url="https://{s}.basemaps.cartocdn.com/light_nolabels/{z}/{x}/{y}{r}.png"
          />
          <ZoomToCountry country={selectedCountry} />

          {visibleFarms.map((farm) => {
            const isActive = activeFarmSlugs.has(farm.slug);
            const relatedBeans = beans.filter((b) =>
              (b.region ?? '').includes(`farm:${farm.slug}`)
            );
            return (
              <Marker
                key={farm.slug}
                position={[farm.lat, farm.lng]}
                icon={isActive ? ACTIVE_PIN : INACTIVE_PIN}
              >
                <Popup minWidth={200}>
                  <div className="text-sm leading-relaxed">
                    <div className="font-bold mb-1">{farm.name}</div>
                    {farm.location && (
                      <div className="text-stone-500 text-xs mb-2">{farm.location}</div>
                    )}
                    {farm.altitude && (
                      <div className="text-xs text-stone-500 mb-2">🏔 {farm.altitude}</div>
                    )}
                    <button
                      type="button"
                      onClick={() => onNavigate('farms', farm.slug)}
                      className="text-xs underline text-orange-700 block mb-1 cursor-pointer"
                    >
                      農園ページへ →
                    </button>
                    {relatedBeans.length > 0 && (
                      <div className="mt-2 pt-2 border-t border-stone-100">
                        <div className="text-[10px] text-stone-400 mb-1 tracking-wide">関連する豆</div>
                        {relatedBeans.map((b) => (
                          <button
                            key={b.id}
                            type="button"
                            onClick={() => onNavigate('beans', b.id)}
                            className="text-xs underline text-orange-700 block cursor-pointer"
                          >
                            {b.name}
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                </Popup>
              </Marker>
            );
          })}
        </MapContainer>
      </div>

      {!farmsWithCoords.length && (
        <p className="text-xs text-stone-400 mt-3 text-center">
          農園に緯度経度を登録するとピンが表示されます
        </p>
      )}
    </div>
  );
}
