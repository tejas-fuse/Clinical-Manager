import { supabase } from '../lib/supabaseClient';

const TABLE = 'assignments';

export async function listAssignmentsByWard(wardId) {
  const { data, error } = await supabase
    .from(TABLE)
    .select('*')
    .eq('ward_id', wardId)
    .order('created_at', { ascending: true });
  if (error) throw error;
  return data || [];
}

export async function addAssignment({ wardId, staffId, dateKey, shiftId }) {
  const { data, error } = await supabase
    .from(TABLE)
    .insert([{ ward_id: wardId, staff_id: staffId, date_key: dateKey, shift_id: shiftId }])
    .select()
    .single();
  if (error) throw error;
  return data;
}

export async function removeAssignment({ wardId, staffId, dateKey, shiftId }) {
  const { error } = await supabase
    .from(TABLE)
    .delete()
    .eq('ward_id', wardId)
    .eq('staff_id', staffId)
    .eq('date_key', dateKey)
    .eq('shift_id', shiftId);
  if (error) throw error;
  return true;
}
