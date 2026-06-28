// src/data/*.js から Supabase 用の seed SQL を生成するスクリプト
import { readFileSync, writeFileSync } from 'fs';
import { createRequire } from 'module';
import { fileURLToPath } from 'url';
import { dirname, resolve } from 'path';

const __dir = dirname(fileURLToPath(import.meta.url));
const root = resolve(__dir, '..');

// JS ファイルを直接評価して配列を取り出す
function loadData(file) {
  const src = readFileSync(resolve(root, 'src/data', file), 'utf8');
  // const INITIAL_XXX = [...]; export default INITIAL_XXX; の形式を eval
  const match = src.match(/const \w+ = (\[[\s\S]+?\]);\s*export default/);
  if (!match) throw new Error(`parse error: ${file}`);
  return eval(match[1]); // eslint-disable-line no-eval
}

// SQL 文字列エスケープ（シングルクォートを ''）
const esc = (v) => {
  if (v === null || v === undefined) return 'NULL';
  if (typeof v === 'boolean') return v ? 'true' : 'false';
  if (typeof v === 'number') return String(v);
  if (typeof v === 'object') return `'${JSON.stringify(v).replace(/'/g, "''")}'`;
  return `'${String(v).replace(/'/g, "''")}'`;
};

const beans     = loadData('beans.js');
const farms     = loadData('farms.js');
const countries = loadData('countries.js');
const processes = loadData('processes.js');
const terms     = loadData('terms.js');

const lines = [];

lines.push('-- ============================================================');
lines.push(`-- beans (${beans.length}件)`);
lines.push('-- ============================================================');
lines.push('INSERT INTO beans (id,name,origin,region,variety,altitude,process,terroir,status,is_new,price,description_ja,description_en,taste_ja,taste_en,detail_ja,detail_en) VALUES');
lines.push(beans.map(b =>
  `(${esc(b.id)},${esc(b.name)},${esc(b.origin)},${esc(b.region)},${esc(b.variety)},${esc(b.altitude)},${esc(b.process)},${esc(b.terroir)},${esc(b.status)},${esc(b.is_new)},${esc(b.price)},${esc(b.description_ja)},${esc(b.description_en)},${esc(b.taste_ja)},${esc(b.taste_en)},${esc(b.detail_ja)},${esc(b.detail_en)})`
).join(',\n'));
lines.push('ON CONFLICT (id) DO NOTHING;\n');

lines.push('-- ============================================================');
lines.push(`-- countries (${countries.length}件)`);
lines.push('-- ============================================================');
lines.push('INSERT INTO countries (slug,name,flag,region,altitude,climate,overview) VALUES');
lines.push(countries.map(c =>
  `(${esc(c.slug)},${esc(c.name)},${esc(c.flag)},${esc(c.region)},${esc(c.altitude)},${esc(c.climate)},${esc(c.overview)})`
).join(',\n'));
lines.push('ON CONFLICT (slug) DO NOTHING;\n');

lines.push('-- ============================================================');
lines.push(`-- processes (${processes.length}件)`);
lines.push('-- ============================================================');
lines.push('INSERT INTO processes (slug,name,category,body) VALUES');
lines.push(processes.map(p =>
  `(${esc(p.slug)},${esc(p.name)},${esc(p.category)},${esc(p.body)})`
).join(',\n'));
lines.push('ON CONFLICT (slug) DO NOTHING;\n');

lines.push('-- ============================================================');
lines.push(`-- terms (${terms.length}件)`);
lines.push('-- ============================================================');
lines.push('INSERT INTO terms (slug,name,category,body) VALUES');
lines.push(terms.map(t =>
  `(${esc(t.slug)},${esc(t.name)},${esc(t.category)},${esc(t.body)})`
).join(',\n'));
lines.push('ON CONFLICT (slug) DO NOTHING;\n');

lines.push('-- ============================================================');
lines.push(`-- farms (${farms.length}件)`);
lines.push('-- ============================================================');
lines.push('INSERT INTO farms (slug,name,country_slug,country_name,location,owner,altitude,overview,areas,ranks,awards) VALUES');
lines.push(farms.map(f =>
  `(${esc(f.slug)},${esc(f.name)},${esc(f.country_slug)},${esc(f.country_name)},${esc(f.location)},${esc(f.owner)},${esc(f.altitude)},${esc(f.overview)},${esc(f.areas ?? [])},${esc(f.ranks ?? [])},${esc(f.awards)})`
).join(',\n'));
lines.push('ON CONFLICT (slug) DO NOTHING;\n');

lines.push('-- ============================================================');
lines.push('-- 件数確認');
lines.push('-- ============================================================');
lines.push(`SELECT 'beans'     AS tbl, count(*) FROM beans
UNION ALL SELECT 'countries', count(*) FROM countries
UNION ALL SELECT 'processes', count(*) FROM processes
UNION ALL SELECT 'terms',     count(*) FROM terms
UNION ALL SELECT 'farms',     count(*) FROM farms
ORDER BY tbl;`);

const sql = lines.join('\n');
const out = resolve(__dir, 'seed.sql');
writeFileSync(out, sql, 'utf8');
console.log(`✓ 生成完了: ${out}`);
console.log(`  beans: ${beans.length}件, farms: ${farms.length}件, countries: ${countries.length}件, processes: ${processes.length}件, terms: ${terms.length}件`);
