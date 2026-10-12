/**
 * Konfigurasi browser DIGITRACE.
 *
 * Isi dua nilai Supabase di bawah dengan Project URL dan publishable/anon key
 * dari dashboard Supabase. Keduanya boleh berada di browser. Jangan pernah
 * menaruh sb_secret, service_role, atau password admin dalam file ini.
 */
export const APP_CONFIG = Object.freeze({
    supabaseUrl: 'https://dggdmphzcmtkuvxmpnhe.supabase.co',
    supabasePublishableKey: 'sb_publishable_t2I2A48Lh6KYnfK3BpZH6w_u3cYPFUp',
    internalEmailDomain: 'digitrace.local',
    scanPoints: 10,
});

export function isBackendConfigured() {
    return Boolean(APP_CONFIG.supabaseUrl && APP_CONFIG.supabasePublishableKey);
}

export function getConfigurationMessage() {
    return 'Backend belum dihubungkan. Isi supabaseUrl dan supabasePublishableKey di js/config.js terlebih dahulu.';
}

