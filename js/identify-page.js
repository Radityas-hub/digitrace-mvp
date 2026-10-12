import { getConfigurationMessage, isBackendConfigured } from './config.js';
import { requireProfile } from './auth.js';
import { getPlasticTypes, getProducts } from './database.js';
import { formatAppError } from './app-shell.js';

const quickChoices = document.getElementById('quickChoices');
const manualType = document.getElementById('manualType');
const itemName = document.getElementById('itemName');
const feedback = document.getElementById('identifyFeedback');
const pageParams = new URLSearchParams(window.location.search);
const visionCandidates = new Map((pageParams.get('candidates') || '').split(',').filter(Boolean).map((value) => {
    const [code, confidence] = value.split(':');
    return [code, Number(confidence) || null];
}));
const quickCodes = visionCandidates.size ? [...visionCandidates.keys()] : ['PET', 'HDPE', 'LDPE'];
let typesByCode = new Map();
const knownProducts = document.getElementById('knownProducts');

function showFeedback(message) {
    feedback.textContent = message;
    feedback.className = 'mt-4 rounded-2xl border border-red-100 bg-red-50 px-4 py-3 text-xs font-medium text-red-600';
}

function continueToEducation(code, manual = false) {
    if (!code) {
        showFeedback('Pilih satu jenis plastik terlebih dahulu.');
        return;
    }
    const isVisionConfirmation = !manual && pageParams.get('source') === 'vision' && visionCandidates.has(code);
    const params = new URLSearchParams({ code, method: isVisionConfirmation ? 'ai_confirmed' : 'manual' });
    if (isVisionConfirmation && visionCandidates.get(code) !== null) params.set('confidence', visionCandidates.get(code));
    const name = itemName.value.trim();
    if (name) params.set('name', name);
    window.location.assign(`education.html?${params.toString()}`);
}

function renderTypes(types) {
    typesByCode = new Map(types.map((type) => [type.code, type]));
    quickChoices.innerHTML = '';

    quickCodes.map((code) => typesByCode.get(code)).filter(Boolean).forEach((type) => {
        const button = document.createElement('button');
        button.type = 'button';
        button.className = 'w-full rounded-2xl border border-gray-100 bg-white p-4 text-left shadow-sm transition hover:border-eco/40 hover:shadow-md';
        const confidence = visionCandidates.get(type.code);
        button.innerHTML = `
            <div class="flex items-center gap-3">
                <span class="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl text-sm font-extrabold text-white" style="background:${type.chart_color}">${type.resin_number || '?'}</span>
                <span class="min-w-0 flex-1"><span class="block text-sm font-bold text-gray-900">${type.code} · ${type.name}</span><span class="mt-0.5 block truncate text-[10px] text-gray-400">${confidence ? `Kandidat scan · ${Math.round(confidence * 100)}%` : (type.examples[0] || type.short_description)}</span></span>
                <i class="fa-solid fa-chevron-right text-xs text-gray-300"></i>
            </div>`;
        button.addEventListener('click', () => continueToEducation(type.code));
        quickChoices.appendChild(button);
    });

    types.forEach((type) => {
        const option = document.createElement('option');
        option.value = type.code;
        option.textContent = `${type.code} — ${type.name}`;
        manualType.appendChild(option);
    });

    manualType.addEventListener('change', () => {
        if (manualType.value) continueToEducation(manualType.value, true);
    });
}

function renderProducts(products) {
    if (!products.length) return;
    document.getElementById('knownProductSection').classList.remove('hidden');
    products.forEach((product) => {
        const chip = document.createElement('button');
        chip.type = 'button';
        chip.className = 'rounded-xl bg-ecoLight px-3 py-2 text-[10px] font-semibold text-eco transition hover:brightness-95';
        chip.textContent = `${product.name} · ${product.plastic_code}`;
        chip.addEventListener('click', () => {
            itemName.value = product.name;
            continueToEducation(product.plastic_code, true);
        });
        knownProducts.appendChild(chip);
    });
}

async function boot() {
    if (!isBackendConfigured()) {
        showFeedback(getConfigurationMessage());
        return;
    }
    try {
        const profile = await requireProfile();
        if (!profile) return;
        const [types, products] = await Promise.all([getPlasticTypes(), getProducts()]);
        renderTypes(types);
        renderProducts(products);
        if (visionCandidates.size) document.getElementById('quickChoiceTitle').textContent = 'Kandidat dari pemindaian';
    } catch (error) {
        showFeedback(formatAppError(error));
    }
}

boot();

