export default function TextInput({ label, value, onChange, type = 'text' }) {
  return (
    <div>
      <span className="block text-[11px] tracking-widest text-stone-500 mb-1">{label}</span>
      <input
        type={type}
        value={value ?? ''}
        onChange={(e) => onChange(type === 'number' ? Number(e.target.value) : e.target.value)}
        className="w-full bg-transparent border-b border-stone-300 focus:border-stone-600 outline-none py-1.5 text-sm"
      />
    </div>
  );
}
