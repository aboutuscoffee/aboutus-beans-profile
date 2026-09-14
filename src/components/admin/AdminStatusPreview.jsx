import { useState } from 'react';
import BeanListView from '../public/BeanListView';
import BeanDetailView from '../public/BeanDetailView';
import AdminBeanForm from './AdminBeanForm';
import { STATUS_ORDER } from '../../constants';

const STATUSES = Object.keys(STATUS_ORDER);

function StatusBar({ bean, onSave }) {
  const [status, setStatus] = useState(bean.status);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const dirty = status !== bean.status;

  const handleSave = async () => {
    setSaving(true);
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
      <div className="max-w-2xl mx-auto px-6 py-3 flex items-center gap-4">
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
      </div>
    </div>
  );
}

export default function AdminStatusPreview({ status, data, updateBeans, onClose }) {
  const [detail, setDetail] = useState(null);
  const [editTab, setEditTab] = useState('preview'); // 'preview' | 'edit'
  const [localBeans, setLocalBeans] = useState(data.beans);
  const filtered = localBeans.filter((b) => b.status === status);

  const openBean = (id) => {
    const bean = localBeans.find((b) => String(b.id) === String(id));
    if (bean) { setDetail(bean); setEditTab('preview'); }
  };

  const navigateTo = (type, id) => {
    if (type === 'beans') openBean(id);
  };

  const handleSave = async (updated) => {
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
            {detail ? detail.name : status}
            {!detail && (
              <span className="ml-2 text-[11px]" style={{ color: '#5a5248' }}>
                {filtered.length}件
              </span>
            )}
          </span>
          <div style={{ width: '80px' }} />
        </div>

        {/* プレビュー / 編集 タブ（詳細表示時のみ） */}
        {detail && (
          <div className="max-w-2xl mx-auto px-6 flex gap-6 pb-0" style={{ borderTop: '0.5px solid #2a2828' }}>
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
        className="max-w-2xl mx-auto px-6 pt-8 font-sans-jp"
        style={{ paddingBottom: detail ? '64px' : '96px' }}
      >
        {!detail ? (
          <BeanListView beans={filtered} onSelectBean={openBean} />
        ) : editTab === 'preview' ? (
          <BeanDetailView
            bean={detail}
            onBack={() => setDetail(null)}
            onNavigate={navigateTo}
            backLabel={status}
          />
        ) : (
          <AdminBeanForm
            bean={detail}
            onSave={(form) => handleSave(form)}
            onCancel={() => setEditTab('preview')}
            onDelete={() => {}}
          />
        )}
      </div>

      {/* ステータスバー（詳細表示時のみ） */}
      {detail && (
        <StatusBar
          key={detail.id}
          bean={detail}
          onSave={handleSave}
        />
      )}
    </div>
  );
}
