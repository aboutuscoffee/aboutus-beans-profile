export default function EsmeraldaMap() {
  return (
    <div className="border border-stone-200 p-4" style={{ backgroundColor: '#f7f3ed' }}>
      <p className="text-[11px] tracking-widest text-stone-500 mb-3">Esmeraldaの3つの主要エリア</p>
      <svg viewBox="0 0 420 320" className="w-full h-auto" xmlns="http://www.w3.org/2000/svg">
        <path d="M 230 10 C 215 60, 240 100, 225 150 C 210 200, 235 230, 220 280 C 212 300, 215 312, 213 318" fill="none" stroke="#b8a98f" strokeWidth="2" strokeDasharray="1 4" />
        <path d="M 60 150 C 100 160, 160 165, 220 165" fill="none" stroke="#b8a98f" strokeWidth="1.5" strokeDasharray="1 4" />
        <path d="M 30 40 C 60 25, 110 20, 150 35 C 165 55, 160 85, 140 105 C 110 120, 70 115, 45 95 C 25 75, 20 55, 30 40 Z" fill="#f5d9a8" fillOpacity="0.65" stroke="#d4a85c" strokeWidth="1.5" />
        <text x="92" y="72" textAnchor="middle" fill="#92702f" fontSize="14" fontFamily="serif" fontWeight="500">El Velo</text>
        <path d="M 250 55 C 290 40, 340 50, 365 80 C 380 110, 375 145, 350 170 C 320 190, 280 185, 255 165 C 235 140, 235 90, 250 55 Z" fill="#cfe3c8" fillOpacity="0.7" stroke="#7da876" strokeWidth="1.5" />
        <text x="308" y="118" textAnchor="middle" fill="#3f6b3a" fontSize="14" fontFamily="serif" fontWeight="500">Jaramillo</text>
        <path d="M 55 175 C 95 160, 150 165, 180 195 C 200 225, 195 260, 165 285 C 130 305, 80 300, 50 275 C 25 250, 25 200, 55 175 Z" fill="#cfe0ec" fillOpacity="0.7" stroke="#7ba3c4" strokeWidth="1.5" />
        <text x="115" y="235" textAnchor="middle" fill="#39577a" fontSize="13" fontFamily="serif" fontWeight="500">Cañas Verdes</text>
        <text x="92" y="14" textAnchor="middle" fontSize="9" fill="#a8a29e" letterSpacing="1">Los Naranjos</text>
        <text x="362" y="22" textAnchor="middle" fontSize="9" fill="#a8a29e" letterSpacing="1">Palo Alto</text>
        <text x="378" y="195" textAnchor="start" fontSize="9" fill="#a8a29e" letterSpacing="1">Jaramillo Abajo</text>
        <text x="95" y="310" textAnchor="middle" fontSize="9" fill="#a8a29e" letterSpacing="1">Boquete</text>
        <g transform="translate(395, 290)">
          <line x1="0" y1="15" x2="0" y2="-10" stroke="#78716c" strokeWidth="1.2" />
          <polygon points="0,-14 -4,-6 4,-6" fill="#78716c" />
          <text x="0" y="29" textAnchor="middle" fontSize="10" fill="#78716c">N</text>
        </g>
      </svg>
      <p className="text-[10px] text-stone-400 mt-3 leading-relaxed">※自作の簡易図です。詳細な実地図は各エリアの公式ページをご参照ください。</p>
    </div>
  );
}
