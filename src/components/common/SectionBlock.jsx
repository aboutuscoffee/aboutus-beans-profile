export default function SectionBlock({ title, children }) {
  if (!children) return null;
  return (
    <section className="mb-6">
      <h3 className="text-[11px] tracking-widest text-stone-400 mb-2">{title}</h3>
      <div className="text-sm leading-relaxed">{children}</div>
    </section>
  );
}
