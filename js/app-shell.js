import { getConfigurationMessage, isBackendConfigured } from './config.js';

/**
 * Minimal shared boot logic. A page may call showConfigurationNotice() when a
 * user tries to use an action that requires the backend.
 */
export function showConfigurationNotice(target) {
    if (isBackendConfigured()) return false;

    const message = getConfigurationMessage();
    if (target) {
        target.textContent = message;
        target.classList.remove('hidden');
    }
    return true;
}

export function formatAppError(error) {
    const message = error?.message || 'Terjadi gangguan. Silakan coba lagi.';

    if (message.includes('Invalid login credentials')) {
        return 'Username atau kata sandi tidak sesuai.';
    }
    if (message.includes('Backend belum dihubungkan')) {
        return message;
    }
    return message;
}

