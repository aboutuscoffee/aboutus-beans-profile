const INITIAL_FARMS = [
  {
    slug: 'esmeralda', name: 'Hacienda La Esmeralda', country_slug: 'panama', country_name: 'パナマ',
    location: 'Boquete, Chiriqui', owner: 'Rachel Peterson', altitude: '1,600-2,200m',
    overview: 'Geisha種を世界に広めた農園として知られ、今もコーヒー界の最前線を走り続ける名門農園。2004年のBest of Panama（BOP）で初優勝し、当時は無名に近かったGeisha種が1ポンド21ドルの落札価格を記録（同区画Jaramillo Especial）。2007年には1ポンド130ドルまで価格が上昇した。2024年のオークションでは最高落札価格$10,013/kgを記録し、2025年のBOPでは史上初の3部門（Geisha Washed・Geisha Natural・Varietal）同時優勝を達成。Geisha Washed部門98.00点、Geisha Natural部門97.00点という最高得点を更新した。2025年のオークション結果はWashed $30,204/kg（前年比約3倍）、Natural $23,608/kg、Varietal $8,040/kgという驚異的な価格となった。Washed・NaturalはCañas Verdesの豆、VarietalはEl Veloの豆。生産者のRachel PetersonはForbes Centroaméricaで「中米に影響を与える女性リーダー」として紹介されるなど、コーヒー業界を超えた評価を受けている。',
    areas: [
      { name: 'Jaramillo', description: '2004年のオークションで高評価を受けたエリアで、パナマGeishaはじまりの地。フローラルが特徴で、ジャスミン・ベルガモット・白桃のような透明感のあるカップ。MarioやReinaなどの区画がこのエリアに属する。公式: https://haciendaesmeralda.com/jaramillo-farm/' },
      { name: 'Cañas Verdes', description: 'Jaramilloに比べ柔らかさのあるカップで、甘みや丸みのある質感、シトラスやはちみつ、黄桃のような傾向。Nido区画は最高標高で、2025年三冠達成ロット（Washed/Natural）もここから生まれた。公式: https://haciendaesmeralda.com/canas-verdes-farm/' },
      { name: 'El Velo', description: 'Esmeralda内で最も高標高のエリア。強さのある伸びやかな酸と華やかさ、白い花・白葡萄・ライムのような透明感の強いカップ。実験的エリアでGeishaに加えVarietal系のCatuaiなども栽培。公式: https://haciendaesmeralda.com/el-velo-farm/' },
    ],
    ranks: [
      { name: 'プライベートオークションロット（Black Box）', description: '最高峰のオークションロット。年1回のオンラインオークション「エスメラルダ・スペシャル・オークション」でのみ購入可能な、数量限定の超希少マイクロロット。Best of Panamaへの出品候補レベル。' },
      { name: 'エスメラルダスペシャル（Red Box）', description: '標高1950m以上、カッピングスコア91点以上のGeisha種。栽培エリアが明記され、オークション以外で購入できる中では最高クラス。' },
      { name: 'プライベートコレクション（Green Box）', description: '標高1600〜1800mの高地エリアで栽培され、カッピングスコア87〜90点を保証。区画までは明記されない。' },
      { name: 'ロット表記について', description: 'ロット名は「数字＋アルファベット」で構成される。数字は同区画内での収穫順（大きいほど収穫が遅く、標高が高い傾向）。アルファベットは精製方法を表す：N=Natural／W=Washed（屋外タンクで常温発酵）／A=Anaerobic／F=低温室で発酵／C=クライメートコントロール（温湿度管理された部屋での乾燥、高品質・高価格）／P=パティオ乾燥／B=アフリカンベッド乾燥。例：「Mario 4GW」「Reina 3NB」（Gはゲイシャを示す）。9番以降は均一性を保てないためブレンドされプライベートロットとして扱われる。' },
    ],
    awards: '2004年　Best of Panama 初優勝（Jaramillo Especial、1ポンド21ドルで当時最高落札価格）\n2007年　1ポンド130ドルまで価格上昇\n2024年　オークション最高落札価格 $10,013/kg\n2025年　Best of Panama 史上初の3部門同時優勝（Geisha Washed 98.00点・Geisha Natural 97.00点で最高得点更新）\n2025年　オークション：Washed $30,204/kg・Natural $23,608/kg・Varietal $8,040/kg',
  },
  { slug: 'alo-coffee', name: 'ALO Coffee', country_slug: 'ethiopia', country_name: 'エチオピア', location: 'Sidama, Bensa, Alo', owner: 'Tamiru Tadesse', altitude: '2,360-2,460m', overview: '低温発酵によるクリーンなフローラルが特徴。2021年のCOEでは1位と5位を同時入賞。', areas: [], ranks: [], awards: '2021年　COE 1位・5位同時入賞' },
  { slug: 'flying-pumas', name: 'Flying Pumas', country_slug: 'panama', country_name: 'パナマ', location: 'Volcán, Chiriqui', owner: '—', altitude: '1,650-2,200m', overview: '2019年設立。総面積178haのうち約60haのみをコーヒー栽培に使用。', areas: [{ name: 'Iconic Series', description: '農園を象徴するロット群。' }, { name: 'Summit', description: 'さらに上位のクオリティ。' }], ranks: [], awards: '2025年　WBC 2位' },
  { slug: 'san-isidro-labrador', name: 'San Isidro Labrador', country_slug: 'costa-rica', country_name: 'コスタリカ', location: 'Tarrazu', owner: 'Joel & Matias', altitude: '1,900-1,950m', overview: 'コスタリカ・タラスの高地にある家族経営農園。', areas: [], ranks: [], awards: '2023年　COE 優勝' },
  { slug: 'gesha-village', name: 'Gesha Village', country_slug: 'ethiopia', country_name: 'エチオピア', location: 'Bench Maji, Gesha Village', owner: 'Rachel Samuel', altitude: '1,900-2,063m', overview: 'エチオピア内でも最高品質のゲイシャ種を栽培している農園。8つの区画に分かれている。', areas: [{ name: 'SURMA', description: 'よりフローラルが際立つ区画。' }, { name: 'OMA', description: '甘味や丸みのあるカップ。' }], ranks: [], awards: '' },
  { slug: 'don-eduardo', name: 'Don Eduardo Estate', country_slug: 'panama', country_name: 'パナマ', location: 'Boquete, Chiriqui', owner: 'Harold Sabin', altitude: '1,850m', overview: 'ボケテのサルト地区に位置するシングルエステート。Savage Coffeeの重要パートナー農園。', areas: [], ranks: [], awards: '' },
  { slug: 'los-nogales', name: 'Los Nogales', country_slug: 'colombia', country_name: 'コロンビア', location: 'Bruselas, Huila', owner: 'Oscar Hernández', altitude: '1,800m', overview: 'COEで2005年に初代優勝をした名門農園。「テロワール」「ジェネティック」「サイエンス」がコンセプト。', areas: [], ranks: [], awards: '2005年　COE 初代優勝' },
  { slug: 'el-pinal', name: 'El Pinal', country_slug: 'guatemala', country_name: 'グアテマラ', location: 'Jalapa', owner: 'Abel', altitude: '1,450-1,550m', overview: 'グアテマラのハラパ県にある20年以上の歴史を持つ農園。', areas: [], ranks: [], awards: '' },
  { slug: 'simbi-cws', name: 'Simbi CWS', country_slug: 'rwanda', country_name: 'ルワンダ', location: 'Huye District', owner: 'Abdul Rudahungwa', altitude: '1,760m前後', overview: 'ルワンダ南部州フイエ地区に位置するコーヒーウォッシングステーション。2013年設立。', areas: [], ranks: [], awards: '2018年　COE 17位' },
  { slug: 'la-tina', name: 'La Tina', country_slug: 'honduras', country_name: 'ホンジュラス', location: 'Pedemal, San Jose, La Paz', owner: 'Marysabel Caballero', altitude: '1,500m', overview: 'ホンジュラスを代表する生産者夫婦が手がける農園。', areas: [], ranks: [], awards: '2016年　COE 1位' },
  { slug: 'kii-factory', name: 'Kii Factory', country_slug: 'kenya', country_name: 'ケニア', location: 'Kirinyaga County', owner: 'Rungeto FCS', altitude: '1,600-1,800m', overview: '1965年にケニア山の麓に設立されたウォッシングステーション。約850の小規模農家が組合員。', areas: [], ranks: [], awards: '' },
  { slug: 'la-terraza', name: 'La Terraza', country_slug: 'colombia', country_name: 'コロンビア', location: 'La Argentina, Huila', owner: 'Hazel Juliana Guevara', altitude: '1,800m', overview: 'ウイラ県アルヘンティーナ地区に位置する農園。Terra Coffeeを通じて届けられている。', areas: [], ranks: [], awards: '' },
];

export default INITIAL_FARMS;
