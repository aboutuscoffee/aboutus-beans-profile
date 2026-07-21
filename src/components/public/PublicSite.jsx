import { useState } from 'react';
import BeanListView from './BeanListView';
import BeanDetailView from './BeanDetailView';
import ListSimpleView from './ListSimpleView';
import CountriesTabView from './CountriesTabView';
import CountryDetailView from './CountryDetailView';
import FarmDetailView from './FarmDetailView';
import ProcessDetailView from './ProcessDetailView';
import TermDetailView from './TermDetailView';
import ProjectDetailView from './ProjectDetailView';
import MapView from './MapView';
import SealListView from './SealListView';

const TABS = [
  { key: 'beans', label: '豆一覧' },
  { key: 'map', label: '地図' },
  { key: 'countries', label: '産地' },
  { key: 'farms', label: '農園' },
  { key: 'processes', label: '精製方法' },
  { key: 'terms', label: '用語集' },
  { key: 'seals', label: 'シール' },
];

export default function PublicSite({ data, onOpenAdmin }) {
  const [tab, setTab] = useState('beans');
  const [detail, setDetail] = useState(null);
  // 履歴スタック: [{tab, detail}] — 遷移前の状態を積む
  const [navHistory, setNavHistory] = useState([]);

  const navigateToDetail = (type, id) => {
    setNavHistory((prev) => [...prev, { tab, detail }]);
    setTab(type);
    setDetail({ type, id });
  };

  const goBack = () => {
    setNavHistory((prev) => {
      const previous = prev[prev.length - 1];
      if (previous) {
        setTab(previous.tab);
        setDetail(previous.detail);
      }
      return prev.slice(0, -1);
    });
  };

  const goTab = (t) => {
    setNavHistory([]);
    setTab(t);
    setDetail(null);
  };

  // 戻るラベル: 履歴があれば直前のページ種別を表示
  const backLabel = (() => {
    if (!navHistory.length) return null;
    const prev = navHistory[navHistory.length - 1];
    if (prev.detail) {
      const labels = { beans: '豆', countries: '産地', farms: '農園', processes: '精製方法', terms: '用語集', projects: 'プロジェクト' };
      return labels[prev.detail.type] ?? '前のページ';
    }
    const tabLabels = { beans: '豆一覧', countries: '産地一覧', farms: '農園一覧', processes: '精製方法一覧', terms: '用語集' };
    return tabLabels[prev.tab] ?? '前のページ';
  })();

  let content;
  if (detail) {
    if (detail.type === 'beans') {
      const bean = data.beans.find((b) => String(b.id) === String(detail.id));
      content = bean
        ? <BeanDetailView bean={bean} onBack={goBack} onNavigate={navigateToDetail} backLabel={backLabel} />
        : <p>見つかりません</p>;
    } else if (detail.type === 'countries') {
      const c = data.countries.find((c) => c.slug === detail.id);
      content = c
        ? <CountryDetailView country={c} beans={data.beans} onBack={goBack} onSelectBean={(id) => navigateToDetail('beans', id)} backLabel={backLabel} />
        : <p>見つかりません</p>;
    } else if (detail.type === 'farms') {
      const f = data.farms.find((f) => f.slug === detail.id);
      content = f
        ? <FarmDetailView farm={f} beans={data.beans} onBack={goBack} onSelectBean={(id) => navigateToDetail('beans', id)} onNavigate={navigateToDetail} backLabel={backLabel} />
        : <p>見つかりません</p>;
    } else if (detail.type === 'processes') {
      const p = data.processes.find((p) => p.slug === detail.id);
      content = p
        ? <ProcessDetailView process={p} beans={data.beans} onBack={goBack} onSelectBean={(id) => navigateToDetail('beans', id)} onNavigate={navigateToDetail} backLabel={backLabel} />
        : <p>見つかりません</p>;
    } else if (detail.type === 'terms') {
      const t = data.terms.find((t) => t.slug === detail.id);
      content = t
        ? <TermDetailView term={t} beans={data.beans} onBack={goBack} onSelectBean={(id) => navigateToDetail('beans', id)} onNavigate={navigateToDetail} backLabel={backLabel} />
        : <p>見つかりません</p>;
    } else if (detail.type === 'projects') {
      const proj = (data.projects ?? []).find((p) => p.slug === detail.id);
      content = proj
        ? <ProjectDetailView project={proj} beans={data.beans} farms={data.farms} onBack={goBack} onSelectBean={(id) => navigateToDetail('beans', id)} onNavigate={navigateToDetail} backLabel={backLabel} />
        : <p>見つかりません</p>;
    }
  } else if (tab === 'map') {
    content = (
      <MapView
        countries={data.countries}
        farms={data.farms}
        beans={data.beans}
        onNavigate={navigateToDetail}
      />
    );
  } else if (tab === 'beans') {
    content = <BeanListView beans={data.beans} onSelectBean={(id) => navigateToDetail('beans', id)} />;
  } else if (tab === 'countries') {
    content = (
      <CountriesTabView
        countries={data.countries}
        farms={data.farms}
        beans={data.beans}
        onNavigate={navigateToDetail}
      />
    );
  } else if (tab === 'farms') {
    content = (
      <ListSimpleView
        items={data.farms}
        onSelect={(slug) => navigateToDetail('farms', slug)}
        renderItem={(f) => (
          <>
            <div className="font-serif-jp text-base">{f.name}</div>
            <div className="text-xs text-stone-500 mt-1">{f.country_name} / {f.location}</div>
          </>
        )}
      />
    );
  } else if (tab === 'processes') {
    content = (
      <ListSimpleView
        items={data.processes}
        onSelect={(slug) => navigateToDetail('processes', slug)}
        renderItem={(p) => (
          <>
            <div className="font-serif-jp text-base">{p.name}</div>
            <div className="text-xs text-stone-500 mt-1">{p.category}</div>
          </>
        )}
      />
    );
  } else if (tab === 'terms') {
    content = (
      <ListSimpleView
        items={data.terms}
        onSelect={(slug) => navigateToDetail('terms', slug)}
        renderItem={(t) => (
          <>
            <div className="font-serif-jp text-base">{t.name}</div>
            <div className="text-xs text-stone-500 mt-1">{t.category}</div>
          </>
        )}
      />
    );
  } else if (tab === 'seals') {
    content = <SealListView beans={data.beans} seals={data.seals} />;
  }

  return (
    <div style={{ backgroundColor: '#FAFAF8', color: '#1A181A', minHeight: '100vh' }} className="font-sans-jp">
      {/* フルワイドダークヘッダー */}
      <header style={{ backgroundColor: '#1A181A' }}>
        <div className="max-w-2xl mx-auto px-6 py-7 relative">
          <div className="flex justify-end mb-5">
            <button
              onClick={onOpenAdmin}
              type="button"
              className="text-[9px] tracking-widest cursor-pointer transition-colors"
              style={{ color: '#4a4238', border: '0.5px solid #3a3228', padding: '4px 12px' }}
            >
              管理画面
            </button>
          </div>
          <div className="text-center">
            <h1 className="font-display font-light tracking-[0.12em]" style={{ fontSize: '28px', color: '#F8F6F2' }}>
              Bean Profile
            </h1>
            <div style={{ width: '24px', height: '0.5px', background: '#2C1917', margin: '10px auto' }} />
            <p className="text-[9px] tracking-[0.26em]" style={{ color: '#5a5248' }}>
              ABOUT US COFFEE 内部豆プロファイル集
            </p>
          </div>
        </div>
      </header>

      <div className="max-w-2xl mx-auto px-6">
        <nav
          className="flex justify-center gap-6 pb-3 mb-10 text-[11px] tracking-[0.2em] overflow-x-auto mt-0"
          style={{ borderBottom: '0.5px solid #E0DCD6', paddingTop: '16px' }}
        >
          {TABS.map((t) => (
            <button
              key={t.key}
              onClick={() => goTab(t.key)}
              type="button"
              className="pb-2 -mb-px transition-colors whitespace-nowrap cursor-pointer"
              style={{
                color: tab === t.key ? '#2C1917' : '#8a8070',
                borderBottom: tab === t.key ? '0.5px solid #2C1917' : 'none',
              }}
            >
              {t.label}
            </button>
          ))}
        </nav>
        <main className="pb-24">{content}</main>
      </div>
    </div>
  );
}
