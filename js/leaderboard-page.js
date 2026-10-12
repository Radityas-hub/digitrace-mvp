import { getConfigurationMessage, isBackendConfigured } from './config.js';
import { requireProfile } from './auth.js';
import { getLeaderboard } from './database.js';
import { formatAppError } from './app-shell.js';

const feedback = document.getElementById('leaderboardFeedback');
const areaFilters = document.getElementById('areaFilters');
const podium = document.getElementById('podium');
const rankList = document.getElementById('rankList');
const totalLabel = document.getElementById('totalLabel');
let data = []; let currentArea = ''; let currentProfile;

function showFeedback(message) { feedback.textContent = message; feedback.className = 'rounded-2xl border border-red-100 bg-red-50 px-4 py-3 text-xs font-medium text-red-600'; }
function initials(name) { return name.split(' ').map((part) => part[0]).join('').slice(0, 2).toUpperCase(); }
function escapeHtml(value) { return String(value).replace(/[&<>'"]/g, (character) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', "'": '&#39;', '"': '&quot;' }[character])); }

function render() {
    const filtered = data.filter((user) => !currentArea || user.area === currentArea);
    totalLabel.textContent = `${filtered.length} pengguna`;
    podium.innerHTML = '';
    const top = [filtered[1], filtered[0], filtered[2]];
    top.forEach((user, index) => {
        const rank = [2, 1, 3][index]; const height = rank === 1 ? 'h-24' : rank === 2 ? 'h-16' : 'h-12';
        const block = document.createElement('div'); block.className = 'flex min-w-0 flex-col items-center';
        if (user) block.innerHTML = `<div class="relative mb-2"><div class="flex h-12 w-12 items-center justify-center rounded-full bg-white/15 ring-2 ${rank === 1 ? 'ring-warning' : 'ring-white/60'} text-sm font-bold">${initials(user.full_name)}</div><span class="absolute -bottom-2 left-1/2 -translate-x-1/2 whitespace-nowrap rounded-full bg-white px-1.5 py-0.5 text-[8px] font-bold text-eco">${user.total_points} poin</span></div><p class="mb-2 w-full truncate text-center text-[10px] font-semibold">${escapeHtml(user.full_name)}</p><div style="height:${rank === 1 ? 96 : rank === 2 ? 64 : 48}px;background:rgba(255,255,255,${rank === 1 ? 0.2 : 0.1})" class="w-full rounded-t-xl flex items-center justify-center text-lg font-extrabold">${rank}</div>`;
        else block.innerHTML = `<div class="mb-2 h-12"></div><p class="mb-2 text-[10px] text-white/60">—</p><div class="${height} w-full rounded-t-xl bg-white/5 flex items-center justify-center text-lg font-extrabold">${rank}</div>`;
        podium.appendChild(block);
    });
    rankList.innerHTML = '';
    if (!filtered.length) { rankList.innerHTML = '<div class="rounded-3xl border border-dashed border-gray-200 bg-white px-5 py-10 text-center text-xs text-gray-400">Belum ada pengguna pada daerah ini.</div>'; return; }
    filtered.forEach((user, index) => {
        const rank = index + 1; const isMe = user.user_id === currentProfile.id; const card = document.createElement('div');
        card.className = `flex items-center gap-3 rounded-2xl border p-3.5 shadow-sm ${isMe ? 'border-eco bg-ecoLight' : 'border-gray-100 bg-white'}`;
        card.innerHTML = `<span class="flex h-7 w-7 shrink-0 items-center justify-center rounded-xl ${rank <= 3 ? 'bg-warning/10 text-warning' : 'bg-gray-50 text-gray-400'} text-xs font-bold">${rank <= 3 ? '<i class="fa-solid fa-trophy"></i>' : rank}</span><span class="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-eco text-sm font-bold text-white">${initials(user.full_name)}</span><span class="min-w-0 flex-1"><span class="flex items-center gap-1.5"><span class="truncate text-sm font-semibold text-gray-900">${escapeHtml(user.full_name)}</span>${isMe ? '<span class="rounded-full bg-white px-1.5 py-0.5 text-[8px] font-bold text-eco">KAMU</span>' : ''}</span><span class="mt-0.5 block text-[10px] text-gray-400"><i class="fa-solid fa-location-dot mr-1 text-eco"></i>${escapeHtml(user.area || 'Tanpa daerah')} · ${user.total_scans} scan</span></span><span class="text-right"><span class="block text-sm font-bold text-eco">${user.total_points.toLocaleString('id-ID')}</span><span class="text-[9px] text-gray-400">poin</span></span>`;
        rankList.appendChild(card);
    });
}

function buildFilters() {
    [...new Set(data.map((user) => user.area).filter(Boolean))].sort().forEach((area) => { const button = document.createElement('button'); button.className = 'filter-pill shrink-0 px-3.5 py-1.5 rounded-xl text-[11px]'; button.dataset.area = area; button.textContent = area; areaFilters.appendChild(button); });
    areaFilters.addEventListener('click', (event) => { const button = event.target.closest('[data-area]'); if (!button) return; currentArea = button.dataset.area; areaFilters.querySelectorAll('[data-area]').forEach((item) => item.classList.toggle('active', item === button)); render(); });
}

async function boot() {
    if (!isBackendConfigured()) { showFeedback(getConfigurationMessage()); return; }
    try { currentProfile = await requireProfile(); if (!currentProfile) return; document.getElementById('profileInitial').textContent = initials(currentProfile.full_name); data = await getLeaderboard(); buildFilters(); render(); } catch (error) { showFeedback(formatAppError(error)); }
}
boot();

