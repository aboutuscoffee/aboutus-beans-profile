import Field from '../common/Field';
import SectionBlock from '../common/SectionBlock';

export default function CountryDetailView({ country, beans, onBack, onSelectBean }) {
  const related = beans.filter((b) => b.origin && b.origin.includes(`country:${country.slug}`));
  return (
    <div>
      <div onClick={onBack} className="cursor-pointer text-xs text-stone-400 hover:text-stone-600 mb-6 tracking-wide">
        ← 産地一覧へ戻る
      </div>
      <div className="border-l-2 border-l-stone-300 pl-6">
        <h2 className="font-serif-jp text-2xl mb-5">{country.flag} {country.name}</h2>
        <dl className="space-y-2 mb-6">
          <Field label="地域" value={country.region} />
          <Field label="標高" value={country.altitude} />
          <Field label="気候" value={country.climate} />
        </dl>
        <SectionBlock title="概要"><p>{country.overview}</p></SectionBlock>
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
    </div>
  );
}
