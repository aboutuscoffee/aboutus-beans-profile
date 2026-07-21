import { useState, useMemo } from 'react';
import { STATUS_ORDER } from '../../constants';
import { stripWikiLinks } from '../../utils';

const PAGE_SIZE = 9;

const STATUS_DOT = {
  'リリース中': '#443A35',
  '確認中':   '#C2BCA9',
  '未リリース': '#C2BCA9',
  '終売':     '#C2BCA9',
};

export default function BeanListView({ beans, onSelectBean }) {
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    const list = q
      ? beans.filter(
          (b) =>
            b.name.toLowerCase().includes(q) ||
            stripWikiLinks(b.origin).toLowerCase().includes(q) ||
            stripWikiLinks(b.variety ?? '').toLowerCase().includes(q)
        )
      : beans;
    return [...list].sort((a, b) => {
      const sa = STATUS_ORDER[a.status] ?? 99;
      const sb = STATUS_ORDER[b.status] ?? 99;
      return sa !== sb ? sa - sb : (b.price || 0) - (a.price || 0);
    });
  }, [beans, search]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const currentPage = Math.min(page, totalPages);
  const pageItems = filtered.slice((currentPage - 1) * PAGE_SIZE, currentPage * PAGE_SIZE);

  const handleSearch = (v) => { setSearch(v); setPage(1); };

  return (
    <div>
      <input
        value={search}
        onChange={(e) => handleSearch(e.target.value)}
        placeholder="豆名・産地・品種で検索"
        className="w-full bg-transparent outline-none py-2 mb-8 text-sm placeholder:text-stone-400"
        style={{ borderBottom: '0.5px solid #D0C8BE', letterSpacing: '.06em' }}
      />

      {pageItems.length === 0 ? (
        <p className="text-center text-sm py-16" style={{ color: '#9a9080' }}>該当する豆がありません</p>
      ) : (
        <div className="grid grid-cols-3 gap-x-4 gap-y-8">
          {pageItems.map((bean) => (
            <BeanCard key={bean.id} bean={bean} onSelect={() => onSelectBean(bean.id)} />
          ))}
        </div>
      )}

      {totalPages > 1 && (
        <div className="flex items-center justify-between mt-10" style={{ color: '#9a9080' }}>
          <button
            type="button"
            onClick={() => setPage((p) => Math.max(1, p - 1))}
            disabled={currentPage === 1}
            className="text-[11px] tracking-widest px-4 py-2 disabled:opacity-30 disabled:cursor-not-allowed cursor-pointer transition-colors hover:text-stone-700"
            style={{ border: '0.5px solid #D0C8BE' }}
          >
            ← 前へ
          </button>
          <span className="text-[11px] tracking-widest">{currentPage} / {totalPages}</span>
          <button
            type="button"
            onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
            disabled={currentPage === totalPages}
            className="text-[11px] tracking-widest px-4 py-2 disabled:opacity-30 disabled:cursor-not-allowed cursor-pointer transition-colors hover:text-stone-700"
            style={{ border: '0.5px solid #D0C8BE' }}
          >
            次へ →
          </button>
        </div>
      )}
    </div>
  );
}

function BeanCard({ bean, onSelect }) {
  const dotColor = STATUS_DOT[bean.status] ?? '#C2BCA9';
  const faded = bean.status === '終売';
  const thumb = bean.image_urls?.find(Boolean);

  return (
    <div
      onClick={onSelect}
      className="cursor-pointer group"
      style={{ opacity: faded ? 0.5 : 1 }}
    >
      {/* 画像 */}
      <div
        className="w-full overflow-hidden mb-2.5"
        style={{ aspectRatio: '3/4', background: '#ECE8E2' }}
      >
        {thumb ? (
          <img
            src={thumb}
            alt=""
            className="w-full h-full transition-transform duration-500 group-hover:scale-105"
            style={{ objectFit: 'contain' }}
          />
        ) : null}
      </div>

      {/* ステータスドット */}
      <div className="flex items-center gap-1.5 mb-1">
        <div
          className="rounded-full flex-shrink-0"
          style={{ width: '4px', height: '4px', background: dotColor }}
        />
        <span className="text-[8px] tracking-widest" style={{ color: '#9a9080' }}>
          {bean.status}
        </span>
        {bean.is_new && (
          <span
            className="text-[7.5px] tracking-wider px-1.5 py-px"
            style={{ background: 'rgba(44,25,23,.07)', color: '#2C1917', border: '0.5px solid rgba(44,25,23,.22)' }}
          >
            NEW
          </span>
        )}
      </div>

      {/* 豆名 */}
      <div
        className="font-display font-light leading-snug mb-0.5"
        style={{ fontSize: '13px', color: '#1A181A', letterSpacing: '.02em' }}
      >
        {bean.name}
      </div>

      {/* 産地・品種 */}
      <div style={{ fontSize: '8.5px', color: '#9a9080', letterSpacing: '.08em' }}>
        {stripWikiLinks(bean.origin)}
        {bean.variety ? ` · ${stripWikiLinks(bean.variety)}` : ''}
      </div>
    </div>
  );
}
