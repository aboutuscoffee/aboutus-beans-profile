import { useState } from 'react';
import { uploadSeal } from '../../lib/db';
import { upsertBean } from '../../lib/db';

export default function AdminSeals({ beans, updateBeans }) {
  const [uploading, setUploading] = useState(null); // bean id
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
      <h2 className="font-serif-jp text-xl mb-6">シール管理</h2>

      {error && <p className="text-xs text-red-500 mb-4">{error}</p>}

      {/* アップロード済み */}
      <div className="mb-8">
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
                  <input type="file" accept=".pdf,.png,.jpg,.jpeg"
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

      {/* 未アップロード */}
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
                <input type="file" accept=".pdf,.png,.jpg,.jpeg"
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
