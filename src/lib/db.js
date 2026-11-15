import { supabase } from './supabase';

// updated_at はトリガーが自動更新するため送信しない
function stripMeta(obj) {
  const { updated_at, ...rest } = obj;
  return rest;
}

export async function fetchAll() {
  const [beans, farms, countries, processes, terms, projects, seals] = await Promise.all([
    supabase.from('beans').select('*'),
    supabase.from('farms').select('*'),
    supabase.from('countries').select('*'),
    supabase.from('processes').select('*'),
    supabase.from('terms').select('*'),
    supabase.from('projects').select('*'),
    supabase.from('seals').select('*'),
  ]);

  for (const res of [beans, farms, countries, processes, terms, projects, seals]) {
    if (res.error) throw new Error(res.error.message);
  }

  return {
    beans: beans.data ?? [],
    farms: farms.data ?? [],
    countries: countries.data ?? [],
    processes: processes.data ?? [],
    terms: terms.data ?? [],
    projects: projects.data ?? [],
    seals: seals.data ?? [],
  };
}

// --- beans ---
export async function upsertBean(bean) {
  const { error } = await supabase.from('beans').upsert(stripMeta(bean));
  if (error) throw new Error(error.message);
}

export async function uploadSeal(beanId, file, index = 0) {
  const ext = file.name.split('.').pop();
  const path = `${beanId}_seal${index + 1}_${Date.now()}.${ext}`;
  const { error: upErr } = await supabase.storage.from('seals').upload(path, file, { upsert: true });
  if (upErr) throw new Error(upErr.message);
  const { data } = supabase.storage.from('seals').getPublicUrl(path);
  return data.publicUrl;
}

export function parseSealUrls(sealUrl) {
  if (!sealUrl) return ['', ''];
  try {
    const arr = JSON.parse(sealUrl);
    return [arr[0] ?? '', arr[1] ?? ''];
  } catch {
    return [sealUrl, ''];
  }
}

export function serializeSealUrls(url0, url1) {
  if (!url0 && !url1) return '';
  if (url0 && !url1) return url0;
  return JSON.stringify([url0, url1].filter(Boolean));
}

export async function deleteSeal(beanId, ext) {
  const { error } = await supabase.storage.from('seals').remove([`${beanId}.${ext}`]);
  if (error) throw new Error(error.message);
}

export async function uploadStandaloneSeal(slug, file) {
  const ext = file.name.split('.').pop();
  const path = `free/${slug}.${ext}`;
  const { error: upErr } = await supabase.storage.from('seals').upload(path, file, { upsert: true });
  if (upErr) throw new Error(upErr.message);
  const { data } = supabase.storage.from('seals').getPublicUrl(path);
  return data.publicUrl;
}

async function uploadToStorage(bucket, path, file) {
  const contentType = file.type || 'image/jpeg';
  const storageUrl = `${import.meta.env.VITE_SUPABASE_URL}/storage/v1/object/${bucket}/${path}`;

  // iOSではFile参照がすぐに無効になるため、Object URL経由でBlobに変換する
  let body = file;
  try {
    const objectUrl = URL.createObjectURL(file);
    const r = await fetch(objectUrl);
    body = await r.blob();
    URL.revokeObjectURL(objectUrl);
  } catch {
    // fallback: File をそのまま使う
  }

  for (let attempt = 0; attempt <= 2; attempt++) {
    if (attempt > 0) await new Promise((r) => setTimeout(r, 1000 * attempt));
    try {
      const res = await fetch(storageUrl, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${import.meta.env.VITE_SUPABASE_ANON_KEY}`,
          'Content-Type': contentType,
          'x-upsert': 'true',
        },
        body,
      });
      if (!res.ok) {
        const text = await res.text().catch(() => '');
        throw new Error(`Upload ${res.status}: ${text}`);
      }
      return `${import.meta.env.VITE_SUPABASE_URL}/storage/v1/object/public/${bucket}/${path}`;
    } catch (e) {
      if (attempt === 2 || e.message !== 'Failed to fetch') throw e;
    }
  }
}

export async function uploadBeanImage(beanId, file) {
  const ext = file.name.split('.').pop().toLowerCase() || 'jpg';
  const path = `${beanId}-${Date.now()}.${ext}`;
  return uploadToStorage('bean-images', path, file);
}

export async function uploadCardImage(beanId, file, index = 0) {
  const ext = file.name.split('.').pop().toLowerCase() || 'jpg';
  const path = `${beanId}_card${index + 1}_${Date.now()}.${ext}`;
  return uploadToStorage('bean-images', path, file);
}

export function parseCardUrls(cardUrl) {
  if (!cardUrl) return ['', ''];
  try {
    const arr = JSON.parse(cardUrl);
    return [arr[0] ?? '', arr[1] ?? ''];
  } catch {
    return [cardUrl, ''];
  }
}

export function serializeCardUrls(url0, url1) {
  if (!url0 && !url1) return '';
  if (url0 && !url1) return url0;
  return JSON.stringify([url0, url1].filter(Boolean));
}

export async function deleteBean(id) {
  const { error } = await supabase.from('beans').delete().eq('id', id);
  if (error) throw new Error(error.message);
}

// --- slug ベーステーブル共通 ---
export async function upsertItem(table, item) {
  const { error } = await supabase.from(table).upsert(stripMeta(item));
  if (error) throw new Error(error.message);
}

export async function deleteItem(table, slug) {
  const { error } = await supabase.from(table).delete().eq('slug', slug);
  if (error) throw new Error(error.message);
}
