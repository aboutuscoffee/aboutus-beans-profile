import { useState } from 'react';
import BeanListView from '../public/BeanListView';
import BeanDetailView from '../public/BeanDetailView';
import FarmDetailView from '../public/FarmDetailView';
import ProcessDetailView from '../public/ProcessDetailView';
import TermDetailView from '../public/TermDetailView';
import CountryDetailView from '../public/CountryDetailView';
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
  const [navStack, setNavStack] = useState([]); // [{type, id}]
  const [editTab, setEditTab] = useState('preview');
  const [localBeans, setLocalBeans] = useState(data.beans);

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
        <div className="max-w-2xl mx-auto px-6 py-5 flex items-center justify-between">
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
          <div className="max-w-2xl mx-auto px-6 flex gap-6" style={{ borderTop: '0.5px solid #2a2828' }}>
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
        style={{ paddingBottom: isBean ? '64px' : '96px' }}
      >
        {/* 豆一覧 */}
        {!current && (
          <BeanListView beans={filtered} onSelectBean={(id) => navigateTo('beans', id)} />
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

      {/* ステータスバー（豆詳細のみ） */}
      {isBean && currentBean && (
        <StatusBar
          key={currentBean.id}
          bean={currentBean}
          onSave={handleSave}
        />
      )}
    </div>
  );
}
