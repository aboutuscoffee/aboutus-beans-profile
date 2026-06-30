import { useState, useMemo } from 'react';
import { STATUS_ORDER, STATUS_COLORS } from '../../constants';
import { stripWikiLinks } from '../../utils';
import NewBadge from '../common/NewBadge';
import TextInput from '../common/TextInput';
import TextArea from '../common/TextArea';

const EMPTY_BEAN = {
  name: '', origin: '', region: '', variety: '', altitude: '', process: '', terroir: '', producer: '',
  status: '未リリース', is_new: false, price: 0,
  description_ja: '', description_en: '', taste_ja: '', taste_en: '', detail_ja: '', detail_en: '',
};

function AdminBeanForm({ bean, onSave, onCancel, onDelete }) {
  const [form, setForm] = useState(() => (bean ? { ...bean } : { ...EMPTY_BEAN }));
  const set = (k, v) => setForm((f) => ({ ...f, [k]: v }));

  return (
    <div className="space-y-4">
      <TextInput label="豆名 *" value={form.name} onChange={(v) => set('name', v)} />
      <TextInput label="産地 [[国名|country:slug]]" value={form.origin} onChange={(v) => set('origin', v)} />
      <TextInput label="地域 / 農園 [[農園名|farm:slug]]" value={form.region} onChange={(v) => set('region', v)} />
      <TextInput label="生産者 (Producer)" value={form.producer ?? ''} onChange={(v) => set('producer', v)} />
      <TextInput label="品種 [[品種名|term:slug]]" value={form.variety} onChange={(v) => set('variety', v)} />
      <TextInput label="標高" value={form.altitude} onChange={(v) => set('altitude', v)} />
      <TextInput label="精製方法 [[名前|process:slug]]" value={form.process} onChange={(v) => set('process', v)} />
      <TextInput label="テロワール / ランク" value={form.terroir} onChange={(v) => set('terroir', v)} />
      <div className="grid grid-cols-2 gap-4">
        <div>
          <span className="block text-[11px] tracking-widest text-stone-500 mb-1">ステータス</span>
          <select
            value={form.status}
            onChange={(e) => set('status', e.target.value)}
            className="w-full bg-transparent border-b border-stone-300 focus:border-stone-600 outline-none py-1.5 text-sm"
          >
            {Object.keys(STATUS_ORDER).map((s) => (
              <option key={s} value={s}>{s}</option>
            ))}
          </select>
        </div>
        <TextInput label="価格（ソート用）" value={form.price} onChange={(v) => set('price', v)} type="number" />
      </div>
      <label className="flex items-center gap-2 cursor-pointer">
        <input type="checkbox" checked={form.is_new} onChange={(e) => set('is_new', e.target.checked)} className="accent-stone-700" />
        <span className="text-[11px] tracking-widest text-stone-500">NEWバッジを表示</span>
      </label>
      <TextArea label="概要（日本語）" value={form.description_ja} onChange={(v) => set('description_ja', v)} rows={4} />
      <TextArea label="概要（English）" value={form.description_en} onChange={(v) => set('description_en', v)} rows={3} />
      <TextArea label="テイスト（日本語）" value={form.taste_ja} onChange={(v) => set('taste_ja', v)} rows={4} />
      <TextArea label="テイスト（English）" value={form.taste_en} onChange={(v) => set('taste_en', v)} rows={3} />
      <TextArea label="詳細（日本語）" value={form.detail_ja} onChange={(v) => set('detail_ja', v)} rows={3} />
      <TextArea label="詳細（English）" value={form.detail_en} onChange={(v) => set('detail_en', v)} rows={2} />
      <div className="flex gap-3 pt-4 flex-wrap">
        <button
          type="button"
          onClick={() => { if (form.name.trim()) onSave(form); }}
          className="text-xs tracking-widest border border-stone-700 px-6 py-2 hover:bg-stone-800 hover:text-white transition-colors cursor-pointer"
        >
          保存
        </button>
        <button type="button" onClick={onCancel} className="text-xs tracking-widest border border-stone-300 px-6 py-2 hover:border-stone-600 cursor-pointer">
          キャンセル
        </button>
        {bean?.id && (
          <button
            type="button"
            onClick={() => onDelete(bean.id)}
            className="text-xs tracking-widest border border-red-300 text-red-500 px-6 py-2 hover:bg-red-50 ml-auto cursor-pointer"
          >
            削除
          </button>
        )}
      </div>
    </div>
  );
}

export default function AdminBeans({ beans, updateBeans }) {
  const [view, setView] = useState('list');
  const [editTarget, setEditTarget] = useState(null);
  const [search, setSearch] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');

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
      <div className="space-y-2">
        {filtered.map((bean) => (
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
                <div className="text-xs text-stone-500 mt-0.5">{stripWikiLinks(bean.origin)}</div>
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
        {filtered.length === 0 && <p className="text-center text-sm text-stone-400 py-12">該当なし</p>}
      </div>
    </div>
  );
}
