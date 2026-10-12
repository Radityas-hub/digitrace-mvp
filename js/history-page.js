import { getConfigurationMessage, isBackendConfigured } from './config.js';
import { requireProfile } from './auth.js';
import { getMyScanRecords, getPlasticTypes } from './database.js';
import { formatAppError } from './app-shell.js';

const list = document.getElementById('historyItems');
const feedback = document.getElementById('historyFeedback');

function escapeHtml(value) {
    return String(value).replace(/[&<>'"]/g, (character) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', "'": '&#39;', '"': '&quot;' }[character]));
}

function showFeedback(message) {
    feedback.textContent = message;
    feedback.className = 'mb-4 rounded-2xl border border-red-100 bg-red-50 px-4 py-3 text-xs font-medium text-red-600';
}

function formatDate(value) {
    return new Intl.DateTimeFormat('id-ID', { dateStyle: 'medium', timeStyle: 'short' }).format(new Date(value));
}

function render(records, typesByCode) {
    list.innerHTML = '';
    if (!records.length) {
        list.innerHTML = '<div class="rounded-3xl border border-dashed border-gray-200 bg-white px-5 py-10 text-center text-xs leading-relaxed text-gray-400">Belum ada riwayat. Ayo mulai scan dan pelajari jenis plastik pertama kamu.</div>';
        return;
    }
    records.forEach((record) => {
        const type = typesByCode.get(record.plastic_code);
        const card = document.createElement('a');
        card.href = `education.html?code=${encodeURIComponent(record.plastic_code)}`;
        card.className = 'flex items-center gap-3 rounded-2xl border border-gray-100 bg-white p-4 shadow-sm transition hover:shadow-md';
        const method = record.identification_method === 'ai_confirmed' ? 'Dikonfirmasi dari scan' : 'Dipilih manual';
        const label = record.item_name || `${record.plastic_code} · ${type?.name || 'Plastik'}`;
        card.innerHTML = `<span class="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl text-sm font-bold text-white" style="background:${type?.chart_color || '#7B8794'}">${type?.resin_number || '?'}</span><span class="min-w-0 flex-1"><span class="block truncate text-sm font-semibold text-gray-900">${escapeHtml(label)}</span><span class="mt-1 block text-[10px] text-gray-400">${formatDate(record.created_at)}</span><span class="mt-1 block text-[10px] font-medium text-eco">${method} · +${record.points_awarded} poin</span></span><i class="fa-solid fa-chevron-right text-xs text-gray-300"></i>`;
        list.appendChild(card);
    });
}

async function boot() {
    if (!isBackendConfigured()) { showFeedback(getConfigurationMessage()); return; }
    try {
        const profile = await requireProfile();
        if (!profile) return;
        const [records, types] = await Promise.all([getMyScanRecords({ limit: 200 }), getPlasticTypes()]);
        render(records, new Map(types.map((type) => [type.code, type])));
    } catch (error) { showFeedback(formatAppError(error)); }
}

boot();

