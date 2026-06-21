const INITIAL_PROCESSES = [
  { slug: 'washed', name: 'Washed', category: 'ウォッシュド系', body: '果肉除去→発酵→水洗いで乾燥。クリーンで透明感のある味わい。' },
  { slug: 'natural', name: 'Natural', category: 'ナチュラル系', body: 'チェリーのまま乾燥。果実由来の甘みや複雑なフレーバー。' },
  { slug: 'anaerobic-natural', name: 'Anaerobic Natural', category: 'アナエロビック系', body: '密封容器内で嫌気性発酵させた後、乾燥。フローラルや果実感が引き出される。' },
  { slug: 'experimental-honey', name: 'Experimental Honey', category: 'ハニー系', body: 'ミューシレージを意図的に残して乾燥させる実験的バリエーション。' },
  { slug: 'cm-washed', name: 'Carbonic Maceration Washed', category: 'カーボニックマセレーション系', body: 'CO₂充填環境で発酵後、ウォッシュドで仕上げる。Savage Coffeeが初導入。' },
  { slug: 'washed-fermented', name: 'Washed Fermented', category: 'ウォッシュド系', body: '温水処理と冷水急冷を経て、モストを加えた発酵を行いウォッシュドで仕上げる。' },
  { slug: 'extended-fermentation-natural', name: 'Extended Fermentation Natural', category: 'ナチュラル系', body: '長時間発酵させてから乾燥するナチュラルプロセスの拡張版。' },
  { slug: 'jh-washed', name: 'JH Washed', category: 'ウォッシュド系', body: 'Tri-Up社とJake Huが開発したプロセス。微生物（JH株）を用いてウォッシュドで仕上げる。' },
  { slug: 'white-honey', name: 'White Honey', category: 'ハニー系', body: 'ミューシレージ除去率が最も高いハニープロセス。' },
  { slug: 'fully-washed', name: 'Fully Washed', category: 'ウォッシュド系', body: '果肉とミューシレージを完全に洗い流して乾燥させるプロセス。' },
  { slug: 'lavender-fusion', name: 'Lavender Fusion', category: 'ナチュラル系', body: '発酵後、ラベンダーの花と共にゆっくり乾燥させるプロセス。Los Nogalesが開発。' },
];

export default INITIAL_PROCESSES;
