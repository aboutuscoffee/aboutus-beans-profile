import { supabase } from './supabase';

// updated_at はトリガーが自動更新するため送信しない
function stripMeta(obj) {
  const { updated_at, ...rest } = obj;
  return rest;
}

export async function fetchAll() {
  const [beans, farms, countries, processes, terms, projects] = await Promise.all([
    supabase.from('beans').select('*'),
    supabase.from('farms').select('*'),
    supabase.from('countries').select('*'),
    supabase.from('processes').select('*'),
    supabase.from('terms').select('*'),
    supabase.from('projects').select('*'),
  ]);

  for (const res of [beans, farms, countries, processes, terms, projects]) {
    if (res.error) throw new Error(res.error.message);
  }

  return {
    beans: beans.data ?? [],
    farms: farms.data ?? [],
    countries: countries.data ?? [],
    processes: processes.data ?? [],
    terms: terms.data ?? [],
    projects: projects.data ?? [],
  };
}

// --- beans ---
export async function upsertBean(bean) {
  const { error } = await supabase.from('beans').upsert(stripMeta(bean));
  if (error) throw new Error(error.message);
}

export async function uploadSeal(beanId, file) {
  const ext = file.name.split('.').pop();
  const path = `${beanId}.${ext}`;
  const { error: upErr } = await supabase.storage.from('seals').upload(path, file, { upsert: true });
  if (upErr) throw new Error(upErr.message);
  const { data } = supabase.storage.from('seals').getPublicUrl(path);
  return data.publicUrl;
}

export async function deleteSeal(beanId, ext) {
  const { error } = await supabase.storage.from('seals').remove([`${beanId}.${ext}`]);
  if (error) throw new Error(error.message);
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
