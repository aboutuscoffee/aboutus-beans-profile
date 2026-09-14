import { useState } from 'react';
import BeanListView from '../public/BeanListView';
import BeanDetailView from '../public/BeanDetailView';

export default function AdminStatusPreview({ status, data, onClose }) {
  const [detail, setDetail] = useState(null);

  const filtered = data.beans.filter((b) => b.status === status);

  const openBean = (id) => {
    const bean = data.beans.find((b) => String(b.id) === String(id));
    if (bean) setDetail(bean);
  };

  const navigateTo = (type, id) => {
    if (type === 'beans') openBean(id);
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

      <div className="max-w-2xl mx-auto px-6 pt-8 pb-24 font-sans-jp">
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
    </div>
  );
}
