export default function Field({ label, value }) {
  if (!value) return null;
  return (
    <div className="flex gap-4">
      <dt className="text-stone-400 text-[11px] tracking-widest w-20 flex-shrink-0 pt-0.5">{label}</dt>
      <dd className="flex-1 text-sm">{value}</dd>
    </div>
  );
}
