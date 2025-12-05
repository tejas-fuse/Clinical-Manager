import { supabase } from '../lib/supabaseClient';

const TABLE = 'change_requests';

export async function listRequestsByWard(wardId) {
  const { data, error } = await supabase
    .from(TABLE)
    .select('*')
    .eq('ward_id', wardId)
    .order('created_at', { ascending: false });
  if (error) throw error;
  return data || [];
}

export async function createChangeRequest(payload) {
  const { data, error } = await supabase
    .from(TABLE)
    .insert([payload])
    .select()
    .single();
  if (error) throw error;
  return data;
}

export async function updateRequestStatus(id, status) {
  const { data, error } = await supabase
    .from(TABLE)
    .update({ status, updated_at: new Date().toISOString() })
    .eq('id', id)
    .select()
    .single();
  if (error) throw error;
  return data;
}
