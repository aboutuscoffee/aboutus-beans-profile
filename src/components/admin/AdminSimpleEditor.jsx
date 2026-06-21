import { useState } from 'react';
import TextInput from '../common/TextInput';
import TextArea from '../common/TextArea';

export default function AdminSimpleEditor({ title, items, updateItems, fields, nameKey = 'name' }) {
  const [view, setView] = useState('list');
  const [editTarget, setEditTarget] = useState(null);
  const [form, setForm] = useState({});
  const set = (k, v) => setForm((f) => ({ ...f, [k]: v }));

  const startNew = () => {
    const init = {};
    fields.forEach((f) => { init[f.key] = ''; });
    setForm(init);
    setEditTarget(null);
    setView('form');
  };

  const startEdit = (item) => { setForm({ ...item }); setEditTarget(item); setView('form'); };

  const save = () => {
    if (!form[nameKey]?.trim()) return;
    let next;
    if (editTarget) next = items.map((i) => (i.slug === editTarget.slug ? form : i));
    else next = [...items, form];
    updateItems(next);
    setView('list');
  };

  const del = (item) => {
    if (!window.confirm('削除しますか？')) return;
    updateItems(items.filter((i) => i.slug !== item.slug));
    setView('list');
  };

  if (view === 'form') {
    return (
      <div>
        <div onClick={() => setView('list')} className="cursor-pointer text-xs text-stone-400 hover:text-stone-600 mb-6 tracking-wide">
          ← {title}一覧へ戻る
        </div>
        <h2 className="font-serif-jp text-xl mb-6">{editTarget ? `${title}を編集` : `${title}を追加`}</h2>
        <div className="space-y-4">
          {fields.map((f) =>
            f.type === 'textarea' ? (
              <TextArea key={f.key} label={f.label} value={form[f.key]} onChange={(v) => set(f.key, v)} rows={f.rows || 3} />
            ) : (
              <TextInput key={f.key} label={f.label} value={form[f.key]} onChange={(v) => set(f.key, v)} />
            )
          )}
          <div className="flex gap-3 pt-4">
            <button type="button" onClick={save} className="text-xs tracking-widest border border-stone-700 px-6 py-2 hover:bg-stone-800 hover:text-white transition-colors cursor-pointer">
              保存
            </button>
            <button type="button" onClick={() => setView('list')} className="text-xs tracking-widest border border-stone-300 px-6 py-2 hover:border-stone-600 cursor-pointer">
              キャンセル
            </button>
            {editTarget && (
              <button
                type="button"
                onClick={() => del(editTarget)}
                className="text-xs tracking-widest border border-red-300 text-red-500 px-6 py-2 hover:bg-red-50 ml-auto cursor-pointer"
              >
                削除
              </button>
            )}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h2 className="font-serif-jp text-xl">
          {title}管理 <span className="text-sm font-sans text-stone-400">({items.length}件)</span>
        </h2>
        <button type="button" onClick={startNew} className="text-xs tracking-widest border border-stone-700 px-4 py-2 hover:bg-stone-800 hover:text-white transition-colors cursor-pointer">
          + 追加
        </button>
      </div>
      <ul className="space-y-2">
        {items.map((item) => (
          <li key={item.slug} className="flex items-center gap-3 border-l-2 border-l-stone-300 pl-4 py-2.5">
            <div className="flex-1 min-w-0">
              <div className="text-sm font-serif-jp">
                {item.flag ? `${item.flag} ` : ''}
                {item[nameKey]}
              </div>
              {item.category && <div className="text-xs text-stone-400 mt-0.5">{item.category}</div>}
              {item.location && <div className="text-xs text-stone-400 mt-0.5">{item.country_name} / {item.location}</div>}
            </div>
            <button
              type="button"
              onClick={() => startEdit(item)}
              className="text-[11px] border border-stone-300 px-3 py-1 hover:border-stone-600 cursor-pointer flex-shrink-0"
            >
              編集
            </button>
          </li>
        ))}
        {items.length === 0 && <li className="text-center text-sm text-stone-400 py-12">データなし</li>}
      </ul>
    </div>
  );
}
