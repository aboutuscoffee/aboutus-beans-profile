import { useState } from 'react';
import { uploadSeal, uploadStandaloneSeal, upsertItem, deleteItem, upsertBean } from '../../lib/db';

// 豆に紐づいたシール管理
function BeanSeals({ beans, updateBeans }) {
  const [uploading, setUploading] = useState(null);
  const [error, setError] = useState('');

  const beansWithSeal = beans.filter(b => b.seal_url);
  const beansWithoutSeal = beans.filter(b => !b.seal_url);

  const handleUpload = async (bean, file) => {
    if (!file) return;
    setUploading(bean.id);
    setError('');
    try {
      const url = await uploadSeal(bean.id, file);
      const updated = { ...bean, seal_url: url };
      await upsertBean(updated);
      updateBeans(beans.map(b => String(b.id) === String(bean.id) ? updated : b));
    } catch (err) {
      setError(err.message);
    } finally {
      setUploading(null);
    }
  };

  const handleDelete = async (bean) => {
    if (!window.confirm(`「${bean.name}」のシールデータを削除しますか？`)) return;
    const updated = { ...bean, seal_url: '' };
    await upsertBean(updated);
    updateBeans(beans.map(b => String(b.id) === String(bean.id) ? updated : b));
  };

  return (
    <div>
      {error && <p className="text-xs text-red-500 mb-4">{error}</p>}
      <div className="mb-6">
        <p className="text-[11px] tracking-widest text-stone-400 mb-3">アップロード済み（{beansWithSeal.length}件）</p>
        {beansWithSeal.length === 0 ? (
          <p className="text-sm text-stone-400">まだありません</p>
        ) : (
          <div className="space-y-2">
            {beansWithSeal.map(bean => (
              <div key={bean.id} className="flex items-center gap-3 py-2 border-b border-stone-100 flex-wrap">
                <span className="text-sm flex-1 min-w-0 truncate">{bean.name}</span>
                <a href={bean.seal_url} target="_blank" rel="noreferrer"
                  className="text-xs underline text-stone-600 whitespace-nowrap">
                  開く / 印刷
                </a>
                <label className="cursor-pointer">
                  <span className={`text-xs border px-3 py-1 whitespace-nowrap ${uploading === bean.id ? 'text-stone-300 border-stone-200' : 'border-stone-400 hover:border-stone-700 cursor-pointer'}`}>
                    {uploading === bean.id ? '更新中...' : '差し替え'}
                  </span>
                  <input type="file" accept=".pdf,.png,.jpg,.jpeg,.ai"
                    onChange={e => handleUpload(bean, e.target.files?.[0])}
                    disabled={uploading === bean.id} className="hidden" />
                </label>
                <button type="button" onClick={() => handleDelete(bean)}
                  className="text-xs text-red-400 hover:text-red-600 cursor-pointer whitespace-nowrap">
                  削除
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
      <div>
        <p className="text-[11px] tracking-widest text-stone-400 mb-3">未アップロード（{beansWithoutSeal.length}件）</p>
        <div className="space-y-2">
          {beansWithoutSeal.map(bean => (
            <div key={bean.id} className="flex items-center gap-3 py-2 border-b border-stone-100 flex-wrap">
              <span className="text-sm flex-1 min-w-0 truncate text-stone-400">{bean.name}</span>
              <label className="cursor-pointer">
                <span className={`text-xs border px-3 py-1 whitespace-nowrap ${uploading === bean.id ? 'text-stone-300 border-stone-200' : 'border-stone-400 hover:border-stone-700 cursor-pointer'}`}>
                  {uploading === bean.id ? 'アップロード中...' : 'アップロード'}
                </span>
                <input type="file" accept=".pdf,.png,.jpg,.jpeg,.ai"
                  onChange={e => handleUpload(bean, e.target.files?.[0])}
                  disabled={uploading === bean.id} className="hidden" />
              </label>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

const EMPTY_SEAL = { slug: '', name: '', url: '' };

// 独立シール管理
function StandaloneSeals({ seals, updateSeals }) {
  const [editing, setEditing] = useState(null); // null | 'new' | seal object
  const [form, setForm] = useState(EMPTY_SEAL);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState('');

  const set = (k, v) => setForm(f => ({ ...f, [k]: v }));

  const openNew = () => {
    setForm(EMPTY_SEAL);
    setEditing('new');
    setError('');
  };

  const openEdit = (seal) => {
    setForm({ ...seal });
    setEditing(seal);
    setError('');
  };

  const cancel = () => { setEditing(null); setError(''); };

  const handleUpload = async (file) => {
    if (!file) return;
    if (!form.slug.trim()) {
      setError('先にスラッグを入力してください');
      return;
    }
    setUploading(true);
    setError('');
    try {
      const url = await uploadStandaloneSeal(form.slug.trim(), file);
      set('url', url);
    } catch (err) {
      setError(err.message);
    } finally {
      setUploading(false);
    }
  };

  const handleSave = async () => {
    if (!form.slug.trim() || !form.name.trim()) {
      setError('スラッグと名前は必須です');
      return;
    }
    setError('');
    try {
      await upsertItem('seals', form);
      if (editing === 'new') {
        updateSeals([...seals, form]);
      } else {
        updateSeals(seals.map(s => s.slug === editing.slug ? form : s));
      }
      setEditing(null);
    } catch (err) {
      setError(err.message);
    }
  };

  const handleDelete = async (seal) => {
    if (!window.confirm(`「${seal.name}」を削除しますか？`)) return;
    try {
      await deleteItem('seals', seal.slug);
      updateSeals(seals.filter(s => s.slug !== seal.slug));
    } catch (err) {
      setError(err.message);
    }
  };

  if (editing) {
    return (
      <div>
        <div onClick={cancel} className="cursor-pointer text-xs text-stone-400 hover:text-stone-600 mb-4 tracking-wide">
          ← 一覧へ戻る
        </div>
        <h3 className="text-sm tracking-widest text-stone-600 mb-4">
          {editing === 'new' ? 'シールを追加' : 'シールを編集'}
        </h3>
        <div className="space-y-4">
          <div>
            <span className="block text-[11px] tracking-widest text-stone-500 mb-1">スラッグ *（英数字・ハイフン）</span>
            <input
              value={form.slug}
              onChange={e => set('slug', e.target.value)}
              disabled={editing !== 'new'}
              className="w-full bg-transparent border-b border-stone-300 focus:border-stone-600 outline-none py-1.5 text-sm disabled:text-stone-400"
            />
          </div>
          <div>
            <span className="block text-[11px] tracking-widest text-stone-500 mb-1">名前 *</span>
            <input
              value={form.name}
              onChange={e => set('name', e.target.value)}
              className="w-full bg-transparent border-b border-stone-300 focus:border-stone-600 outline-none py-1.5 text-sm"
            />
          </div>
          <div>
            <span className="block text-[11px] tracking-widest text-stone-500 mb-2">ファイル</span>
            {form.url && (
              <div className="flex items-center gap-3 mb-2">
                <a href={form.url} target="_blank" rel="noreferrer"
                  className="text-xs underline text-stone-600 truncate max-w-xs">
                  現在のファイルを確認
                </a>
                <button type="button" onClick={() => set('url', '')}
                  className="text-[10px] text-red-400 hover:text-red-600 cursor-pointer">
                  削除
                </button>
              </div>
            )}
            <label className="cursor-pointer">
              <span className={`inline-block text-xs border px-4 py-1.5 transition-colors ${uploading ? 'border-stone-200 text-stone-300' : 'border-stone-400 hover:border-stone-700 cursor-pointer'}`}>
                {uploading ? 'アップロード中...' : 'ファイルを選択'}
              </span>
              <input type="file" accept=".pdf,.png,.jpg,.jpeg,.ai"
                onChange={e => handleUpload(e.target.files?.[0])}
                disabled={uploading} className="hidden" />
            </label>
            <p className="text-[10px] text-stone-400 mt-1">※ スラッグを入力してからアップロードしてください</p>
          </div>
          {error && <p className="text-xs text-red-500">{error}</p>}
          <div className="flex gap-3 pt-2 flex-wrap">
            <button type="button" onClick={handleSave}
              className="text-xs tracking-widest border border-stone-700 px-6 py-2 hover:bg-stone-800 hover:text-white transition-colors cursor-pointer">
              保存
            </button>
            <button type="button" onClick={cancel}
              className="text-xs tracking-widest border border-stone-300 px-6 py-2 hover:border-stone-600 cursor-pointer">
              キャンセル
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div>
      {error && <p className="text-xs text-red-500 mb-4">{error}</p>}
      <div className="flex items-center justify-between mb-3">
        <p className="text-[11px] tracking-widest text-stone-400">登録済み（{seals.length}件）</p>
        <button type="button" onClick={openNew}
          className="text-xs tracking-widest border border-stone-700 px-4 py-1.5 hover:bg-stone-800 hover:text-white transition-colors cursor-pointer">
          + 追加
        </button>
      </div>
      {seals.length === 0 ? (
        <p className="text-sm text-stone-400">まだありません</p>
      ) : (
        <div className="space-y-2">
          {seals.map(seal => (
            <div key={seal.slug} className="flex items-center gap-3 py-2 border-b border-stone-100 flex-wrap">
              <span className="text-sm flex-1 min-w-0 truncate">{seal.name}</span>
              {seal.url && (
                <a href={seal.url} target="_blank" rel="noreferrer"
                  className="text-xs underline text-stone-600 whitespace-nowrap">
                  開く / 印刷
                </a>
              )}
              <button type="button" onClick={() => openEdit(seal)}
                className="text-xs border border-stone-300 px-3 py-1 hover:border-stone-600 cursor-pointer whitespace-nowrap">
                編集
              </button>
              <button type="button" onClick={() => handleDelete(seal)}
                className="text-xs text-red-400 hover:text-red-600 cursor-pointer whitespace-nowrap">
                削除
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default function AdminSeals({ beans, updateBeans, seals, updateSeals }) {
  const [section, setSection] = useState('beans');

  return (
    <div>
      <h2 className="font-serif-jp text-xl mb-6">シール管理</h2>
      <div className="flex gap-6 mb-6 border-b border-stone-200 pb-3">
        {[['beans', '豆シール'], ['standalone', '卸・オンライン・ブレンド']].map(([key, label]) => (
          <button key={key} type="button" onClick={() => setSection(key)}
            className={`text-[11px] tracking-widest pb-2 -mb-px border-b transition-colors cursor-pointer ${
              section === key ? 'border-stone-700 text-stone-900' : 'border-transparent text-stone-400 hover:text-stone-600'
            }`}>
            {label}
          </button>
        ))}
      </div>
      {section === 'beans'
        ? <BeanSeals beans={beans} updateBeans={updateBeans} />
        : <StandaloneSeals seals={seals} updateSeals={updateSeals} />
      }
    </div>
  );
}
