import { useState } from 'react';
import { STATUS_ORDER, STATUS_COLORS } from '../../constants';
import { subscribeToPush, sendPushNotification } from '../../lib/push';
import { uploadCardImage, uploadSeal, parseSealUrls, serializeSealUrls, upsertBean } from '../../lib/db';

function MissingAssetPanel({ bean, type, onClose, onSaved }) {
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState('');

  const handleFile = async (file) => {
    if (!file) return;
    setUploading(true);
    setError('');
    try {
      let updated = { ...bean };
      if (type === 'card') {
        const url = await uploadCardImage(bean.id, file);
        updated.card_image_url = url;
      } else {
        const sealUrls = parseSealUrls(bean.seal_url);
        const url = await uploadSeal(bean.id, file, 0);
        sealUrls[0] = url;
        updated.seal_url = serializeSealUrls(sealUrls[0], sealUrls[1]);
      }
      await upsertBean(updated);
      onSaved(updated);
      onClose();
    } catch (err) {
      setError(err.message);
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="mt-2 p-3" style={{ background: '#F4F0EB', border: '0.5px solid #D0C8BE' }}>
      <div className="flex items-center justify-between mb-2">
        <span className="text-[10px] tracking-widest" style={{ color: '#7a6a5a' }}>
          {type === 'card' ? 'カード写真をアップロード' : 'シールファイルをアップロード'}
        </span>
        <button type="button" onClick={onClose} className="text-[10px] cursor-pointer" style={{ color: '#9a9080' }}>閉じる</button>
      </div>
      <label className="cursor-pointer inline-block">
        <span className="text-[11px] px-4 py-1.5" style={{ border: '0.5px solid #A0978E', color: '#5a5248', display: 'inline-block' }}>
          {uploading ? 'アップロード中...' : 'ファイルを選択'}
        </span>
        <input
          type="file"
          accept={type === 'card' ? '.jpg,.jpeg,.png,.webp' : '.pdf,.png,.jpg,.jpeg,.ai'}
          onChange={(e) => handleFile(e.target.files?.[0])}
          disabled={uploading}
          className="hidden"
        />
      </label>
      {error && <p className="text-[10px] mt-1" style={{ color: '#c05a5a' }}>{error}</p>}
    </div>
  );
}

function MissingAssetRow({ bean, onSaved }) {
  const [openPanel, setOpenPanel] = useState(null);
  const missingCard = !bean.card_image_url;
  const missingSeal = !bean.seal_url;

  const toggle = (type) => setOpenPanel((p) => p === type ? null : type);

  return (
    <div className="py-3" style={{ borderBottom: '0.5px solid #E8E4DF' }}>
      <div className="flex items-center gap-3 flex-wrap">
        <span className="text-sm flex-1 truncate" style={{ color: '#443A35' }}>{bean.name}</span>
        {missingCard && (
          <button
            type="button"
            onClick={() => toggle('card')}
            className="text-[10px] px-2 py-0.5 cursor-pointer tracking-widest"
            style={{
              border: '0.5px solid #d49060',
              color: openPanel === 'card' ? '#fff' : '#d49060',
              background: openPanel === 'card' ? '#d49060' : 'transparent',
            }}
          >
            写真未
          </button>
        )}
        {missingSeal && (
          <button
            type="button"
            onClick={() => toggle('seal')}
            className="text-[10px] px-2 py-0.5 cursor-pointer tracking-widest"
            style={{
              border: '0.5px solid #c05a5a',
              color: openPanel === 'seal' ? '#fff' : '#c05a5a',
              background: openPanel === 'seal' ? '#c05a5a' : 'transparent',
            }}
          >
            シール未
          </button>
        )}
      </div>
      {openPanel && (
        <MissingAssetPanel
          bean={bean}
          type={openPanel}
          onClose={() => setOpenPanel(null)}
          onSaved={onSaved}
        />
      )}
    </div>
  );
}

export default function AdminDashboard({ data, onSelectStatus, onUpdateBeans }) {
  const [localBeans, setLocalBeans] = useState(data.beans);

  const byStatus = Object.keys(STATUS_ORDER).map((s) => ({
    status: s,
    count: localBeans.filter((b) => b.status === s).length,
  }));

  const missingAssets = localBeans.filter((b) => b.status !== '終売' && (!b.card_image_url || !b.seal_url));

  const handleBeanSaved = (updated) => {
    const next = localBeans.map((b) => String(b.id) === String(updated.id) ? updated : b);
    setLocalBeans(next);
    onUpdateBeans?.(next);
  };

  const [pushStatus, setPushStatus] = useState('');
  const [pushError, setPushError] = useState('');
  const [manualMsg, setManualMsg] = useState('');
  const [sending, setSending] = useState(false);

  async function handleSubscribe() {
    setPushError('');
    setPushStatus('登録中…');
    try {
      await subscribeToPush();
      setPushStatus('通知を有効化しました');
    } catch (e) {
      setPushStatus('');
      setPushError(e.message);
    }
  }

  async function handleManualSend() {
    if (!manualMsg.trim()) return;
    setSending(true);
    setPushError('');
    setPushStatus('');
    try {
      const result = await sendPushNotification('Bean Profile', manualMsg.trim());
      setPushStatus(`送信しました（${result?.sent ?? 0}件）`);
      setManualMsg('');
    } catch (e) {
      setPushError(e.message);
    } finally {
      setSending(false);
    }
  }

  return (
    <div>
      <h2 className="font-serif-jp text-xl mb-6">ダッシュボード</h2>
      <div className="grid grid-cols-2 gap-3 mb-8 sm:grid-cols-4">
        {[
          ['豆', localBeans.length],
          ['農園', data.farms.length],
          ['産地', data.countries.length],
          ['用語', data.terms.length + data.processes.length],
        ].map(([label, count]) => (
          <div key={label} className="border border-stone-200 p-4 text-center">
            <div className="font-serif-jp text-2xl font-light">{count}</div>
            <div className="text-[11px] tracking-widest text-stone-400 mt-1">{label}</div>
          </div>
        ))}
      </div>
      <h3 className="text-[11px] tracking-widest text-stone-400 mb-3">ステータス別</h3>
      <div className="space-y-2">
        {byStatus.map(({ status, count }) => (
          <button
            key={status}
            type="button"
            onClick={() => onSelectStatus(status)}
            className={`w-full flex items-center gap-3 border-l-2 ${STATUS_COLORS[status]} pl-4 py-2 text-left hover:bg-stone-200/50 transition-colors cursor-pointer`}
          >
            <span className="text-sm flex-1">{status}</span>
            <span className="text-sm text-stone-500">{count}件</span>
            <span className="text-stone-300 text-xs">›</span>
          </button>
        ))}
      </div>
      {/* 未アップロード一覧 */}
      {missingAssets.length > 0 && (
        <div className="mt-8 border-t border-stone-200 pt-6">
          <h3 className="text-[11px] tracking-widest text-stone-400 mb-4">
            未アップロード
            <span className="ml-2 text-stone-300">{missingAssets.length}件</span>
          </h3>
          <div>
            {missingAssets.map((bean) => (
              <MissingAssetRow key={bean.id} bean={bean} onSaved={handleBeanSaved} />
            ))}
          </div>
        </div>
      )}

      <div className="mt-10 border-t border-stone-200 pt-6 space-y-4">
        <h3 className="text-[11px] tracking-widest text-stone-400">通知</h3>
        <div>
          <p className="text-[11px] text-stone-400 mb-2">このデバイスで通知を受け取る</p>
          <button
            onClick={handleSubscribe}
            className="border border-stone-300 px-4 py-2 text-xs tracking-widest hover:bg-stone-50 cursor-pointer"
          >
            通知を有効化
          </button>
          {pushStatus && <p className="text-xs mt-2 text-stone-500">{pushStatus}</p>}
          {pushError && <p className="text-xs mt-2 text-red-500">{pushError}</p>}
        </div>
        <div className="border-t border-stone-100 pt-4">
          <p className="text-[11px] text-stone-400 mb-2">手動送信</p>
          <div className="flex gap-2">
            <input
              value={manualMsg}
              onChange={(e) => setManualMsg(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleManualSend()}
              placeholder="通知内容を入力"
              className="flex-1 border-b border-stone-300 focus:border-stone-600 outline-none py-1.5 text-sm bg-transparent"
            />
            <button
              onClick={handleManualSend}
              disabled={!manualMsg.trim() || sending}
              className="border border-stone-300 px-4 py-1.5 text-xs tracking-widest hover:bg-stone-50 cursor-pointer disabled:opacity-30 disabled:cursor-not-allowed"
            >
              {sending ? '送信中…' : '送信'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
