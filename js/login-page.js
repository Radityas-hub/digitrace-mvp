import { getConfigurationMessage, isBackendConfigured } from './config.js';
import { getCurrentProfile, getCurrentSession, signInWithUsername, signOut } from './auth.js';
import { formatAppError } from './app-shell.js';

const form = document.getElementById('loginForm');
const usernameInput = document.getElementById('username');
const passwordInput = document.getElementById('password');
const submitButton = document.getElementById('loginButton');
const feedback = document.getElementById('loginFeedback');
const configNotice = document.getElementById('configNotice');

function setFeedback(message = '', type = 'error') {
    feedback.textContent = message;
    feedback.className = message
        ? `rounded-xl px-3 py-2.5 text-xs font-medium ${type === 'success' ? 'bg-ecoLight text-eco' : 'bg-red-50 text-red-600 border border-red-100'}`
        : 'hidden';
}

function setLoading(isLoading) {
    submitButton.disabled = isLoading;
    submitButton.classList.toggle('opacity-70', isLoading);
    submitButton.innerHTML = isLoading
        ? '<i class="fa-solid fa-circle-notch fa-spin"></i> Memeriksa akun...'
        : '<i class="fa-solid fa-arrow-right-to-bracket"></i> Masuk';
}

async function routeAuthenticatedUser() {
    const profile = await getCurrentProfile();
    if (!profile || !profile.is_active) {
        await signOut();
        throw new Error('Akun ini belum aktif. Hubungi admin DIGITRACE.');
    }

    window.location.replace(profile.role === 'admin' ? 'admin.html' : 'dashboard.html');
}

async function bootLogin() {
    if (!isBackendConfigured()) {
        configNotice.textContent = getConfigurationMessage();
        configNotice.classList.remove('hidden');
        return;
    }

    try {
        const session = await getCurrentSession();
        if (session) await routeAuthenticatedUser();
    } catch (error) {
        setFeedback(formatAppError(error));
    }
}

form.addEventListener('submit', async (event) => {
    event.preventDefault();
    setFeedback();

    if (!isBackendConfigured()) {
        setFeedback(getConfigurationMessage());
        return;
    }

    setLoading(true);
    try {
        await signInWithUsername(usernameInput.value, passwordInput.value);
        await routeAuthenticatedUser();
    } catch (error) {
        setFeedback(formatAppError(error));
        setLoading(false);
    }
});

bootLogin();

