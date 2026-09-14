import { useState, useRef } from 'react';
import { STATUS_ORDER } from '../../constants';
import { uploadSeal, uploadBeanImage, parseSealUrls, serializeSealUrls } from '../../lib/db';
import TextInput from '../common/TextInput';
import TextArea from '../common/TextArea';

export const EMPTY_BEAN = {
  name: '', origin: '', region: '', variety: '', altitude: '', process: '', terroir: '', producer: '',
  status: '未リリース', is_new: false, price: 0,
  description_ja: '', description_en: '', taste_ja: '', taste_en: '', detail_ja: '', detail_en: '',
  image_urls: [], seal_name: '',
};

export default function AdminBeanForm({ bean, onSave, onCancel, onDelete }) {
  const [form, setForm] = useState(() => (bean ? { ...bean } : { ...EMPTY_BEAN }));
  const set = (k, v) => setForm((f) => ({ ...f, [k]: v }));
  const [imgUploading, setImgUploading] = useState(false);
  const [imgError, setImgError] = useState('');
  const [sealUploading, setSealUploading] = useState([false, false]);
  const [sealError, setSealError] = useState('');
  const dragIndex = useRef(null);

  const handleImageUpload = async (file) => {
    if (!file || !form.id) return;
    setImgUploading(true);
    setImgError('');
    try {
      const url = await uploadBeanImage(form.id, file);
      set('image_urls', [...(form.image_urls ?? []), url]);
    } catch (err) {
      setImgError(err.message);
    } finally {
      setImgUploading(false);
    }
  };

  const handleImageDelete = (index) => {
    set('image_urls', (form.image_urls ?? []).filter((_, i) => i !== index));
  };

  const handleImageDrop = (dropIndex) => {
    const from = dragIndex.current;
    if (from === null || from === dropIndex) return;
    const next = [...(form.image_urls ?? [])];
    const [moved] = next.splice(from, 1);
    next.splice(dropIndex, 0, moved);
    dragIndex.current = null;
    set('image_urls', next);
  };

  const sealUrls = parseSealUrls(form.seal_url);

  const handleSealUpload = async (e, slotIndex) => {
    const file = e.target.files?.[0];
    if (!file || !form.id) return;
    setSealUploading((s) => s.map((v, i) => i === slotIndex ? true : v));
    setSealError('');
    try {
      const url = await uploadSeal(form.id, file, slotIndex);
      const next = [...sealUrls];
      next[slotIndex] = url;
      set('seal_url', serializeSealUrls(next[0], next[1]));
    } catch (err) {
      setSealError(err.message);
    } finally {
      setSealUploading((s) => s.map((v, i) => i === slotIndex ? false : v));
    }
  };

  const handleSealDelete = (slotIndex) => {
    const next = [...sealUrls];
    next[slotIndex] = '';
    set('seal_url', serializeSealUrls(next[0], next[1]));
  };

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

      <div className="border-t border-stone-200 pt-4">
        <span className="block text-[11px] tracking-widest text-stone-500 mb-1">
          テイストスコア（0〜5・0.5刻み・空欄で顧客向けページのレーダーチャート非表示）
        </span>
        <div className="grid grid-cols-3 gap-4 mt-2">
          <TextInput label="Aroma" value={form.score_aroma} onChange={(v) => set('score_aroma', v)} type="number" />
          <TextInput label="Flavor" value={form.score_flavor} onChange={(v) => set('score_flavor', v)} type="number" />
          <TextInput label="Mouthfeel" value={form.score_mouthfeel} onChange={(v) => set('score_mouthfeel', v)} type="number" />
          <TextInput label="Sweetness" value={form.score_sweetness} onChange={(v) => set('score_sweetness', v)} type="number" />
          <TextInput label="Acidity" value={form.score_acidity} onChange={(v) => set('score_acidity', v)} type="number" />
          <TextInput label="Aftertaste" value={form.score_aftertaste} onChange={(v) => set('score_aftertaste', v)} type="number" />
        </div>
      </div>

      <TextArea label="詳細（日本語）" value={form.detail_ja} onChange={(v) => set('detail_ja', v)} rows={3} />
      <TextArea label="詳細（English）" value={form.detail_en} onChange={(v) => set('detail_en', v)} rows={2} />

      <div className="border-t border-stone-200 pt-4">
        <span className="block text-[11px] tracking-widest text-stone-500 mb-3">画像（JPEG / PNG）</span>
        {!form.id ? (
          <p className="text-[11px] text-stone-400">※ 先に保存してからアップロードできます</p>
        ) : (
          <div className="flex gap-3 flex-wrap items-start">
            {(form.image_urls ?? []).map((url, i) => (
              <div
                key={url}
                draggable
                onDragStart={() => { dragIndex.current = i; }}
                onDragOver={(e) => e.preventDefault()}
                onDrop={() => handleImageDrop(i)}
                className="relative w-24 h-24 border border-stone-200 overflow-hidden cursor-grab active:cursor-grabbing"
              >
                <img src={url} alt="" className="w-full h-full object-cover pointer-events-none" />
                <button
                  type="button"
                  onClick={() => handleImageDelete(i)}
                  className="absolute top-0.5 right-0.5 bg-white text-red-400 hover:text-red-600 text-[10px] leading-none p-0.5 cursor-pointer"
                >✕</button>
              </div>
            ))}
            <label className="w-24 h-24 border border-stone-200 flex items-center justify-center cursor-pointer hover:bg-stone-50">
              <span className="text-[10px] text-stone-400">{imgUploading ? '...' : '+ 追加'}</span>
              <input type="file" accept=".jpg,.jpeg,.png" onChange={e => handleImageUpload(e.target.files?.[0])} disabled={imgUploading} className="hidden" />
            </label>
          </div>
        )}
        {imgError && <p className="text-[11px] text-red-500 mt-2">{imgError}</p>}
      </div>

      <div className="border-t border-stone-200 pt-4">
        {!form.id ? (
          <p className="text-[11px] text-stone-400">※ 先に保存してからアップロードできます</p>
        ) : (
          <div className="space-y-3">
            {[0, 1].map((slotIndex) => (
              <div key={slotIndex} className="flex items-center gap-3">
                <span className="text-[11px] text-stone-400 w-10">#{slotIndex + 1}</span>
                {sealUrls[slotIndex] ? (
                  <>
                    <a href={sealUrls[slotIndex]} target="_blank" rel="noreferrer"
                      className="text-xs underline text-stone-600 truncate max-w-[180px]">
                      ファイルを確認
                    </a>
                    <button type="button" onClick={() => handleSealDelete(slotIndex)}
                      className="text-[10px] text-red-400 hover:text-red-600 cursor-pointer flex-shrink-0">
                      削除
                    </button>
                  </>
                ) : (
                  <label className="cursor-pointer">
                    <span className={`inline-block text-xs border px-4 py-1.5 transition-colors ${sealUploading[slotIndex] ? 'border-stone-200 text-stone-300' : 'border-stone-400 hover:border-stone-700'}`}>
                      {sealUploading[slotIndex] ? 'アップロード中...' : 'ファイルを選択'}
                    </span>
                    <input type="file" accept=".pdf,.png,.jpg,.jpeg,.ai" onChange={e => handleSealUpload(e, slotIndex)} disabled={sealUploading[slotIndex]} className="hidden" />
                  </label>
                )}
              </div>
            ))}
          </div>
        )}
        {sealError && <p className="text-[11px] text-red-500 mt-1">{sealError}</p>}
      </div>

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
