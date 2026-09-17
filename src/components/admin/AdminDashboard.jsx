import { useState } from 'react';
import { STATUS_ORDER, STATUS_COLORS } from '../../constants';
import { subscribeToPush, sendPushNotification } from '../../lib/push';

export default function AdminDashboard({ data, onSelectStatus }) {
  const byStatus = Object.keys(STATUS_ORDER).map((s) => ({
    status: s,
    count: data.beans.filter((b) => b.status === s).length,
  }));

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
          ['豆', data.beans.length],
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
