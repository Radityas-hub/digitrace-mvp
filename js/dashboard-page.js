import { getConfigurationMessage, isBackendConfigured } from './config.js';
import { getCurrentProfile, requireProfile, signOut } from './auth.js';
import { getMyScanRecords, getPlasticTypes } from './database.js';
import { formatAppError } from './app-shell.js';

const feedback = document.getElementById('dashboardFeedback');
const chart = document.getElementById('pieChart');
const legend = document.getElementById('chartLegend');
const chartContent = document.getElementById('chartContent');
const chartEmpty = document.getElementById('chartEmpty');
const historyList = document.getElementById('historyList');

function escapeHtml(value) {
    return String(value).replace(/[&<>'"]/g, (character) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', "'": '&#39;', '"': '&quot;' }[character]));
}

function showFeedback(message) {
    feedback.textContent = message;
    feedback.className = 'rounded-2xl border border-red-100 bg-red-50 px-4 py-3 text-xs font-medium text-red-600';
}

function formatDate(value) {
    return new Intl.DateTimeFormat('id-ID', { day: '2-digit', month: 'short', year: 'numeric' }).format(new Date(value));
}

function contributorTier(points) {
    if (points >= 3000) return 'Kontributor Elite';
    if (points >= 2000) return 'Kontributor Ahli';
    if (points >= 1000) return 'Kontributor Aktif';
    return 'Kontributor Pemula';
}

function renderChart(records, typesByCode) {
    const countByCode = records.reduce((result, record) => {
        result[record.plastic_code] = (result[record.plastic_code] || 0) + 1;
        return result;
    }, {});
    const entries = Object.entries(countByCode).map(([code, count]) => ({ code, count, type: typesByCode.get(code) })).filter((entry) => entry.type);
    if (!entries.length) {
        chartContent.classList.add('hidden');
        chartEmpty.classList.remove('hidden');
        return;
    }
    chartContent.classList.remove('hidden');
    chartEmpty.classList.add('hidden');
    chart.innerHTML = '<circle cx="50" cy="50" r="38" fill="none" stroke="#eef2ef" stroke-width="16"></circle>';
    legend.innerHTML = '';
    const total = records.length;
    const circumference = 2 * Math.PI * 38;
    let offset = 0;
    entries.forEach((entry) => {
        const length = (entry.count / total) * circumference;
        const segment = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
        segment.setAttribute('cx', '50'); segment.setAttribute('cy', '50'); segment.setAttribute('r', '38');
        segment.setAttribute('fill', 'none'); segment.setAttribute('stroke', entry.type.chart_color); segment.setAttribute('stroke-width', '16');
        segment.setAttribute('stroke-dasharray', `${length} ${circumference - length}`);
        segment.setAttribute('stroke-dashoffset', `${-offset}`);
        segment.setAttribute('transform', 'rotate(-90 50 50)');
        chart.appendChild(segment);
        offset += length;

        const row = document.createElement('div');
        row.className = 'flex items-center justify-between gap-2 text-[10px]';
        row.innerHTML = `<span class="flex min-w-0 items-center gap-2"><span class="h-2.5 w-2.5 shrink-0 rounded-full" style="background:${entry.type.chart_color}"></span><span class="truncate text-gray-600">${entry.code}</span></span><span class="font-bold text-gray-800">${Math.round((entry.count / total) * 100)}%</span>`;
        legend.appendChild(row);
    });
    const label = document.createElementNS('http://www.w3.org/2000/svg', 'text');
    label.setAttribute('x', '50'); label.setAttribute('y', '48'); label.setAttribute('text-anchor', 'middle'); label.setAttribute('font-size', '15'); label.setAttribute('font-weight', '700'); label.setAttribute('fill', '#111827'); label.textContent = total;
    chart.appendChild(label);
    const caption = document.createElementNS('http://www.w3.org/2000/svg', 'text');
    caption.setAttribute('x', '50'); caption.setAttribute('y', '61'); caption.setAttribute('text-anchor', 'middle'); caption.setAttribute('font-size', '7'); caption.setAttribute('fill', '#9ca3af'); caption.textContent = 'SCAN';
    chart.appendChild(caption);
}

function renderHistory(records, typesByCode) {
    historyList.innerHTML = '';
    if (!records.length) {
        historyList.innerHTML = '<div class="rounded-3xl border border-dashed border-gray-200 bg-white px-5 py-8 text-center text-xs leading-relaxed text-gray-400">Belum ada riwayat. Mulai scan sampah pertama kamu untuk melihat progres.</div>';
        return;
    }
    records.slice(0, 3).forEach((record) => {
        const type = typesByCode.get(record.plastic_code);
        const card = document.createElement('a');
        card.href = `education.html?code=${encodeURIComponent(record.plastic_code)}`;
        card.className = 'flex items-center gap-3 rounded-2xl border border-gray-100 bg-white p-4 shadow-sm transition hover:shadow-md';
        const label = record.item_name || `${record.plastic_code} · ${type?.name || 'Plastik'}`;
        card.innerHTML = `<span class="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl text-sm font-bold text-white" style="background:${type?.chart_color || '#7B8794'}">${type?.resin_number || '?'}</span><span class="min-w-0 flex-1"><span class="block truncate text-sm font-semibold text-gray-900">${escapeHtml(label)}</span><span class="mt-0.5 block text-[10px] text-gray-400"><i class="fa-regular fa-calendar mr-1"></i>${formatDate(record.created_at)} · +${record.points_awarded} poin</span></span><i class="fa-solid fa-chevron-right text-xs text-gray-300"></i>`;
        historyList.appendChild(card);
    });
}

async function boot() {
    if (!isBackendConfigured()) { showFeedback(getConfigurationMessage()); return; }
    try {
        const profile = await requireProfile();
        if (!profile) return;
        const [records, types] = await Promise.all([getMyScanRecords(), getPlasticTypes()]);
        const typesByCode = new Map(types.map((type) => [type.code, type]));
        const points = records.reduce((total, record) => total + record.points_awarded, 0);
        document.getElementById('profileName').textContent = profile.full_name;
        document.getElementById('pointsDisplay').textContent = points.toLocaleString('id-ID');
        document.getElementById('scanCount').textContent = records.length;
        document.getElementById('typeCount').textContent = new Set(records.map((record) => record.plastic_code)).size;
        document.getElementById('contributorTier').textContent = contributorTier(points);
        renderChart(records, typesByCode);
        renderHistory(records, typesByCode);
    } catch (error) { showFeedback(formatAppError(error)); }
}

document.querySelector('[data-logout]').addEventListener('click', async () => {
    try { await signOut(); } finally { window.location.assign('login.html'); }
});

boot();

