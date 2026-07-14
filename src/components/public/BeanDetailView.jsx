import { useState } from 'react';
import { STATUS_COLORS } from '../../constants';

function CollapsibleText({ children }) {
  const [expanded, setExpanded] = useState(false);
  return (
    <div>
      <div
        style={expanded ? {} : {
          display: '-webkit-box',
          WebkitLineClamp: 3,
          WebkitBoxOrient: 'vertical',
          overflow: 'hidden',
        }}
      >
        {children}
      </div>
      <button
        type="button"
        onClick={() => setExpanded(e => !e)}
        className="mt-2 text-[11px] text-stone-400 hover:text-stone-600 cursor-pointer tracking-wide"
      >
        {expanded ? '▲ 閉じる' : '▼ 続きを読む'}
      </button>
    </div>
  );
}
import NewBadge from '../common/NewBadge';
import Field from '../common/Field';
import SectionBlock from '../common/SectionBlock';
import WikiText from '../common/WikiText';

export default function BeanDetailView({ bean, onBack, onNavigate, backLabel }) {
  return (
    <div>
      <div onClick={onBack} className="cursor-pointer text-xs text-stone-400 hover:text-stone-600 mb-6 tracking-wide">
        ← {backLabel ?? '一覧へ戻る'}
      </div>
      <div className={`border-l-2 ${STATUS_COLORS[bean.status] || 'border-l-stone-300'} pl-6`}>
        <div className="flex items-center gap-2 mb-2 flex-wrap">
          {bean.is_new && <NewBadge />}
          <span className="text-[10px] tracking-widest text-stone-400">{bean.status}</span>
        </div>
        <h2 className="font-serif-jp text-2xl mb-5">{bean.name}</h2>
        <dl className="space-y-2 mb-6">
          <Field label="産地" value={<WikiText text={bean.origin} onNavigate={onNavigate} />} />
          <Field label="地域・農園" value={<WikiText text={bean.region} onNavigate={onNavigate} />} />
          <Field label="生産者" value={bean.producer ? <WikiText text={bean.producer} onNavigate={onNavigate} /> : null} />
          <Field label="品種" value={<WikiText text={bean.variety} onNavigate={onNavigate} />} />
          <Field label="標高" value={bean.altitude} />
          <Field label="精製方法" value={<WikiText text={bean.process} onNavigate={onNavigate} />} />
          <Field label="テロワール" value={bean.terroir ? <WikiText text={bean.terroir} onNavigate={onNavigate} /> : null} />
        </dl>
        {bean.seal_url && (
          <a
            href={bean.seal_url}
            target="_blank"
            rel="noreferrer"
            className="inline-flex items-center gap-2 text-xs border border-stone-400 px-4 py-2 mb-6 hover:border-stone-700 transition-colors"
          >
            🏷 シールデータをダウンロード
          </a>
        )}
        <SectionBlock title="概要">
          <CollapsibleText>
            <WikiText text={bean.description_ja} onNavigate={onNavigate} />
          </CollapsibleText>
          {bean.description_en && (
            <CollapsibleText>
              <div className="text-stone-500 italic">
                {bean.description_en.split(/\n+/).map((p, i) => (
                  <p key={i} className={i > 0 ? 'mt-3' : ''}>{p}</p>
                ))}
              </div>
            </CollapsibleText>
          )}
        </SectionBlock>
        <SectionBlock title="テイスト">
          {bean.taste_ja && (
            <CollapsibleText>
              <div>
                {bean.taste_ja.split(/\n+/).map((p, i) => (
                  <p key={i} className={i > 0 ? 'mt-3' : ''}>{p}</p>
                ))}
              </div>
            </CollapsibleText>
          )}
          {bean.taste_en && (
            <CollapsibleText>
              <div className="text-stone-500 italic">
                {bean.taste_en.split(/\n+/).map((p, i) => (
                  <p key={i} className={i > 0 ? 'mt-3' : ''}>{p}</p>
                ))}
              </div>
            </CollapsibleText>
          )}
        </SectionBlock>
        <SectionBlock title="詳細">
          {bean.detail_ja && bean.detail_ja.split(/\n+/).map((p, i) => (
            <p key={i} className={i > 0 ? 'mt-3' : ''}>{p}</p>
          ))}
          {bean.detail_en && (
            <div className="text-stone-500 mt-3 italic">
              {bean.detail_en.split(/\n+/).map((p, i) => (
                <p key={i} className={i > 0 ? 'mt-3' : ''}>{p}</p>
              ))}
            </div>
          )}
        </SectionBlock>
        {bean.image_urls?.filter(Boolean).length > 0 && (
          <div className="flex gap-2 mt-6 flex-wrap">
            {bean.image_urls.filter(Boolean).map((url, i) => (
              <a key={i} href={url} target="_blank" rel="noreferrer">
                <img src={url} alt="" className="h-28 w-28 object-cover border border-stone-200 hover:opacity-80 transition-opacity" />
              </a>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
