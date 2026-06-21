import Field from '../common/Field';
import SectionBlock from '../common/SectionBlock';

export default function ProcessDetailView({ process, beans, onBack, onSelectBean }) {
  const related = beans.filter((b) => b.process && b.process.includes(`process:${process.slug}`));
  return (
    <div>
      <div onClick={onBack} className="cursor-pointer text-xs text-stone-400 hover:text-stone-600 mb-6 tracking-wide">
        ← 精製方法一覧へ戻る
      </div>
      <div className="border-l-2 border-l-stone-300 pl-6">
        <h2 className="font-serif-jp text-2xl mb-5">{process.name}</h2>
        <dl className="space-y-2 mb-6"><Field label="カテゴリ" value={process.category} /></dl>
        <SectionBlock title="説明"><p>{process.body}</p></SectionBlock>
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
