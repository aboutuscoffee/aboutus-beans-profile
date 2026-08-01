import { useState } from 'react';
import { uploadBeanImage, upsertBean } from '../../lib/db';
import { stripWikiLinks } from '../../utils';
import { STATUS_ORDER } from '../../constants';

export default function AdminImages({ beans, updateBeans, onGoToBeans }) {
  const [uploading, setUploading] = useState(null);
  const [error, setError] = useState('');

  const sorted = [...beans].sort((a, b) => {
    const sa = STATUS_ORDER[a.status] ?? 99;
    const sb = STATUS_ORDER[b.status] ?? 99;
    return sa !== sb ? sa - sb : (b.price || 0) - (a.price || 0);
  });

  const withImages = sorted.filter(b => b.image_urls?.filter(Boolean).length > 0);
  const withoutImages = sorted.filter(b => !b.image_urls?.filter(Boolean).length);

  const handleUpload = async (bean, file) => {
    if (!file || !bean.id) return;
    setUploading(bean.id);
    setError('');
    try {
      const url = await uploadBeanImage(bean.id, file);
      const updated = { ...bean, image_urls: [...(bean.image_urls ?? []), url] };
      await upsertBean(updated);
      updateBeans(beans.map(b => String(b.id) === String(bean.id) ? updated : b));
    } catch (err) {
      setError(err.message);
    } finally {
      setUploading(null);
    }
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-6 gap-4 flex-wrap">
        <h2 className="font-serif-jp text-xl">
          画像管理
          <span className="text-sm font-sans text-stone-400 ml-2">
            ({withImages.length}/{beans.length} 件アップロード済み)
          </span>
        </h2>
        <button
          type="button"
          onClick={onGoToBeans}
          className="text-xs tracking-widest border border-stone-400 px-4 py-2 hover:border-stone-700 cursor-pointer"
        >
          → 豆管理で編集
        </button>
      </div>

      {error && <p className="text-xs text-red-500 mb-4">{error}</p>}

      <div className="mb-8">
        <p className="text-[11px] tracking-widest text-stone-400 mb-3">
          未アップロード（{withoutImages.length}件）
        </p>
        {withoutImages.length === 0 ? (
          <p className="text-sm text-stone-400">すべての豆に画像があります</p>
        ) : (
          <div className="space-y-2">
            {withoutImages.map(bean => (
              <div key={bean.id} className="flex items-center gap-3 py-2 border-b border-stone-100 flex-wrap">
                <div className="flex-1 min-w-0">
                  <span className="text-sm text-stone-400 truncate block">{bean.name}</span>
                  <span className="text-[10px] text-stone-300">{stripWikiLinks(bean.origin)}</span>
                </div>
                <label className="cursor-pointer">
                  <span className={`text-xs border px-3 py-1 whitespace-nowrap ${uploading === bean.id ? 'text-stone-300 border-stone-200' : 'border-stone-400 hover:border-stone-700'}`}>
                    {uploading === bean.id ? 'アップロード中...' : 'アップロード'}
                  </span>
                  <input
                    type="file"
                    accept=".jpg,.jpeg,.png"
                    onChange={e => handleUpload(bean, e.target.files?.[0])}
                    disabled={uploading === bean.id}
                    className="hidden"
                  />
                </label>
              </div>
            ))}
          </div>
        )}
      </div>

      <div>
        <p className="text-[11px] tracking-widest text-stone-400 mb-3">
          アップロード済み（{withImages.length}件）
        </p>
        <div className="space-y-3">
          {withImages.map(bean => (
            <div key={bean.id} className="py-2 border-b border-stone-100">
              <div className="flex items-center gap-3 mb-2 flex-wrap">
                <div className="flex-1 min-w-0">
                  <span className="text-sm truncate block">{bean.name}</span>
                  <span className="text-[10px] text-stone-400">{stripWikiLinks(bean.origin)}</span>
                </div>
                <span className="text-[11px] text-stone-400 whitespace-nowrap">
                  {bean.image_urls.filter(Boolean).length}枚
                </span>
                <label className="cursor-pointer">
                  <span className={`text-xs border px-3 py-1 whitespace-nowrap ${uploading === bean.id ? 'text-stone-300 border-stone-200' : 'border-stone-300 hover:border-stone-600'}`}>
                    {uploading === bean.id ? '追加中...' : '+ 追加'}
                  </span>
                  <input
                    type="file"
                    accept=".jpg,.jpeg,.png"
                    onChange={e => handleUpload(bean, e.target.files?.[0])}
                    disabled={uploading === bean.id}
                    className="hidden"
                  />
                </label>
              </div>
              <div className="flex gap-2 flex-wrap">
                {bean.image_urls.filter(Boolean).map((url, i) => (
                  <a key={i} href={url} target="_blank" rel="noreferrer">
                    <img
                      src={url}
                      alt=""
                      className="w-14 h-14 object-cover border border-stone-200 hover:opacity-80 transition-opacity"
                    />
                  </a>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
