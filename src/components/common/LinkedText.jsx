export default function LinkedText({ text }) {
  if (!text) return null;
  const regex = /(https?:\/\/[^\s]+)/g;
  const parts = text.split(regex);
  return (
    <>
      {parts.map((p, i) =>
        regex.test(p) ? (
          <a key={i} href={p} target="_blank" rel="noopener noreferrer" className="underline decoration-dotted text-stone-600 hover:text-stone-900 break-all">
            {p}
          </a>
        ) : (
          <span key={i}>{p}</span>
        )
      )}
    </>
  );
}
