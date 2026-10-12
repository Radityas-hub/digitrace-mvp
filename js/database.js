import { getSupabaseClient } from './supabase-client.js';

export async function getPlasticTypes() {
    const supabase = await getSupabaseClient();
    const { data, error } = await supabase
        .from('plastic_types')
        .select('*')
        .eq('is_active', true)
        .order('sort_order');

    if (error) throw error;
    return data;
}

export async function getPlasticType(code) {
    const supabase = await getSupabaseClient();
    const { data, error } = await supabase
        .from('plastic_types')
        .select('*')
        .eq('code', code)
        .single();

    if (error) throw error;
    return data;
}

export async function getProducts() {
    const supabase = await getSupabaseClient();
    const { data, error } = await supabase
        .from('products')
        .select('id, name, brand, plastic_code, keywords')
        .eq('is_active', true)
        .order('name');

    if (error) throw error;
    return data;
}

export async function saveScan({ plasticCode, itemName, identificationMethod = 'manual', confidence = null, sortingStatus = 'saved' }) {
    const supabase = await getSupabaseClient();
    const { data, error } = await supabase.rpc('save_scan', {
        p_plastic_code: plasticCode,
        p_item_name: itemName || null,
        p_identification_method: identificationMethod,
        p_confidence: confidence,
        p_sorting_status: sortingStatus,
    });

    if (error) throw error;
    return data;
}

export async function getMyScanRecords({ limit = 50 } = {}) {
    const supabase = await getSupabaseClient();
    const { data, error } = await supabase
        .from('scan_records')
        .select('id, plastic_code, item_name, identification_method, confidence, sorting_status, points_awarded, created_at')
        .order('created_at', { ascending: false })
        .limit(limit);

    if (error) throw error;
    return data;
}

export async function getLeaderboard() {
    const supabase = await getSupabaseClient();
    const { data, error } = await supabase.rpc('get_leaderboard');
    if (error) throw error;
    return data;
}

export async function getAllScanRecords({ limit = 200 } = {}) {
    const supabase = await getSupabaseClient();
    const { data, error } = await supabase
        .from('scan_records')
        .select('id, user_id, plastic_code, item_name, identification_method, sorting_status, points_awarded, created_at')
        .order('created_at', { ascending: false })
        .limit(limit);

    if (error) throw error;
    return data;
}

export async function getProfilesForAdmin() {
    const supabase = await getSupabaseClient();
    const { data, error } = await supabase
        .from('profiles')
        .select('id, username, full_name, role, area, school, is_active')
        .order('full_name');

    if (error) throw error;
    return data;
}

