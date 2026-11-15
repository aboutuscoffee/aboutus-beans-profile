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

function xhrUpload(url, body, contentType, key) {
  return new Promise((resolve, reject) => {
    const xhr = new XMLHttpRequest();
    xhr.open('POST', url, true);
    xhr.setRequestHeader('Authorization', `Bearer ${key}`);
    xhr.setRequestHeader('Content-Type', contentType);
    xhr.setRequestHeader('x-upsert', 'true');
    xhr.onload = () => {
      if (xhr.status >= 200 && xhr.status < 300) resolve();
      else reject(new Error(`Upload ${xhr.status}: ${xhr.responseText}`));
    };
    xhr.onerror = () => reject(new Error('XHR network error'));
    xhr.ontimeout = () => reject(new Error('XHR timeout'));
    xhr.timeout = 60000;
    xhr.send(body);
  });
}

async function uploadToStorage(bucket, path, file) {
  const contentType = file.type || 'image/jpeg';
  const storageUrl = `${import.meta.env.VITE_SUPABASE_URL}/storage/v1/object/${bucket}/${path}`;
  const key = import.meta.env.VITE_SUPABASE_ANON_KEY;
  const publicUrl = `${import.meta.env.VITE_SUPABASE_URL}/storage/v1/object/public/${bucket}/${path}`;

  // Object URL経由でBlobに変換（iOS Safariのファイル参照問題対策）
  let body = file;
  try {
    const objectUrl = URL.createObjectURL(file);
    const r = await fetch(objectUrl);
    body = await r.blob();
    URL.revokeObjectURL(objectUrl);
  } catch {
    // fallback
  }

  // まず fetch で試みる
  for (let attempt = 0; attempt <= 1; attempt++) {
    if (attempt > 0) await new Promise((r) => setTimeout(r, 1000));
    try {
      const res = await fetch(storageUrl, {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${key}`, 'Content-Type': contentType, 'x-upsert': 'true' },
        body,
      });
      if (!res.ok) {
        const text = await res.text().catch(() => '');
        throw new Error(`Upload ${res.status}: ${text}`);
      }
      return publicUrl;
    } catch (e) {
      if (e.message !== 'Failed to fetch') throw e;
    }
  }

  // fetchが全滅した場合はXHRで試みる
  await xhrUpload(storageUrl, body, contentType, key);
  return publicUrl;
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
