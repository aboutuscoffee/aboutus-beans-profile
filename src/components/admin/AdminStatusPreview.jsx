import { useState, useRef } from 'react';
import BeanListView from '../public/BeanListView';
import BeanDetailView from '../public/BeanDetailView';
import { STATUS_ORDER } from '../../constants';
import { uploadBeanImage, uploadSeal, parseSealUrls, serializeSealUrls } from '../../lib/db';

const STATUSES = Object.keys(STATUS_ORDER);

function QuickEditBar({ bean, onSave }) {
  const [form, setForm] = useState({
    status: bean.status,
    is_new: bean.is_new ?? false,
    image_urls: bean.image_urls ?? [],
    seal_url: bean.seal_url ?? '',
  });
  const [imgUploading, setImgUploading] = useState(false);
  const [imgError, setImgError] = useState('');
  const [sealUploading, setSealUploading] = useState([false, false]);
  const [sealError, setSealError] = useState('');
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [open, setOpen] = useState(true);
  const dragIndex = useRef(null);

  const sealUrls = parseSealUrls(form.seal_url);

  const dirty =
    form.status !== bean.status ||
    form.is_new !== (bean.is_new ?? false) ||
    JSON.stringify(form.image_urls) !== JSON.stringify(bean.image_urls ?? []) ||
    form.seal_url !== (bean.seal_url ?? '');

  const handleSave = async () => {
    setSaving(true);
    await onSave({ ...bean, ...form });
    setSaving(false);
    setSaved(true);
    setTimeout(() => setSaved(false), 1500);
  };

  // --- 画像 ---
  const handleImageUpload = async (file) => {
    if (!file || !bean.id) return;
    setImgUploading(true);
    setImgError('');
    try {
      const url = await uploadBeanImage(bean.id, file);
      setForm((f) => ({ ...f, image_urls: [...(f.image_urls ?? []), url] }));
    } catch (e) {
      setImgError(e.message);
    } finally {
      setImgUploading(false);
    }
  };

  const handleImageDelete = (i) =>
    setForm((f) => ({ ...f, image_urls: (f.image_urls ?? []).filter((_, idx) => idx !== i) }));

  const handleImageDrop = (dropIndex) => {
    const from = dragIndex.current;
    if (from === null || from === dropIndex) return;
    const next = [...(form.image_urls ?? [])];
    const [moved] = next.splice(from, 1);
    next.splice(dropIndex, 0, moved);
    dragIndex.current = null;
    setForm((f) => ({ ...f, image_urls: next }));
  };

  // --- シール ---
  const handleSealUpload = async (e, slotIndex) => {
    const file = e.target.files?.[0];
    if (!file || !bean.id) return;
    setSealUploading((s) => s.map((v, i) => (i === slotIndex ? true : v)));
    setSealError('');
    try {
      const url = await uploadSeal(bean.id, file, slotIndex);
      const next = [...sealUrls];
      next[slotIndex] = url;
      setForm((f) => ({ ...f, seal_url: serializeSealUrls(next[0], next[1]) }));
    } catch (e) {
      setSealError(e.message);
    } finally {
      setSealUploading((s) => s.map((v, i) => (i === slotIndex ? false : v)));
    }
  };

  const handleSealDelete = (slotIndex) => {
    const next = [...sealUrls];
    next[slotIndex] = '';
    setForm((f) => ({ ...f, seal_url: serializeSealUrls(next[0], next[1]) }));
  };

  return (
    <div
      className="fixed bottom-0 left-0 right-0 z-10 border-t"
      style={{ backgroundColor: '#1A181A', borderColor: '#2a2828' }}
    >
      {/* トグルヘッダー */}
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        className="w-full flex items-center justify-between px-6 py-2 cursor-pointer"
        style={{ borderBottom: open ? '0.5px solid #2a2828' : 'none' }}
      >
        <span className="text-[10px] tracking-widest" style={{ color: '#5a5248' }}>クイック編集</span>
        <span className="text-[10px]" style={{ color: '#5a5248' }}>{open ? '▼' : '▲'}</span>
      </button>

      {open && (
        <div className="max-w-2xl mx-auto px-6 py-4 space-y-4">

          {/* ステータス / NEW */}
          <div className="flex items-center gap-4 flex-wrap">
            <div className="flex items-center gap-2">
              <span className="text-[10px] tracking-widest" style={{ color: '#6a6258' }}>STATUS</span>
              <select
                value={form.status}
                onChange={(e) => setForm((f) => ({ ...f, status: e.target.value }))}
                className="text-xs py-1 px-2 outline-none cursor-pointer"
                style={{ backgroundColor: '#2a2520', color: '#D4CFC8', border: '0.5px solid #3a3228' }}
              >
                {STATUSES.map((s) => (
                  <option key={s} value={s}>{s}</option>
                ))}
              </select>
            </div>
            <label className="flex items-center gap-1.5 cursor-pointer">
              <input
                type="checkbox"
                checked={form.is_new}
                onChange={(e) => setForm((f) => ({ ...f, is_new: e.target.checked }))}
                className="accent-stone-400"
              />
              <span className="text-[10px] tracking-widest" style={{ color: '#6a6258' }}>NEW</span>
            </label>
          </div>

          {/* 画像 */}
          <div>
            <span className="block text-[10px] tracking-widest mb-2" style={{ color: '#6a6258' }}>画像</span>
            <div className="flex gap-2 flex-wrap items-start">
              {(form.image_urls ?? []).map((url, i) => (
                <div
                  key={url}
                  draggable
                  onDragStart={() => { dragIndex.current = i; }}
                  onDragOver={(e) => e.preventDefault()}
                  onDrop={() => handleImageDrop(i)}
                  className="relative overflow-hidden cursor-grab active:cursor-grabbing"
                  style={{ width: '56px', height: '72px', border: '0.5px solid #3a3228' }}
                >
                  <img src={url} alt="" className="w-full h-full object-cover pointer-events-none" />
                  <button
                    type="button"
                    onClick={() => handleImageDelete(i)}
                    className="absolute top-0.5 right-0.5 text-[9px] leading-none px-0.5 cursor-pointer"
                    style={{ backgroundColor: '#1A181A', color: '#e05a5a' }}
                  >✕</button>
                </div>
              ))}
              <label
                className="flex items-center justify-center cursor-pointer"
                style={{ width: '56px', height: '72px', border: '0.5px solid #3a3228' }}
              >
                <span className="text-[9px]" style={{ color: '#6a6258' }}>
                  {imgUploading ? '…' : '＋'}
                </span>
                <input
                  type="file"
                  accept=".jpg,.jpeg,.png"
                  className="hidden"
                  disabled={imgUploading}
                  onChange={(e) => handleImageUpload(e.target.files?.[0])}
                />
              </label>
            </div>
            {imgError && <p className="text-[10px] mt-1" style={{ color: '#e05a5a' }}>{imgError}</p>}
          </div>

          {/* シール */}
          <div>
            <span className="block text-[10px] tracking-widest mb-2" style={{ color: '#6a6258' }}>シールデータ</span>
            <div className="space-y-2">
              {[0, 1].map((slotIndex) => (
                <div key={slotIndex} className="flex items-center gap-3">
                  <span className="text-[9px] w-5" style={{ color: '#5a5248' }}>#{slotIndex + 1}</span>
                  {sealUrls[slotIndex] ? (
                    <>
                      <a
                        href={sealUrls[slotIndex]}
                        target="_blank"
                        rel="noreferrer"
                        className="text-[10px] underline truncate max-w-[160px]"
                        style={{ color: '#a09880' }}
                      >
                        ファイルを確認
                      </a>
                      <button
                        type="button"
                        onClick={() => handleSealDelete(slotIndex)}
                        className="text-[10px] cursor-pointer"
                        style={{ color: '#e05a5a' }}
                      >
                        削除
                      </button>
                    </>
                  ) : (
                    <label className="cursor-pointer">
                      <span
                        className="inline-block text-[10px] px-3 py-1 transition-colors"
                        style={{ border: `0.5px solid ${sealUploading[slotIndex] ? '#3a3228' : '#6a6258'}`, color: sealUploading[slotIndex] ? '#3a3228' : '#a09880' }}
                      >
                        {sealUploading[slotIndex] ? 'アップロード中…' : 'ファイルを選択'}
                      </span>
                      <input
                        type="file"
                        accept=".pdf,.png,.jpg,.jpeg,.ai"
                        className="hidden"
                        disabled={sealUploading[slotIndex]}
                        onChange={(e) => handleSealUpload(e, slotIndex)}
                      />
                    </label>
                  )}
                </div>
              ))}
            </div>
            {sealError && <p className="text-[10px] mt-1" style={{ color: '#e05a5a' }}>{sealError}</p>}
          </div>

          {/* 保存 */}
          <div className="flex justify-end pt-1">
            <button
              type="button"
              onClick={handleSave}
              disabled={!dirty || saving}
              className="text-[10px] tracking-widest px-6 py-1.5 transition-colors cursor-pointer disabled:opacity-30 disabled:cursor-not-allowed"
              style={{
                border: saved ? '0.5px solid #5a8a5a' : '0.5px solid #6a6258',
                color: saved ? '#8aaa8a' : '#a09880',
              }}
            >
              {saving ? '保存中…' : saved ? '保存しました' : '保存'}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export default function AdminStatusPreview({ status, data, updateBeans, onClose }) {
  const [detail, setDetail] = useState(null);
  const [localBeans, setLocalBeans] = useState(data.beans);
  const filtered = localBeans.filter((b) => b.status === status);

  const openBean = (id) => {
    const bean = localBeans.find((b) => String(b.id) === String(id));
    if (bean) setDetail(bean);
  };

  const navigateTo = (type, id) => {
    if (type === 'beans') openBean(id);
  };

  const handleQuickSave = async (updated) => {
    const next = localBeans.map((b) => (String(b.id) === String(updated.id) ? updated : b));
    setLocalBeans(next);
    setDetail(updated);
    await updateBeans(next);
  };

  return (
    <div
      className="fixed inset-0 z-50 overflow-y-auto"
      style={{ backgroundColor: '#FAFAF8', color: '#1A181A' }}
    >
      {/* ヘッダー */}
      <header style={{ backgroundColor: '#1A181A' }}>
        <div className="max-w-2xl mx-auto px-6 py-5 flex items-center justify-between">
          <button
            type="button"
            onClick={detail ? () => setDetail(null) : onClose}
            className="text-[11px] tracking-widest transition-colors cursor-pointer"
            style={{ color: '#5a5248', border: '0.5px solid #3a3228', padding: '4px 12px' }}
          >
            {detail ? '← 一覧へ戻る' : '← 閉じる'}
          </button>
          <span
            className="font-serif-jp text-sm font-light tracking-wide"
            style={{ color: '#F8F6F2' }}
          >
            {status}
            <span className="ml-2 text-[11px]" style={{ color: '#5a5248' }}>
              {filtered.length}件
            </span>
          </span>
          <div style={{ width: '80px' }} />
        </div>
      </header>

      <div className="max-w-2xl mx-auto px-6 pt-8 font-sans-jp" style={{ paddingBottom: detail ? '320px' : '96px' }}>
        {detail ? (
          <BeanDetailView
            bean={detail}
            onBack={() => setDetail(null)}
            onNavigate={navigateTo}
            backLabel={status}
          />
        ) : (
          <BeanListView beans={filtered} onSelectBean={openBean} />
        )}
      </div>

      {detail && (
        <QuickEditBar
          key={detail.id}
          bean={detail}
          onSave={handleQuickSave}
        />
      )}
    </div>
  );
}
