import { useState, useMemo } from 'react';
import { STATUS_ORDER, STATUS_COLORS } from '../../constants';
import { stripWikiLinks } from '../../utils';
import NewBadge from '../common/NewBadge';
import AdminBeanForm from './AdminBeanForm';

export default function AdminBeans({ beans, updateBeans, initialEditBean }) {
  const [view, setView] = useState(initialEditBean ? 'edit' : 'list');
  const [editTarget, setEditTarget] = useState(initialEditBean ?? null);
  const [search, setSearch] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [collapsed, setCollapsed] = useState(new Set());

  const toggleCountry = (key) => setCollapsed((prev) => {
    const next = new Set(prev);
    next.has(key) ? next.delete(key) : next.add(key);
    return next;
  });

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return beans
      .filter((b) => {
        const matchQ = !q || b.name.toLowerCase().includes(q);
        const matchS = filterStatus === 'all' || b.status === filterStatus;
        return matchQ && matchS;
      })
      .sort((a, b) => {
        const sa = STATUS_ORDER[a.status] ?? 99;
        const sb = STATUS_ORDER[b.status] ?? 99;
        return sa !== sb ? sa - sb : (b.price || 0) - (a.price || 0);
      });
  }, [beans, search, filterStatus]);

  const grouped = useMemo(() => {
    const map = new Map();
    filtered.forEach((bean) => {
      const key = stripWikiLinks(bean.origin).trim() || '産地未設定';
      if (!map.has(key)) map.set(key, []);
      map.get(key).push(bean);
    });
    return [...map.entries()];
  }, [filtered]);

  const save = (form) => {
    let next;
    if (form.id) next = beans.map((b) => (String(b.id) === String(form.id) ? form : b));
    else next = [...beans, { ...form, id: Date.now() }];
    updateBeans(next);
    setView('list');
  };

  const del = (id) => {
    if (!window.confirm('削除しますか？')) return;
    updateBeans(beans.filter((b) => String(b.id) !== String(id)));
    setView('list');
  };

  const toggleNew = (id) => updateBeans(beans.map((b) => (String(b.id) === String(id) ? { ...b, is_new: !b.is_new } : b)));
  const changeStatus = (id, status) => updateBeans(beans.map((b) => (String(b.id) === String(id) ? { ...b, status } : b)));

  if (view === 'new' || view === 'edit') {
    return (
      <div>
        <div onClick={() => setView('list')} className="cursor-pointer text-xs text-stone-400 hover:text-stone-600 mb-6 tracking-wide">
          ← 豆一覧へ戻る
        </div>
        <h2 className="font-serif-jp text-xl mb-6">{view === 'new' ? '豆を追加' : '豆を編集'}</h2>
        <AdminBeanForm bean={view === 'edit' ? editTarget : null} onSave={save} onCancel={() => setView('list')} onDelete={del} />
      </div>
    );
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6 gap-4 flex-wrap">
        <h2 className="font-serif-jp text-xl">
          豆管理 <span className="text-sm font-sans text-stone-400">({beans.length}件)</span>
        </h2>
        <button
          type="button"
          onClick={() => setView('new')}
          className="text-xs tracking-widest border border-stone-700 px-4 py-2 hover:bg-stone-800 hover:text-white transition-colors cursor-pointer"
        >
          + 追加
        </button>
      </div>
      <div className="flex gap-3 mb-4 flex-wrap">
        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="検索"
          className="flex-1 min-w-0 bg-transparent border-b border-stone-300 focus:border-stone-600 outline-none py-1.5 text-sm"
        />
        <select
          value={filterStatus}
          onChange={(e) => setFilterStatus(e.target.value)}
          className="bg-transparent border-b border-stone-300 outline-none py-1.5 text-xs text-stone-600"
        >
          <option value="all">すべて</option>
          {Object.keys(STATUS_ORDER).map((s) => (
            <option key={s} value={s}>{s}</option>
          ))}
        </select>
      </div>
      <div className="space-y-4">
        {grouped.map(([country, countryBeans]) => (
          <div key={country}>
            <button
              type="button"
              onClick={() => toggleCountry(country)}
              className="flex items-center gap-2 w-full text-left py-2 border-b border-stone-200 mb-2 cursor-pointer hover:text-stone-700"
            >
              <span className="text-[10px] text-stone-400 w-3">{collapsed.has(country) ? '▶' : '▼'}</span>
              <span className="text-[11px] tracking-widest text-stone-600 font-medium">{country}</span>
              <span className="text-[10px] text-stone-400">({countryBeans.length})</span>
            </button>
            {!collapsed.has(country) && (
              <div className="space-y-2 pl-2">
                {countryBeans.map((bean) => (
                  <div
                    key={bean.id}
                    className={`border-l-2 ${STATUS_COLORS[bean.status] || 'border-l-stone-300'} pl-4 py-3 ${
                      bean.status === '終売' ? 'opacity-60' : ''
                    }`}
                  >
                    <div className="flex items-start gap-2 flex-wrap">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          {bean.is_new && <NewBadge />}
                          <span className="font-serif-jp text-sm">{bean.name}</span>
                        </div>
                      </div>
                      <div className="flex items-center gap-2 flex-shrink-0 flex-wrap justify-end">
                        <select
                          value={bean.status}
                          onChange={(e) => changeStatus(bean.id, e.target.value)}
                          className="bg-transparent border border-stone-300 outline-none px-2 py-1 text-[11px] text-stone-600"
                        >
                          {Object.keys(STATUS_ORDER).map((s) => (
                            <option key={s} value={s}>{s}</option>
                          ))}
                        </select>
                        <button
                          type="button"
                          onClick={() => toggleNew(bean.id)}
                          className={`text-[11px] border px-2 py-1 cursor-pointer ${
                            bean.is_new ? 'border-amber-400 text-amber-600' : 'border-stone-300 text-stone-400'
                          }`}
                        >
                          NEW
                        </button>
                        <button
                          type="button"
                          onClick={() => { setEditTarget(bean); setView('edit'); }}
                          className="text-[11px] border border-stone-300 px-3 py-1 hover:border-stone-600 cursor-pointer"
                        >
                          編集
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        ))}
        {filtered.length === 0 && <p className="text-center text-sm text-stone-400 py-12">該当なし</p>}
      </div>
    </div>
  );
}
