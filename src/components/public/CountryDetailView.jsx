import SectionBlock from '../common/SectionBlock';

function parseChips(raw) {
  if (!raw) return [];
  try { return JSON.parse(raw); } catch { return []; }
}

function FlavorChips({ chips }) {
  if (!chips?.length) return null;
  return (
    <div className="flex flex-wrap gap-1.5 mb-5">
      {chips.map((chip) => (
        <span
          key={chip}
          style={{
            fontSize: '10px',
            letterSpacing: '0.04em',
            color: '#5a4838',
            background: 'rgba(90,72,56,0.07)',
            border: '0.5px solid rgba(90,72,56,0.18)',
            borderRadius: '20px',
            padding: '3px 10px',
          }}
        >
          {chip}
        </span>
      ))}
    </div>
  );
}

function InfoSection({ label, children }) {
  return (
    <div className="mb-5">
      <div
        style={{
          fontSize: '8px',
          letterSpacing: '0.18em',
          color: 'rgba(67,58,53,0.4)',
          textTransform: 'uppercase',
          marginBottom: '6px',
        }}
      >
        {label}
      </div>
      <div style={{ fontSize: '12px', lineHeight: 1.8, color: '#5a5248' }}>
        {children}
      </div>
    </div>
  );
}

export default function CountryDetailView({ country, beans, onBack, onSelectBean, backLabel }) {
  const related = beans.filter((b) => b.origin && b.origin.includes(`country:${country.slug}`));
  const chips = parseChips(country.flavor_chips);

  return (
    <div>
      <div onClick={onBack} className="cursor-pointer text-xs text-stone-400 hover:text-stone-600 mb-6 tracking-wide">
        ← {backLabel ?? '産地一覧へ戻る'}
      </div>
      <div className="border-l-2 border-l-stone-300 pl-6 mb-6">
        <h2 className="font-serif-jp text-2xl mb-1">{country.flag} {country.name}</h2>
        {country.altitude && (
          <p style={{ fontSize: '10px', letterSpacing: '0.08em', color: 'rgba(67,58,53,0.5)' }}>
            ↑ {country.altitude}
          </p>
        )}
      </div>

      {country.overview && (
        <p className="text-sm mb-5 leading-relaxed pl-4" style={{ color: '#5a5248', borderLeft: '1.5px solid #D0C8BE' }}>
          {country.overview}
        </p>
      )}

      <FlavorChips chips={chips} />

      {country.terroir && (
        <InfoSection label="Terroir — テロワール">
          {country.terroir}
        </InfoSection>
      )}

      {country.production_system && (
        <InfoSection label="Production System — 生産システム">
          {country.production_system}
        </InfoSection>
      )}

      {related.length > 0 && (
        <SectionBlock title="関連する豆">
          <ul className="space-y-1">
            {related.map((b) => (
              <li key={b.id}>
                <span onClick={() => onSelectBean(b.id)} className="underline decoration-dotted cursor-pointer">{b.name}</span>
              </li>
            ))}
          </ul>
        </SectionBlock>
      )}
    </div>
  );
}
