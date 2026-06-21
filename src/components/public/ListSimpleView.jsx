export default function ListSimpleView({ items, onSelect, renderItem }) {
  return (
    <ul className="space-y-3">
      {items.map((item) => (
        <li key={item.slug}>
          <div
            onClick={() => onSelect(item.slug)}
            className="cursor-pointer border-l-2 border-l-stone-300 pl-4 py-3 hover:bg-stone-200/40 transition-colors"
          >
            {renderItem(item)}
          </div>
        </li>
      ))}
    </ul>
  );
}
