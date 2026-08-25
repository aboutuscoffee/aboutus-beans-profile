import { useState, useMemo } from 'react';
import { uploadSeal, uploadStandaloneSeal, upsertItem, deleteItem, upsertBean } from '../../lib/db';

function extractFarmName(region) {
  if (!region) return '農園未設定';
  const match = region.match(/\[\[([^\|]+)\|farm:[^\]]+\]\]/);
  if (match) return match[1];
  const stripped = region.replace(/\[\[[^\]]+\]\]/g, (m) => {
    const d = m.match(/\[\[([^\|]+)/);
    return d ? d[1] : '';
  }).trim();
  return stripped.split(/[·・]/)[0].trim() || '農園未設定';
}

// 豆に紐づいたシール管理
function BeanSeals({ beans, updateBeans }) {
  const [uploading, setUploading] = useState(null);
  const [error, setError] = useState('');
  const [editingLabel, setEditingLabel] = useState(null); // bean.id
  const [labelInput, setLabelInput] = useState('');
  const [expanded, setExpanded] = useState(new Set());

  const toggleFarm = (key) => setExpanded((prev) => {
    const next = new Set(prev);
    next.has(key) ? next.delete(key) : next.add(key);
    return next;
  });

  const beansWithSeal = beans.filter(b => b.seal_url);
  const beansWithoutSeal = beans
    .filter(b => !b.seal_url)
    .sort((a, b) => (a.status === '終売' ? 1 : 0) - (b.status === '終売' ? 1 : 0));

  const groupedWithSeal = useMemo(() => {
    const map = new Map();
    beansWithSeal.forEach(bean => {
      const key = extractFarmName(bean.region);
      if (!map.has(key)) map.set(key, []);
      map.get(key).push(bean);
    });
    return [...map.entries()];
  }, [beansWithSeal]);

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

  const startEditLabel = (bean) => {
    setEditingLabel(bean.id);
    setLabelInput(bean.seal_name ?? '');
  };

  const saveLabel = async (bean) => {
    const updated = { ...bean, seal_name: labelInput.trim() };
    await upsertBean(updated);
    updateBeans(beans.map(b => String(b.id) === String(bean.id) ? updated : b));
    setEditingLabel(null);
  };

  return (
    <div>
      {error && <p className="text-xs text-red-500 mb-4">{error}</p>}
      <div className="mb-8">
        <p className="text-[11px] tracking-widest text-stone-400 mb-3">未アップロード（{beansWithoutSeal.length}件）</p>
        <div className="space-y-2">
          {beansWithoutSeal.map(bean => (
            <div key={bean.id} className="py-2 border-b border-stone-100">
              <div className="flex items-center gap-3 flex-wrap">
                {editingLabel === bean.id ? (
                  <div className="flex items-center gap-2 flex-1 min-w-0">
                    <input
                      value={labelInput}
                      onChange={e => setLabelInput(e.target.value)}
                      onKeyDown={e => { if (e.key === 'Enter') saveLabel(bean); if (e.key === 'Escape') setEditingLabel(null); }}
                      placeholder={bean.name}
                      autoFocus
                      className="flex-1 min-w-0 bg-transparent border-b border-stone-400 focus:border-stone-700 outline-none py-0.5 text-sm text-stone-400"
                    />
                    <button type="button" onClick={() => saveLabel(bean)} className="text-[11px] border border-stone-700 px-2 py-0.5 cursor-pointer">保存</button>
                    <button type="button" onClick={() => setEditingLabel(null)} className="text-[11px] text-stone-400 cursor-pointer">✕</button>
                  </div>
                ) : (
                  <div className="flex items-center gap-2 flex-1 min-w-0">
                    <span className={`text-sm truncate ${bean.status === '終売' ? 'text-stone-300' : 'text-stone-400'}`}>{bean.seal_name || bean.name}</span>
                    {bean.seal_name && <span className="text-[10px] text-stone-300 truncate">({bean.name})</span>}
                    {bean.status === '終売' && <span className="text-[10px] text-stone-300">終売</span>}
                    <button type="button" onClick={() => startEditLabel(bean)} className="text-[10px] text-stone-400 hover:text-stone-600 cursor-pointer flex-shrink-0">ラベル編集</button>
                  </div>
                )}
                <label className="cursor-pointer">
                  <span className={`text-xs border px-3 py-1 whitespace-nowrap ${uploading === bean.id ? 'text-stone-300 border-stone-200' : 'border-stone-400 hover:border-stone-700 cursor-pointer'}`}>
                    {uploading === bean.id ? 'アップロード中...' : 'アップロード'}
                  </span>
                  <input type="file" accept=".pdf,.png,.jpg,.jpeg,.ai"
                    onChange={e => handleUpload(bean, e.target.files?.[0])}
                    disabled={uploading === bean.id} className="hidden" />
                </label>
              </div>
            </div>
          ))}
        </div>
      </div>
      <div className="mb-6">
        <p className="text-[11px] tracking-widest text-stone-400 mb-3">アップロード済み（{beansWithSeal.length}件）</p>
        {beansWithSeal.length === 0 ? (
          <p className="text-sm text-stone-400">まだありません</p>
        ) : (
          <div className="space-y-3">
            {groupedWithSeal.map(([farm, farmBeans]) => (
              <div key={farm}>
                <button
                  type="button"
                  onClick={() => toggleFarm(farm)}
                  className="flex items-center gap-2 w-full text-left py-2 border-b border-stone-200 cursor-pointer hover:text-stone-700"
                >
                  <span className="text-[10px] text-stone-400 w-3">{!expanded.has(farm) ? '▶' : '▼'}</span>
                  <span className="text-[11px] tracking-widest text-stone-600 font-medium">{farm}</span>
                  <span className="text-[10px] text-stone-400">({farmBeans.length})</span>
                </button>
                {!!expanded.has(farm) && (
                  <div className="space-y-0 pl-3">
                    {farmBeans.map(bean => (
                      <div key={bean.id} className="py-2 border-b border-stone-100">
                        <div className="flex items-center gap-3 flex-wrap">
                          {editingLabel === bean.id ? (
                            <div className="flex items-center gap-2 flex-1 min-w-0">
                              <input
                                value={labelInput}
                                onChange={e => setLabelInput(e.target.value)}
                                onKeyDown={e => { if (e.key === 'Enter') saveLabel(bean); if (e.key === 'Escape') setEditingLabel(null); }}
                                placeholder={bean.name}
                                autoFocus
                                className="flex-1 min-w-0 bg-transparent border-b border-stone-400 focus:border-stone-700 outline-none py-0.5 text-sm"
                              />
                              <button type="button" onClick={() => saveLabel(bean)} className="text-[11px] border border-stone-700 px-2 py-0.5 cursor-pointer">保存</button>
                              <button type="button" onClick={() => setEditingLabel(null)} className="text-[11px] text-stone-400 cursor-pointer">✕</button>
                            </div>
                          ) : (
                            <div className="flex items-center gap-2 flex-1 min-w-0">
                              <span className="text-sm truncate">{bean.seal_name || bean.name}</span>
                              {bean.seal_name && <span className="text-[10px] text-stone-400 truncate">({bean.name})</span>}
                              <button type="button" onClick={() => startEditLabel(bean)} className="text-[10px] text-stone-400 hover:text-stone-600 cursor-pointer flex-shrink-0">ラベル編集</button>
                            </div>
                          )}
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
                      </div>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
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

const ACTIVE_STATUSES = null; // 終売以外すべて表示
const isActive = (status) => status !== '終売';

function AllPendingView({ beans, updateBeans, seals, updateSeals }) {
  const [uploading, setUploading] = useState(null);
  const [error, setError] = useState('');
  const [editingLabel, setEditingLabel] = useState(null);
  const [labelInput, setLabelInput] = useState('');

  const pendingBeans = beans.filter(b => !b.seal_url && isActive(b.status));
  const pendingSeals = seals.filter(s => !s.url);

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

  const startEditLabel = (bean) => { setEditingLabel(bean.id); setLabelInput(bean.seal_name ?? ''); };
  const saveLabel = async (bean) => {
    const updated = { ...bean, seal_name: labelInput.trim() };
    await upsertBean(updated);
    updateBeans(beans.map(b => String(b.id) === String(bean.id) ? updated : b));
    setEditingLabel(null);
  };

  const handleSealUpload = async (seal, file) => {
    if (!file) return;
    setUploading(`seal-${seal.slug}`);
    setError('');
    try {
      const url = await uploadStandaloneSeal(seal.slug, file);
      const updated = { ...seal, url };
      await upsertItem('seals', updated);
      updateSeals(seals.map(s => s.slug === seal.slug ? updated : s));
    } catch (err) {
      setError(err.message);
    } finally {
      setUploading(null);
    }
  };

  const STATUS_BADGE = { 'リリース中': '#443A35', '確認中': '#C2BCA9', '未リリース': '#C2BCA9' };

  return (
    <div>
      {error && <p className="text-xs text-red-500 mb-4">{error}</p>}

      <div className="mb-8">
        <p className="text-[11px] tracking-widest text-stone-400 mb-3">
          豆シール 未アップロード（{pendingBeans.length}件）
        </p>
        {pendingBeans.length === 0 ? (
          <p className="text-sm text-stone-300">すべてアップロード済みです</p>
        ) : (
          <div className="space-y-2">
            {pendingBeans.map(bean => (
              <div key={bean.id} className="py-2 border-b border-stone-100">
                <div className="flex items-center gap-3 flex-wrap">
                  {editingLabel === bean.id ? (
                    <div className="flex items-center gap-2 flex-1 min-w-0">
                      <input
                        value={labelInput}
                        onChange={e => setLabelInput(e.target.value)}
                        onKeyDown={e => { if (e.key === 'Enter') saveLabel(bean); if (e.key === 'Escape') setEditingLabel(null); }}
                        placeholder={bean.name}
                        autoFocus
                        className="flex-1 min-w-0 bg-transparent border-b border-stone-400 focus:border-stone-700 outline-none py-0.5 text-sm text-stone-400"
                      />
                      <button type="button" onClick={() => saveLabel(bean)} className="text-[11px] border border-stone-700 px-2 py-0.5 cursor-pointer">保存</button>
                      <button type="button" onClick={() => setEditingLabel(null)} className="text-[11px] text-stone-400 cursor-pointer">✕</button>
                    </div>
                  ) : (
                    <div className="flex items-center gap-2 flex-1 min-w-0">
                      <span
                        className="flex-shrink-0 text-[9px] px-1.5 py-0.5 rounded-full"
                        style={{ background: STATUS_BADGE[bean.status] ?? '#C2BCA9', color: '#fff', letterSpacing: '0.04em' }}
                      >
                        {bean.status}
                      </span>
                      <span className="text-sm truncate text-stone-500">{bean.seal_name || bean.name}</span>
                      {bean.seal_name && <span className="text-[10px] text-stone-300 truncate">({bean.name})</span>}
                      <button type="button" onClick={() => startEditLabel(bean)} className="text-[10px] text-stone-400 hover:text-stone-600 cursor-pointer flex-shrink-0">ラベル編集</button>
                    </div>
                  )}
                  <label className="cursor-pointer">
                    <span className={`text-xs border px-3 py-1 whitespace-nowrap ${uploading === bean.id ? 'text-stone-300 border-stone-200' : 'border-stone-400 hover:border-stone-700 cursor-pointer'}`}>
                      {uploading === bean.id ? 'アップロード中...' : 'アップロード'}
                    </span>
                    <input type="file" accept=".pdf,.png,.jpg,.jpeg,.ai"
                      onChange={e => handleUpload(bean, e.target.files?.[0])}
                      disabled={uploading === bean.id} className="hidden" />
                  </label>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <div>
        <p className="text-[11px] tracking-widest text-stone-400 mb-3">
          卸・ブレンド 未アップロード（{pendingSeals.length}件）
        </p>
        {pendingSeals.length === 0 ? (
          <p className="text-sm text-stone-300">すべてアップロード済みです</p>
        ) : (
          <div className="space-y-2">
            {pendingSeals.map(seal => (
              <div key={seal.slug} className="py-2 border-b border-stone-100 flex items-center gap-3">
                <span className="text-sm flex-1 min-w-0 truncate text-stone-500">{seal.name}</span>
                <label className="cursor-pointer">
                  <span className={`text-xs border px-3 py-1 whitespace-nowrap ${uploading === `seal-${seal.slug}` ? 'text-stone-300 border-stone-200' : 'border-stone-400 hover:border-stone-700 cursor-pointer'}`}>
                    {uploading === `seal-${seal.slug}` ? 'アップロード中...' : 'アップロード'}
                  </span>
                  <input type="file" accept=".pdf,.png,.jpg,.jpeg,.ai"
                    onChange={e => handleSealUpload(seal, e.target.files?.[0])}
                    disabled={uploading === `seal-${seal.slug}`} className="hidden" />
                </label>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default function AdminSeals({ beans, updateBeans, seals, updateSeals }) {
  const [section, setSection] = useState('pending');

  const pendingBeanCount = beans.filter(b => !b.seal_url && isActive(b.status)).length;
  const pendingSealCount = seals.filter(s => !s.url).length;
  const pendingTotal = pendingBeanCount + pendingSealCount;

  const TABS = [
    ['pending', `未アップロード${pendingTotal > 0 ? `（${pendingTotal}）` : ''}`],
    ['beans', '豆シール'],
    ['standalone', '卸・オンライン・ブレンド'],
  ];

  return (
    <div>
      <h2 className="font-serif-jp text-xl mb-6">シール管理</h2>
      <div className="flex gap-6 mb-6 border-b border-stone-200 pb-3">
        {TABS.map(([key, label]) => (
          <button key={key} type="button" onClick={() => setSection(key)}
            className={`text-[11px] tracking-widest pb-2 -mb-px border-b transition-colors cursor-pointer ${
              section === key ? 'border-stone-700 text-stone-900' : 'border-transparent text-stone-400 hover:text-stone-600'
            }`}>
            {label}
          </button>
        ))}
      </div>
      {section === 'pending' && (
        <AllPendingView
          beans={beans}
          updateBeans={updateBeans}
          seals={seals}
          updateSeals={updateSeals}
        />
      )}
      {section === 'beans' && <BeanSeals beans={beans} updateBeans={updateBeans} />}
      {section === 'standalone' && <StandaloneSeals seals={seals} updateSeals={updateSeals} />}
    </div>
  );
}
