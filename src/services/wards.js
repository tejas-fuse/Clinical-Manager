import { supabase } from '../lib/supabaseClient';

const TABLE = 'wards';

export async function fetchWards() {
  const { data, error } = await supabase
    .from(TABLE)
    .select('*')
    .order('created_at', { ascending: true });

  if (error) throw error;
  return data || [];
}

export async function createWard(name) {
  const { data, error } = await supabase
    .from(TABLE)
    .insert([{ name }])
    .select()
    .single();

  if (error) throw error;
  return data;
}

export async function deleteWard(id) {
  const { error } = await supabase
    .from(TABLE)
    .delete()
    .eq('id', id);

  if (error) throw error;
  return true;
}
