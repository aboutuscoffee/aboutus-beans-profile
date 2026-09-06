import { useState, useMemo } from 'react';

const CAT_ORDER = ['品種', '精製方法', '賞・認定', '大会・認証', 'プロジェクト', '生産者'];

export default function TermsView({ items, onSelect }) {
  const [query, setQuery] = useState('');
  const [openCats, setOpenCats] = useState(new Set());

  const filtered = useMemo(() => {
    if (!query) return items;
    const q = query.toLowerCase();
    return items.filter((t) => t.name.toLowerCase().includes(q));
  }, [items, query]);

  const byCategory = useMemo(() => {
    const map = {};
    filtered.forEach((t) => {
      const cat = t.category || 'その他';
      (map[cat] = map[cat] || []).push(t);
    });
    return map;
  }, [filtered]);

  const categories = [
    ...CAT_ORDER.filter((c) => byCategory[c]),
    ...Object.keys(byCategory).filter((c) => !CAT_ORDER.includes(c)),
  ];

  const toggleCat = (cat) => {
    setOpenCats((prev) => {
      const next = new Set(prev);
      next.has(cat) ? next.delete(cat) : next.add(cat);
      return next;
    });
  };

  const isOpen = (cat) => query.length > 0 || openCats.has(cat);

  return (
    <div>
      {/* 検索 */}
      <div className="relative mb-4">
        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-stone-400 text-sm pointer-events-none">🔍</span>
        <input
          type="search"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="用語を検索…"
          className="w-full border border-stone-200 rounded-lg pl-8 pr-3 py-2 text-sm bg-stone-50 focus:outline-none focus:ring-2 focus:ring-stone-400"
        />
      </div>

      {/* カテゴリ一覧 */}
      {categories.length === 0 ? (
        <p className="text-xs text-stone-400 text-center py-8">「{query}」に一致する用語がありません</p>
      ) : (
        <div className="space-y-2">
          {categories.map((cat) => {
            const terms = byCategory[cat];
            const open = isOpen(cat);
            return (
              <div key={cat} className="border border-stone-200 rounded-lg overflow-hidden">
                {/* ヘッダー */}
                <button
                  type="button"
                  onClick={() => toggleCat(cat)}
                  className="w-full flex items-center justify-between px-4 py-2.5 bg-stone-100 hover:bg-stone-200/60 transition-colors text-left"
                >
                  <span className="flex items-center gap-2">
                    <span className="text-sm font-medium text-stone-700">{cat}</span>
                    <span className="text-[11px] text-stone-400 bg-white border border-stone-200 rounded-full px-2 py-0.5 leading-none">
                      {terms.length}
                    </span>
                  </span>
                  <span className={`text-stone-400 text-xs transition-transform ${open ? 'rotate-90' : ''}`}>▶</span>
                </button>

                {/* 2カラムグリッド */}
                {open && (
                  <div className="grid grid-cols-2 border-t border-stone-200">
                    {terms.map((t, i) => (
                      <button
                        key={t.slug}
                        type="button"
                        onClick={() => onSelect(t.slug)}
                        className={`flex items-center justify-between px-4 py-2.5 text-left hover:bg-stone-50 transition-colors
                          ${i % 2 === 0 ? 'border-r border-stone-200' : ''}
                          ${i < terms.length - (terms.length % 2 === 0 ? 2 : 1) ? 'border-b border-stone-200' : ''}
                        `}
                      >
                        <span className="font-serif-jp text-sm text-stone-800 truncate pr-1">{t.name}</span>
                        <span className="text-stone-300 text-xs shrink-0">›</span>
                      </button>
                    ))}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
