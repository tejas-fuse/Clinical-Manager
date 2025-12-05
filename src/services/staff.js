import { supabase } from '../lib/supabaseClient';

const TABLE = 'staff';

export async function listStaffByWard(wardId) {
  const { data, error } = await supabase
    .from(TABLE)
    .select('*')
    .eq('ward_id', wardId)
    .order('created_at', { ascending: true });
  if (error) throw error;
  return data || [];
}

export async function createStaff(wardId, fullName, role) {
  const { data, error } = await supabase
    .from(TABLE)
    .insert([{ ward_id: wardId, full_name: fullName, role }])
    .select()
    .single();
  if (error) throw error;
  return data;
}

export async function deleteStaff(staffId) {
  const { error } = await supabase
    .from(TABLE)
    .delete()
    .eq('id', staffId);
  if (error) throw error;
  return true;
}

export async function listStaffByWardIds(wardIds = []) {
  if (!wardIds.length) return [];
  const { data, error } = await supabase
    .from(TABLE)
    .select('*')
    .in('ward_id', wardIds)
    .order('created_at', { ascending: true });
  if (error) throw error;
  return data || [];
}
