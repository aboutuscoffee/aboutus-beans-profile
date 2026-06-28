import { useState } from 'react';

export default function CountriesTabView({ countries, farms, onNavigate }) {
  const [activeSlug, setActiveSlug] = useState(countries[0]?.slug ?? null);
  const [openGroups, setOpenGroups] = useState({});

  const country = countries.find((c) => c.slug === activeSlug);

  const countryFarms = farms.filter(
    (f) => f.country_slug === activeSlug || f.country_name === country?.name
  );

  // Group by first location segment (split on " / " or ", ")
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
    setActiveSlug(slug);
    setOpenGroups({});
  };

  return (
    <div>
      {/* 国タブ（横スクロール） */}
      <div className="flex gap-2 overflow-x-auto pb-3 mb-8 -mx-6 px-6 scrollbar-none">
        {countries.map((c) => (
          <button
            key={c.slug}
            onClick={() => switchCountry(c.slug)}
            type="button"
            className={`whitespace-nowrap flex-shrink-0 px-3 py-1.5 text-[11px] tracking-wide border transition-colors cursor-pointer ${
              activeSlug === c.slug
                ? 'bg-stone-800 text-white border-stone-800'
                : 'bg-white border-stone-300 text-stone-600 hover:border-stone-500'
            }`}
          >
            {c.flag} {c.name}
          </button>
        ))}
      </div>

      {country && (
        <div>
          {/* 国の概要 */}
          {country.overview && (
            <p className="text-sm text-stone-600 mb-6 leading-relaxed border-l-2 border-l-stone-200 pl-4">
              {country.overview}
            </p>
          )}

          {/* 地域アコーディオン */}
          {Object.keys(groups).length > 0 ? (
            <div className="space-y-1">
              {Object.entries(groups).map(([groupKey, groupFarms]) => (
                <div key={groupKey} className="border border-stone-200 bg-white">
                  <button
                    onClick={() => toggle(groupKey)}
                    type="button"
                    className="w-full flex justify-between items-center px-4 py-3 text-sm font-medium text-left cursor-pointer hover:bg-stone-50 transition-colors"
                  >
                    <span className="font-serif-jp">{groupKey}</span>
                    <span className="text-stone-400 text-[10px] ml-4 flex-shrink-0">
                      {openGroups[groupKey] ? '▲' : '▼'}
                    </span>
                  </button>
                  {openGroups[groupKey] && (
                    <div className="border-t border-stone-100 divide-y divide-stone-50">
                      {groupFarms.map((farm) => (
                        <div
                          key={farm.slug}
                          onClick={() => onNavigate('farms', farm.slug)}
                          className="px-4 py-3 cursor-pointer hover:bg-stone-50 transition-colors"
                        >
                          <div className="text-sm text-stone-700 underline decoration-dotted underline-offset-2">
                            {farm.name}
                          </div>
                          {farm.location && (
                            <div className="text-[11px] text-stone-400 mt-0.5">{farm.location}</div>
                          )}
                        </div>
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
