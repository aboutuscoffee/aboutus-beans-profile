import { useState } from 'react';
import BeanListView from '../public/BeanListView';
import BeanDetailView from '../public/BeanDetailView';
import FarmDetailView from '../public/FarmDetailView';
import ProcessDetailView from '../public/ProcessDetailView';
import TermDetailView from '../public/TermDetailView';
import CountryDetailView from '../public/CountryDetailView';
import AdminBeanForm from './AdminBeanForm';
import { STATUS_ORDER } from '../../constants';
import { uploadBeanImage, uploadCardImage, uploadSeal, parseSealUrls, serializeSealUrls, parseCardUrls, serializeCardUrls } from '../../lib/db';
import { sendPushNotification } from '../../lib/push';

const STATUSES = Object.keys(STATUS_ORDER);

function OwnerSlot({ label, fileUrl, isImage, accept, uploading, onUpload, onDelete, onDropUrl, isDragOver, onDragOver, onDragLeave }) {
  const preview = isImage && fileUrl;
  return (
    <div style={{ minWidth: '100px' }}>
      <span className="block text-[8px] tracking-widest mb-2" style={{ color: '#9a9080' }}>{label}</span>
      {fileUrl ? (
        <div className="relative group" style={{ width: '80px', height: '80px', border: isDragOver ? '1.5px solid #8a7a6a' : '0.5px solid #D0C8BE', overflow: 'hidden', background: '#F0ECE8', transition: 'border-color 0.15s' }}
          onDragOver={onDragOver} onDragLeave={onDragLeave} onDrop={(e) => { e.preventDefault(); const url = e.dataTransfer.getData('text/plain'); if (url) onDropUrl(url); }}>
          {preview
            ? <img src={fileUrl} alt="" className="w-full h-full object-cover" />
            : <div className="w-full h-full flex items-center justify-center text-[9px]" style={{ color: '#7a6a5a' }}>ファイルあり</div>
          }
          <div className="absolute inset-0 flex items-center justify-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity"
            style={{ background: 'rgba(250,250,248,0.9)' }}>
            <label className="cursor-pointer">
              <span className="text-[8px] px-1.5 py-0.5" style={{ border: '0.5px solid #A0978E', color: '#5a5248' }}>
                {uploading ? '…' : '入替'}
              </span>
              <input type="file" accept={accept} onChange={(e) => onUpload(e.target.files?.[0])} disabled={uploading} className="hidden" />
            </label>
            <button type="button" onClick={onDelete}
              className="text-[8px] px-1.5 py-0.5 cursor-pointer" style={{ border: '0.5px solid #c05a5a', color: '#c05a5a' }}>
              削除
            </button>
          </div>
        </div>
      ) : (
        <label className="flex flex-col items-center justify-center cursor-pointer"
          style={{ width: '80px', height: '80px', border: isDragOver ? '1.5px solid #8a7a6a' : '0.5px dashed #C0BAB2', background: isDragOver ? '#EDE8E2' : '#F8F6F2', transition: 'all 0.15s' }}
          onDragOver={onDragOver} onDragLeave={onDragLeave} onDrop={(e) => { e.preventDefault(); const url = e.dataTransfer.getData('text/plain'); if (url) onDropUrl(url); }}>
          <span className="text-[9px] mb-0.5" style={{ color: isDragOver ? '#8a7a6a' : '#c05a5a' }}>{isDragOver ? 'ここへ' : '未'}</span>
          <span className="text-[8px]" style={{ color: '#9a9080' }}>{uploading ? '…' : '＋ 追加'}</span>
          <input type="file" accept={accept} onChange={(e) => onUpload(e.target.files?.[0])} disabled={uploading} className="hidden" />
        </label>
      )}
    </div>
  );
}

function MediaStrip({ bean, onUpdateBean }) {
  const [cardUploading, setCardUploading] = useState([false, false]);
  const [imgUploading, setImgUploading] = useState(false);
  const [sealUploading, setSealUploading] = useState([false, false]);
  const [error, setError] = useState('');
  const [cardDragOver, setCardDragOver] = useState([false, false]);

  const sealUrls = parseSealUrls(bean.seal_url);
  const cardUrls = parseCardUrls(bean.card_image_url);

  const handleCardUpload = async (file, slotIndex) => {
    if (!file) return;
    setCardUploading((s) => s.map((v, i) => i === slotIndex ? true : v));
    setError('');
    try {
      const url = await uploadCardImage(bean.id, file, slotIndex);
      const next = [...cardUrls];
      next[slotIndex] = url;
      await onUpdateBean({ ...bean, card_image_url: serializeCardUrls(next[0], next[1]) });
    } catch (err) {
      setError(err.message);
    } finally {
      setCardUploading((s) => s.map((v, i) => i === slotIndex ? false : v));
    }
  };

  const handleCardDelete = async (slotIndex) => {
    const next = [...cardUrls];
    next[slotIndex] = '';
    await onUpdateBean({ ...bean, card_image_url: serializeCardUrls(next[0], next[1]) });
  };

  const handleCardDrop = async (url, slotIndex) => {
    setCardDragOver([false, false]);
    const next = [...cardUrls];
    next[slotIndex] = url;
    await onUpdateBean({ ...bean, card_image_url: serializeCardUrls(next[0], next[1]) });
  };

  const handleImageUpload = async (file) => {
    if (!file) return;
    setImgUploading(true);
    setError('');
    try {
      const url = await uploadBeanImage(bean.id, file);
      await onUpdateBean({ ...bean, image_urls: [...(bean.image_urls ?? []), url] });
    } catch (err) {
      setError(err.message);
    } finally {
      setImgUploading(false);
    }
  };

  const handleImageDelete = async (index) => {
    await onUpdateBean({ ...bean, image_urls: (bean.image_urls ?? []).filter((_, i) => i !== index) });
  };

  const handleSealUpload = async (file, slotIndex) => {
    if (!file) return;
    setSealUploading((s) => s.map((v, i) => i === slotIndex ? true : v));
    setError('');
    try {
      const url = await uploadSeal(bean.id, file, slotIndex);
      const next = [...sealUrls];
      next[slotIndex] = url;
      await onUpdateBean({ ...bean, seal_url: serializeSealUrls(next[0], next[1]) });
    } catch (err) {
      setError(err.message);
    } finally {
      setSealUploading((s) => s.map((v, i) => i === slotIndex ? false : v));
    }
  };

  const handleSealDelete = async (slotIndex) => {
    const next = [...sealUrls];
    next[slotIndex] = '';
    await onUpdateBean({ ...bean, seal_url: serializeSealUrls(next[0], next[1]) });
  };

  return (
    <div style={{ borderTop: '0.5px solid #E0DCD6', backgroundColor: '#FAFAF8', paddingBottom: '80px' }}>
      <div className="max-w-2xl md:max-w-4xl mx-auto px-6 py-5 space-y-6">
        <div className="flex items-center gap-2">
          <span className="text-[7px] px-1.5 py-px tracking-widest" style={{ color: '#7a6a5a', border: '0.5px solid #D0C8BE' }}>管理用</span>
        </div>

        {/* 専用スロット（カード写真×2 + シール×2） */}
        <div className="flex gap-5 flex-wrap">
          {[0, 1].map((i) => (
            <OwnerSlot
              key={`card-${i}`}
              label={`カード写真 #${i + 1}`}
              fileUrl={cardUrls[i]}
              isImage={true}
              accept=".jpg,.jpeg,.png,.webp"
              uploading={cardUploading[i]}
              onUpload={(f) => handleCardUpload(f, i)}
              onDelete={() => handleCardDelete(i)}
              onDropUrl={(url) => handleCardDrop(url, i)}
              isDragOver={cardDragOver[i]}
              onDragOver={(e) => { e.preventDefault(); setCardDragOver((s) => s.map((v, j) => j === i)); }}
              onDragLeave={() => setCardDragOver([false, false])}
            />
          ))}
          {[0, 1].map((i) => (
            <OwnerSlot
              key={`seal-${i}`}
              label={`シール #${i + 1}`}
              fileUrl={sealUrls[i]}
              isImage={false}
              accept=".pdf,.png,.jpg,.jpeg,.ai"
              uploading={sealUploading[i]}
              onUpload={(f) => handleSealUpload(f, i)}
              onDelete={() => handleSealDelete(i)}
              onDropUrl={() => {}}
              isDragOver={false}
              onDragOver={(e) => e.preventDefault()}
              onDragLeave={() => {}}
            />
          ))}
        </div>

        {/* その他の画像（自由追加） */}
        <div>
          <span className="block text-[8px] tracking-widest mb-2" style={{ color: '#9a9080' }}>その他の画像</span>
          <div className="flex gap-2 flex-wrap items-start">
            {(bean.image_urls ?? []).map((url, i) => (
              <div key={url} className="relative flex-shrink-0" draggable
                onDragStart={(e) => e.dataTransfer.setData('text/plain', url)}
                style={{ width: '56px', height: '56px', border: '0.5px solid #D0C8BE', overflow: 'hidden', cursor: 'grab' }}>
                <img src={url} alt="" className="w-full h-full object-cover pointer-events-none" />
                <button
                  type="button"
                  onClick={() => handleImageDelete(i)}
                  className="absolute top-px right-px flex items-center justify-center cursor-pointer"
                  style={{ width: '13px', height: '13px', background: 'rgba(255,255,255,.9)', color: '#c05a5a', fontSize: '8px', border: 'none' }}
                >✕</button>
              </div>
            ))}
            <label className="flex items-center justify-center flex-shrink-0 cursor-pointer" style={{ width: '56px', height: '56px', border: '0.5px dashed #D0C8BE' }}>
              <span className="text-[8px]" style={{ color: '#9a9080' }}>{imgUploading ? '…' : '＋ 追加'}</span>
              <input type="file" accept=".jpg,.jpeg,.png,.webp" onChange={(e) => handleImageUpload(e.target.files?.[0])} disabled={imgUploading} className="hidden" />
            </label>
          </div>
        </div>

        {error && <p className="text-[10px]" style={{ color: '#c05a5a' }}>{error}</p>}
      </div>
    </div>
  );
}

function StatusBar({ bean, onSave, onBackToList }) {
  const [status, setStatus] = useState(bean.status);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const dirty = status !== bean.status;

  const handleSave = async () => {
    setSaving(true);
    if (status === 'リリース中' && ['編集中', '確認中'].includes(bean.status)) {
      sendPushNotification('New Profile', `${bean.name} が更新されました`).catch(() => {});
    }
    await onSave({ ...bean, status });
    setSaving(false);
    setSaved(true);
    setTimeout(() => setSaved(false), 1500);
  };

  return (
    <div
      className="fixed bottom-0 left-0 right-0 z-10 border-t"
      style={{ backgroundColor: '#1A181A', borderColor: '#2a2828' }}
    >
      <div className="max-w-2xl md:max-w-4xl mx-auto px-6 py-3 flex items-center gap-4">
        <span className="text-[10px] tracking-widest" style={{ color: '#5a5248' }}>STATUS</span>
        <select
          value={status}
          onChange={(e) => setStatus(e.target.value)}
          className="text-xs py-1 px-2 outline-none cursor-pointer"
          style={{ backgroundColor: '#2a2520', color: '#D4CFC8', border: '0.5px solid #3a3228' }}
        >
          {STATUSES.map((s) => (
            <option key={s} value={s}>{s}</option>
          ))}
        </select>
        <button
          type="button"
          onClick={handleSave}
          disabled={!dirty || saving}
          className="ml-auto text-[10px] tracking-widest px-5 py-1.5 transition-colors cursor-pointer disabled:opacity-30 disabled:cursor-not-allowed"
          style={{
            border: saved ? '0.5px solid #5a8a5a' : '0.5px solid #6a6258',
            color: saved ? '#8aaa8a' : '#a09880',
          }}
        >
          {saving ? '保存中…' : saved ? '保存しました' : '保存'}
        </button>
        <button
          type="button"
          onClick={onBackToList}
          className="text-[10px] tracking-widest px-5 py-1.5 transition-colors cursor-pointer"
          style={{ border: '0.5px solid #3a6258', color: '#7a9880' }}
        >
          一覧へ戻る
        </button>
      </div>
    </div>
  );
}

export default function AdminStatusPreview({ status, data, updateBeans, onClose }) {
  const [navStack, setNavStack] = useState([]); // [{type, id}]
  const [editTab, setEditTab] = useState('preview');
  const [localBeans, setLocalBeans] = useState(data.beans);
  const [beanPage, setBeanPage] = useState(1);
  const [beanSearch, setBeanSearch] = useState('');

  const filtered = localBeans.filter((b) => b.status === status);
  const current = navStack[navStack.length - 1] ?? null;
  const prev = navStack[navStack.length - 2] ?? null;

  const navigateTo = (type, id) => {
    setNavStack((s) => [...s, { type, id }]);
    setEditTab('preview');
  };

  const goBack = () => {
    setNavStack((s) => s.slice(0, -1));
    setEditTab('preview');
  };

  const handleSave = async (updated) => {
    const next = localBeans.map((b) => (String(b.id) === String(updated.id) ? updated : b));
    setLocalBeans(next);
    // update current nav entry so detail view reflects changes
    setNavStack((s) => s.map((entry, i) =>
      i === s.length - 1 && entry.type === 'beans' ? { ...entry } : entry
    ));
    await updateBeans(next);
  };

  // resolve current item
  let currentBean = null;
  let currentFarm = null;
  let currentProcess = null;
  let currentTerm = null;
  let currentCountry = null;
  let headerTitle = status;

  if (current) {
    if (current.type === 'beans') {
      currentBean = localBeans.find((b) => String(b.id) === String(current.id));
      headerTitle = currentBean?.name ?? '';
    } else if (current.type === 'farms') {
      currentFarm = data.farms.find((f) => f.slug === current.id);
      headerTitle = currentFarm?.name ?? '';
    } else if (current.type === 'processes') {
      currentProcess = data.processes.find((p) => p.slug === current.id);
      headerTitle = currentProcess?.name ?? '';
    } else if (current.type === 'terms') {
      currentTerm = data.terms.find((t) => t.slug === current.id);
      headerTitle = currentTerm?.name ?? '';
    } else if (current.type === 'countries') {
      currentCountry = data.countries.find((c) => c.slug === current.id);
      headerTitle = currentCountry?.name ?? '';
    }
  }

  // back label
  const backLabel = (() => {
    if (!current) return null;
    if (!prev) return status;
    const labels = { beans: localBeans.find((b) => String(b.id) === String(prev.id))?.name, farms: data.farms.find((f) => f.slug === prev.id)?.name, processes: data.processes.find((p) => p.slug === prev.id)?.name, terms: data.terms.find((t) => t.slug === prev.id)?.name, countries: data.countries.find((c) => c.slug === prev.id)?.name };
    return labels[prev.type] ?? status;
  })();

  const isBean = current?.type === 'beans';

  return (
    <div
      className="fixed inset-0 z-50 overflow-y-auto"
      style={{ backgroundColor: '#FAFAF8', color: '#1A181A' }}
    >
      {/* ヘッダー */}
      <header style={{ backgroundColor: '#1A181A' }}>
        <div className="max-w-2xl md:max-w-4xl mx-auto px-6 py-5 flex items-center justify-between">
          <button
            type="button"
            onClick={current ? goBack : onClose}
            className="text-[11px] tracking-widest transition-colors cursor-pointer"
            style={{ color: '#5a5248', border: '0.5px solid #3a3228', padding: '4px 12px' }}
          >
            {current ? `← ${backLabel ?? status}` : '← 閉じる'}
          </button>
          <span
            className="font-serif-jp text-sm font-light tracking-wide truncate mx-4 text-center"
            style={{ color: '#F8F6F2', maxWidth: '160px' }}
          >
            {headerTitle}
            {!current && (
              <span className="ml-2 text-[11px]" style={{ color: '#5a5248' }}>
                {filtered.length}件
              </span>
            )}
          </span>
          <button
            type="button"
            onClick={onClose}
            className="text-[11px] tracking-widest transition-colors cursor-pointer"
            style={{ color: '#5a5248', border: '0.5px solid #3a3228', padding: '4px 12px' }}
          >
            閉じる
          </button>
        </div>

        {/* プレビュー / 編集 タブ（豆詳細のみ） */}
        {isBean && (
          <div className="max-w-2xl md:max-w-4xl mx-auto px-6 flex gap-6" style={{ borderTop: '0.5px solid #2a2828' }}>
            {['preview', 'edit'].map((t) => (
              <button
                key={t}
                type="button"
                onClick={() => setEditTab(t)}
                className="py-2.5 text-[10px] tracking-widest cursor-pointer transition-colors"
                style={{
                  color: editTab === t ? '#D4CFC8' : '#5a5248',
                  borderBottom: editTab === t ? '1px solid #D4CFC8' : '1px solid transparent',
                }}
              >
                {t === 'preview' ? 'プレビュー' : '編集'}
              </button>
            ))}
          </div>
        )}
      </header>

      <div
        className="max-w-2xl md:max-w-4xl mx-auto px-6 pt-8 font-sans-jp"
        style={{ paddingBottom: isBean && editTab === 'preview' ? '0' : (isBean ? '64px' : '96px') }}
      >
        {/* 豆一覧 */}
        {!current && (
          <BeanListView beans={filtered} onSelectBean={(id) => navigateTo('beans', id)} savedPage={beanPage} onPageChange={setBeanPage} savedSearch={beanSearch} onSearchChange={setBeanSearch} />
        )}

        {/* 豆詳細 */}
        {isBean && currentBean && editTab === 'preview' && (
          <BeanDetailView
            bean={currentBean}
            onBack={goBack}
            onNavigate={navigateTo}
            backLabel={backLabel ?? status}
          />
        )}
        {isBean && currentBean && editTab === 'edit' && (
          <AdminBeanForm
            bean={currentBean}
            onSave={(form) => { handleSave(form); setEditTab('preview'); }}
            onCancel={() => setEditTab('preview')}
            onDelete={() => {}}
          />
        )}

        {/* 農園詳細 */}
        {current?.type === 'farms' && currentFarm && (
          <FarmDetailView
            farm={currentFarm}
            beans={localBeans}
            onBack={goBack}
            onSelectBean={(id) => navigateTo('beans', id)}
            onNavigate={navigateTo}
            backLabel={backLabel ?? status}
          />
        )}

        {/* 精製方法詳細 */}
        {current?.type === 'processes' && currentProcess && (
          <ProcessDetailView
            process={currentProcess}
            beans={localBeans}
            onBack={goBack}
            onSelectBean={(id) => navigateTo('beans', id)}
            onNavigate={navigateTo}
            backLabel={backLabel ?? status}
          />
        )}

        {/* 用語詳細 */}
        {current?.type === 'terms' && currentTerm && (
          <TermDetailView
            term={currentTerm}
            beans={localBeans}
            onBack={goBack}
            onSelectBean={(id) => navigateTo('beans', id)}
            backLabel={backLabel ?? status}
          />
        )}

        {/* 産地詳細 */}
        {current?.type === 'countries' && currentCountry && (
          <CountryDetailView
            country={currentCountry}
            beans={localBeans}
            onBack={goBack}
            onSelectBean={(id) => navigateTo('beans', id)}
            backLabel={backLabel ?? status}
          />
        )}
      </div>

      {/* 画像・シールストリップ（豆詳細プレビュータブのみ） */}
      {isBean && currentBean && editTab === 'preview' && (
        <MediaStrip bean={currentBean} onUpdateBean={handleSave} />
      )}

      {/* ステータスバー（豆詳細のみ） */}
      {isBean && currentBean && (
        <StatusBar
          key={currentBean.id}
          bean={currentBean}
          onSave={handleSave}
          onBackToList={() => setNavStack([])}
        />
      )}
    </div>
  );
}
