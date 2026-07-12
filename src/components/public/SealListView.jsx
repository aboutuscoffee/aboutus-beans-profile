import { useState, useMemo } from 'react';

const PAGE_SIZE = 9;

export default function SealListView({ beans, seals }) {
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);

  const allItems = useMemo(() => {
    const standalone = (seals ?? []).filter(s => s.url).map(s => ({
      key: `seal-${s.slug}`,
      name: s.name,
      url: s.url,
    }));
    const beanSeals = (beans ?? []).filter(b => b.seal_url).map(b => ({
      key: `bean-${b.id}`,
      name: b.name,
      url: b.seal_url,
    }));
    return [...standalone, ...beanSeals];
  }, [beans, seals]);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return q ? allItems.filter(item => item.name.toLowerCase().includes(q)) : allItems;
  }, [allItems, search]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const currentPage = Math.min(page, totalPages);
  const pageItems = filtered.slice((currentPage - 1) * PAGE_SIZE, currentPage * PAGE_SIZE);

  const handleSearch = (v) => {
    setSearch(v);
    setPage(1);
  };

  return (
    <div>
      <input
        value={search}
        onChange={e => handleSearch(e.target.value)}
        placeholder="名前で検索"
        className="w-full bg-transparent border-b border-stone-300 focus:border-stone-600 outline-none py-2 text-sm placeholder:text-stone-400 mb-6"
      />
      <p className="text-[11px] tracking-widest text-stone-400 mb-4">{filtered.length}件</p>
      {pageItems.length === 0 ? (
        <p className="text-sm text-stone-400">該当するシールがありません</p>
      ) : (
        <div className="space-y-2">
          {pageItems.map(item => (
            <a
              key={item.key}
              href={item.url}
              target="_blank"
              rel="noreferrer"
              className="flex items-center justify-between py-3 border-b border-stone-200 hover:text-stone-600 group"
            >
              <span className="text-sm">{item.name}</span>
              <span className="text-[11px] text-stone-400 group-hover:text-stone-600 whitespace-nowrap ml-4">開く / 印刷 →</span>
            </a>
          ))}
        </div>
      )}
      {totalPages > 1 && (
        <div className="flex items-center justify-between mt-8 text-[11px] tracking-widest text-stone-400">
          <button
            type="button"
            onClick={() => setPage(p => Math.max(1, p - 1))}
            disabled={currentPage === 1}
            className="px-4 py-2 border border-stone-300 hover:border-stone-600 hover:text-stone-700 disabled:opacity-30 disabled:cursor-not-allowed transition-colors cursor-pointer"
          >
            ← 前へ
          </button>
          <span>{currentPage} / {totalPages}</span>
          <button
            type="button"
            onClick={() => setPage(p => Math.min(totalPages, p + 1))}
            disabled={currentPage === totalPages}
            className="px-4 py-2 border border-stone-300 hover:border-stone-600 hover:text-stone-700 disabled:opacity-30 disabled:cursor-not-allowed transition-colors cursor-pointer"
          >
            次へ →
          </button>
        </div>
      )}
    </div>
  );
}
