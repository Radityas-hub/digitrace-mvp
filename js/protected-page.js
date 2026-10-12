import { getConfigurationMessage, isBackendConfigured } from './config.js';
import { getCurrentProfile, requireProfile, signOut } from './auth.js';
import { formatAppError } from './app-shell.js';

function renderNotice(message) {
    let notice = document.getElementById('appNotice');
    if (!notice) {
        notice = document.createElement('div');
        notice.id = 'appNotice';
        notice.className = 'fixed top-3 left-4 right-4 z-[100] max-w-md mx-auto rounded-2xl border border-amber-200 bg-amber-50 px-4 py-3 text-xs font-medium text-amber-800 shadow-lg';
        document.body.appendChild(notice);
    }
    notice.textContent = message;
}

function populateProfile(profile) {
    document.querySelectorAll('[data-profile-name]').forEach((element) => {
        element.textContent = profile.full_name;
    });

    document.querySelectorAll('[data-profile-initial]').forEach((element) => {
        element.textContent = profile.full_name.trim().charAt(0).toUpperCase();
    });
}

async function bootProtectedPage() {
    if (!isBackendConfigured()) {
        renderNotice(getConfigurationMessage());
        return;
    }

    try {
        const adminOnly = document.body.dataset.adminOnly === 'true';
        const profile = await requireProfile({ adminOnly });
        if (!profile) return;

        populateProfile(profile);

        document.querySelectorAll('[data-logout]').forEach((button) => {
            button.addEventListener('click', async () => {
                button.disabled = true;
                try {
                    await signOut();
                } catch (error) {
                    renderNotice(formatAppError(error));
                } finally {
                    window.location.replace('login.html');
                }
            });
        });
    } catch (error) {
        renderNotice(formatAppError(error));
    }
}

bootProtectedPage();

