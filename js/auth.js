import { APP_CONFIG } from './config.js';
import { getSupabaseClient } from './supabase-client.js';

function normalizeUsername(username) {
    return String(username || '').trim().toLowerCase();
}

export function usernameToInternalEmail(username) {
    const normalizedUsername = normalizeUsername(username);

    if (!/^[a-z0-9._-]{3,32}$/.test(normalizedUsername)) {
        throw new Error('Username harus terdiri dari 3–32 huruf kecil, angka, titik, garis bawah, atau tanda hubung.');
    }

    return `${normalizedUsername}@${APP_CONFIG.internalEmailDomain}`;
}

export async function signInWithUsername(username, password) {
    const supabase = await getSupabaseClient();
    const { data, error } = await supabase.auth.signInWithPassword({
        email: usernameToInternalEmail(username),
        password,
    });

    if (error) throw error;
    return data;
}

export async function signOut() {
    const supabase = await getSupabaseClient();
    const { error } = await supabase.auth.signOut();
    if (error) throw error;
}

export async function getCurrentSession() {
    const supabase = await getSupabaseClient();
    const { data, error } = await supabase.auth.getSession();
    if (error) throw error;
    return data.session;
}

export async function getCurrentProfile() {
    const session = await getCurrentSession();
    if (!session) return null;

    const supabase = await getSupabaseClient();
    const { data, error } = await supabase
        .from('profiles')
        .select('id, username, full_name, role, area, school, is_active')
        .eq('id', session.user.id)
        .single();

    if (error) throw error;
    return data;
}

export async function requireProfile({ adminOnly = false, redirectTo = 'login.html' } = {}) {
    const profile = await getCurrentProfile();

    if (!profile || !profile.is_active || (adminOnly && profile.role !== 'admin')) {
        window.location.replace(redirectTo);
        return null;
    }

    return profile;
}

