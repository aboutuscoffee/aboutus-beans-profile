export default function TextArea({ label, value, onChange, rows = 3 }) {
  return (
    <div>
      <span className="block text-[11px] tracking-widest text-stone-500 mb-1">{label}</span>
      <textarea
        value={value ?? ''}
        onChange={(e) => onChange(e.target.value)}
        rows={rows}
        className="w-full bg-transparent border border-stone-300 focus:border-stone-600 outline-none p-2 text-sm resize-none"
      />
    </div>
  );
}
