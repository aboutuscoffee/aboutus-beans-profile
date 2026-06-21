import { TYPE_PATH } from '../../constants';

export default function WikiText({ text, onNavigate }) {
  if (!text) return null;
  const regex = /\[\[([^\|\]]+)\|(\w+):([\w-]+)\]\]/g;
  const parts = [];
  let lastIndex = 0;
  let match;
  let key = 0;

  while ((match = regex.exec(text)) !== null) {
    if (match.index > lastIndex) {
      parts.push(<span key={key++}>{text.slice(lastIndex, match.index)}</span>);
    }
    const [, label, type, slug] = match;
    parts.push(
      <span
        key={key++}
        onClick={() => onNavigate(TYPE_PATH[type], slug)}
        className="underline decoration-dotted underline-offset-2 cursor-pointer"
      >
        {label}
      </span>
    );
    lastIndex = match.index + match[0].length;
  }

  if (lastIndex < text.length) {
    parts.push(<span key={key++}>{text.slice(lastIndex)}</span>);
  }

  return <span>{parts}</span>;
}
