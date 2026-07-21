import { useState, useRef } from 'react';

const COUNTRY_NAME_EN = {
  'グアテマラ': 'Guatemala', 'パナマ': 'Panama', 'エチオピア': 'Ethiopia',
  'コロンビア': 'Colombia', 'コスタリカ': 'Costa Rica', 'ルワンダ': 'Rwanda',
  'ホンジュラス': 'Honduras', 'ケニア': 'Kenya', 'ブラジル': 'Brazil',
  'インドネシア': 'Indonesia', 'ブルンジ': 'Burundi', 'タンザニア': 'Tanzania',
  'イエメン': 'Yemen', 'ジャマイカ': 'Jamaica', 'ハワイ': 'Hawaii',
  'ペルー': 'Peru', 'ボリビア': 'Bolivia', 'エルサルバドル': 'El Salvador',
  'ニカラグア': 'Nicaragua', 'メキシコ': 'Mexico', 'タイ': 'Thailand',
  'ミャンマー': 'Myanmar', 'インド': 'India', 'パプアニューギニア': 'Papua New Guinea',
};

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
        className="py-2.5 pl-4 cursor-pointer flex items-center justify-between transition-colors"
        style={{ borderTop: '0.5px solid rgba(224,220,214,.5)' }}
      >
        <div style={{ fontSize: '10px', letterSpacing: '.04em', color: '#4a4038' }}>{farm.name}</div>
        {beans.length > 0 && (
          <span
            className="flex-shrink-0 ml-3"
            style={{ fontSize: '8px', color: '#9a9080', border: '0.5px solid #D0C8BE', borderRadius: '20px', padding: '1px 8px' }}
          >
            豆 {beans.length}件
          </span>
        )}
      </div>

      {beans.length > 0 && (
        <div
          style={{
            position: 'absolute',
            left: 0,
            bottom: 'calc(100% + 4px)',
            minWidth: '220px',
            background: '#fdfaf7',
            border: '0.5px solid #9a9090',
            borderRadius: '10px',
            boxShadow: '0 8px 24px rgba(0,0,0,0.13)',
            zIndex: 9999,
            padding: '10px',
            opacity: hover ? 1 : 0,
            transform: hover ? 'translateY(0)' : 'translateY(5px)',
            transition: 'opacity 0.15s ease, transform 0.15s ease',
            pointerEvents: hover ? 'auto' : 'none',
          }}
        >
          {/* tail */}
          <div
            style={{
              position: 'absolute',
              bottom: '-5px', left: '20px',
              width: '9px', height: '9px',
              background: '#fdfaf7',
              borderRight: '0.5px solid #9a9090',
              borderBottom: '0.5px solid #9a9090',
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
            className="whitespace-nowrap flex-shrink-0 px-3 py-1 rounded-full text-[11px] tracking-wide transition-all cursor-pointer"
            style={
              activeSlug === c.slug
                ? { background: 'rgba(67,58,53,0.1)', color: '#443A35', border: '0.5px solid rgba(67,58,53,0.35)' }
                : { background: 'transparent', color: '#6a6258', border: '0.5px solid #D0C8BE' }
            }
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
          {/* 産地バンド */}
          <div
            className="-mx-6 mb-6 px-6 py-3 flex items-end justify-between"
            style={{ background: 'rgba(67,58,53,0.08)' }}
          >
            <div>
              <div className="font-display font-light tracking-[0.1em]" style={{ fontSize: '26px', color: '#1A181A', lineHeight: 1 }}>
                {country.name_en ?? COUNTRY_NAME_EN[country.name] ?? country.name}
              </div>
              <div className="mt-1.5" style={{ fontSize: '8px', letterSpacing: '.2em', color: 'rgba(67,58,53,0.45)' }}>
                {country.flag} &nbsp;{country.continent ?? ''}
              </div>
            </div>
            {countryFarms.length > 0 && (
              <div className="text-right">
                <div className="font-display font-light" style={{ fontSize: '38px', color: 'rgba(67,58,53,0.14)', lineHeight: 1 }}>
                  {countryFarms.length}
                </div>
                <div style={{ fontSize: '8px', letterSpacing: '.16em', color: 'rgba(67,58,53,0.3)' }}>FARMS</div>
              </div>
            )}
          </div>

          {/* 概要 */}
          {country.overview && (
            <p className="text-sm mb-6 leading-relaxed pl-4" style={{ color: '#5a5248', borderLeft: '1.5px solid #D0C8BE' }}>
              {country.overview}
            </p>
          )}

          {/* 地域アコーディオン */}
          {Object.keys(groups).length > 0 ? (
            <div>
              {Object.entries(groups).map(([groupKey, groupFarms]) => (
                <div key={groupKey} style={{ overflow: 'visible', borderTop: '0.5px solid #E0DCD6' }}>
                  <button
                    type="button"
                    onClick={() => toggle(groupKey)}
                    className="w-full flex justify-between items-center py-3 text-left cursor-pointer transition-colors"
                    style={{ background: 'transparent' }}
                  >
                    <span style={{ fontSize: '10px', letterSpacing: '.1em', color: '#1A181A' }}>{groupKey}</span>
                    <span className="flex items-center gap-2 flex-shrink-0 ml-4" style={{ fontSize: '9px', color: '#9a9080' }}>
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
                    <div style={{ overflow: 'visible' }}>
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
            <p className="text-sm" style={{ color: '#9a9080' }}>農園情報がまだありません</p>
          )}
        </div>
      )}
    </div>
  );
}
