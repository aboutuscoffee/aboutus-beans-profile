import { useState, useMemo } from 'react';
import { STATUS_ORDER, STATUS_COLORS } from '../../constants';
import { stripWikiLinks } from '../../utils';
import NewBadge from '../common/NewBadge';

export default function BeanListView({ beans, onSelectBean }) {
  const [search, setSearch] = useState('');
  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    const list = q
      ? beans.filter(
          (b) =>
            b.name.toLowerCase().includes(q) ||
            stripWikiLinks(b.origin).toLowerCase().includes(q)
        )
      : beans;
    return [...list].sort((a, b) => {
      const sa = STATUS_ORDER[a.status] ?? 99;
      const sb = STATUS_ORDER[b.status] ?? 99;
      return sa !== sb ? sa - sb : (b.price || 0) - (a.price || 0);
    });
  }, [beans, search]);

  return (
    <div>
      <input
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        placeholder="豆名・産地・品種で検索"
        className="w-full bg-transparent border-b border-stone-300 focus:border-stone-600 outline-none py-2 text-sm placeholder:text-stone-400 mb-6"
      />
      <ul className="space-y-3">
        {filtered.map((bean) => (
          <li key={bean.id}>
            <div
              onClick={() => onSelectBean(bean.id)}
              className={`cursor-pointer border-l-2 ${
                STATUS_COLORS[bean.status] || 'border-l-stone-300'
              } pl-4 py-3 hover:bg-stone-200/40 transition-colors ${
                bean.status === '終売' ? 'opacity-50' : ''
              }`}
            >
              <div className="flex items-center gap-2 flex-wrap">
                {bean.is_new && <NewBadge />}
                <span className="font-serif-jp text-base">{bean.name}</span>
              </div>
              <div className="text-xs text-stone-500 mt-1">
                {stripWikiLinks(bean.origin)}
                {bean.variety ? ` · ${stripWikiLinks(bean.variety)}` : ''}
              </div>
              <div className="text-[10px] text-stone-400 mt-1 tracking-widest">{bean.status}</div>
            </div>
          </li>
        ))}
        {filtered.length === 0 && (
          <li className="text-center text-sm text-stone-400 py-16">該当する豆がありません</li>
        )}
      </ul>
    </div>
  );
}
