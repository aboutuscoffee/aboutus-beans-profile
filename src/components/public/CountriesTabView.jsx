import { useState, useRef } from 'react';

function beansForFarm(beans, farmSlug) {
  return beans.filter(
    (b) => b.region && b.region.includes(`|farm:${farmSlug}]`)
  );
}

function FarmRow({ farm, beans, onSelectBean, onSelectFarm }) {
  const [hover, setHover] = useState(false);
  const leaveTimer = useRef(null);

  const enter = () => {
    clearTimeout(leaveTimer.current);
    setHover(true);
  };
  const leave = () => {
    leaveTimer.current = setTimeout(() => setHover(false), 120);
  };

  return (
    <div style={{ position: 'relative' }} onMouseEnter={enter} onMouseLeave={leave}>
      <div
        onClick={onSelectFarm}
        className="px-4 py-3 cursor-pointer hover:bg-stone-50 transition-colors flex items-center justify-between"
      >
        <div className="text-sm text-stone-700">{farm.name}</div>
        {beans.length > 0 && (
          <span className="text-[10px] text-stone-400 border border-stone-200 rounded-full px-2 py-0.5 flex-shrink-0 ml-3">
            豆 {beans.length}件
          </span>
        )}
      </div>

      {beans.length > 0 && (
        <div
          style={{
            position: 'absolute',
            left: 0,
            top: 'calc(100% + 4px)',
            minWidth: '220px',
            background: '#fdfaf7',
            border: '0.5px solid #9a9090',
            borderRadius: '10px',
            boxShadow: '0 8px 24px rgba(0,0,0,0.13)',
            zIndex: 9999,
            padding: '10px',
            opacity: hover ? 1 : 0,
            transform: hover ? 'translateY(0)' : 'translateY(-5px)',
            transition: 'opacity 0.15s ease, transform 0.15s ease',
            pointerEvents: hover ? 'auto' : 'none',
          }}
        >
          {/* tail */}
          <div
            style={{
              position: 'absolute',
              top: '-5px', left: '20px',
              width: '9px', height: '9px',
              background: '#fdfaf7',
              borderLeft: '0.5px solid #9a9090',
              borderTop: '0.5px solid #9a9090',
              transform: 'rotate(45deg)',
            }}
          />
          <p style={{ fontSize: '10px', letterSpacing: '0.08em', color: '#999', marginBottom: '8px' }}>
            {farm.name} の豆
          </p>
          {beans.map((bean) => (
            <BeanPopItem
              key={bean.id}
              bean={bean}
              onSelect={() => onSelectBean(bean.id)}
            />
          ))}
        </div>
      )}
    </div>
  );
}

function BeanPopItem({ bean, onSelect }) {
  const [hovered, setHovered] = useState(false);
  return (
    <div
      onClick={(e) => { e.stopPropagation(); onSelect(); }}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        display: 'flex', alignItems: 'center', gap: '9px',
        padding: '6px 8px', borderRadius: '7px', cursor: 'pointer',
        marginBottom: '3px',
        background: hovered ? '#f0ebe4' : 'transparent',
        transition: 'background 0.1s',
      }}
    >
      {bean.image_urls?.[0] ? (
        <img
          src={bean.image_urls[0]}
          alt=""
          style={{ width: '34px', height: '34px', borderRadius: '5px', objectFit: 'cover', flexShrink: 0 }}
        />
      ) : (
        <div style={{ width: '34px', height: '34px', borderRadius: '5px', background: '#e0d8d0', flexShrink: 0 }} />
      )}
      <div>
        <div style={{ fontSize: '11px', color: '#2a2220', lineHeight: 1.35 }}>{bean.name}</div>
        <div style={{ fontSize: '10px', color: '#aaa', marginTop: '2px' }}>{bean.status}</div>
      </div>
    </div>
  );
}

export default function CountriesTabView({ countries, farms, beans, onNavigate }) {
  const [activeSlug, setActiveSlug] = useState(countries[0]?.slug ?? null);
  const [openGroups, setOpenGroups] = useState({});
  const [visible, setVisible] = useState(true);

  const country = countries.find((c) => c.slug === activeSlug);

  const countryFarms = farms.filter(
    (f) => f.country_slug === activeSlug || f.country_name === country?.name
  );

  const groups = {};
  countryFarms.forEach((farm) => {
    const raw = farm.location ?? '';
    const key = raw.split(/\s*[\/,]\s*/)[0].trim() || '—';
    if (!groups[key]) groups[key] = [];
    groups[key].push(farm);
  });

  const toggle = (key) =>
    setOpenGroups((prev) => ({ ...prev, [key]: !prev[key] }));

  const switchCountry = (slug) => {
    if (slug === activeSlug) return;
    setVisible(false);
    setTimeout(() => {
      setActiveSlug(slug);
      setOpenGroups({});
      setVisible(true);
    }, 130);
  };

  return (
    <div>
      {/* 国ピルタブ */}
      <div className="flex gap-2 overflow-x-auto pb-3 mb-6 -mx-6 px-6 scrollbar-none">
        {countries.map((c) => (
          <button
            key={c.slug}
            type="button"
            onClick={() => switchCountry(c.slug)}
            className={`whitespace-nowrap flex-shrink-0 px-3 py-1.5 rounded-full text-[11px] tracking-wide border transition-all cursor-pointer ${
              activeSlug === c.slug
                ? 'bg-stone-800 text-white border-stone-800'
                : 'bg-white border-stone-300 text-stone-600 hover:border-stone-600'
            }`}
          >
            {c.flag} {c.name}
          </button>
        ))}
      </div>

      {country && (
        <div
          style={{
            opacity: visible ? 1 : 0,
            transform: visible ? 'translateY(0)' : 'translateY(7px)',
            transition: 'opacity 0.22s ease, transform 0.22s ease',
          }}
        >
          {/* 農園数 */}
          {countryFarms.length > 0 && (
            <div className="flex gap-6 mb-4">
              <div className="text-[11px] text-stone-400">
                <span className="block text-base font-light text-stone-700">{countryFarms.length}</span>
                農園
              </div>
            </div>
          )}

          {/* 概要 */}
          {country.overview && (
            <p className="text-sm text-stone-600 mb-6 leading-relaxed border-l-2 border-stone-200 pl-4">
              {country.overview}
            </p>
          )}

          {/* 地域アコーディオン */}
          {Object.keys(groups).length > 0 ? (
            <div className="space-y-1">
              {Object.entries(groups).map(([groupKey, groupFarms]) => (
                <div key={groupKey} className="border border-stone-200 bg-white" style={{ overflow: 'visible' }}>
                  <button
                    type="button"
                    onClick={() => toggle(groupKey)}
                    className="w-full flex justify-between items-center px-4 py-3 text-sm font-medium text-left cursor-pointer hover:bg-stone-50 transition-colors"
                  >
                    <span className="font-serif-jp">{groupKey}</span>
                    <span className="text-stone-400 text-[10px] flex items-center gap-2 flex-shrink-0 ml-4">
                      {groupFarms.length}農園
                      <span
                        style={{
                          display: 'inline-block',
                          transition: 'transform 0.2s ease',
                          transform: openGroups[groupKey] ? 'rotate(90deg)' : 'rotate(0deg)',
                        }}
                      >
                        ▶
                      </span>
                    </span>
                  </button>
                  {openGroups[groupKey] && (
                    <div className="border-t border-stone-100 divide-y divide-stone-50" style={{ overflow: 'visible' }}>
                      {groupFarms.map((farm) => (
                        <FarmRow
                          key={farm.slug}
                          farm={farm}
                          beans={beansForFarm(beans ?? [], farm.slug)}
                          onSelectBean={(id) => onNavigate('beans', id)}
                          onSelectFarm={() => onNavigate('farms', farm.slug)}
                        />
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </div>
          ) : (
            <p className="text-sm text-stone-400">農園情報がまだありません</p>
          )}
        </div>
      )}
    </div>
  );
}
