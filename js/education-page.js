import { getConfigurationMessage, isBackendConfigured } from './config.js';
import { requireProfile } from './auth.js';
import { getPlasticType, saveScan } from './database.js';
import { formatAppError } from './app-shell.js';

const params = new URLSearchParams(window.location.search);
const plasticCode = params.get('code');
const itemName = params.get('name') || '';
const method = params.get('method') === 'ai_confirmed' ? 'ai_confirmed' : 'manual';
const confidence = Number(params.get('confidence')) || null;
const feedback = document.getElementById('educationFeedback');
const saveButton = document.getElementById('saveScanBtn');
let currentType;

function showFeedback(message, type = 'error') {
    feedback.textContent = message;
    feedback.className = `mb-4 rounded-2xl border px-4 py-3 text-xs font-medium ${type === 'success' ? 'border-eco/20 bg-ecoLight text-eco' : 'border-red-100 bg-red-50 text-red-600'}`;
}

function renderType(type) {
    currentType = type;
    document.getElementById('typeCode').textContent = `${type.code} · KODE DAUR ULANG ${type.resin_number || 7}`;
    document.getElementById('typeName').textContent = type.name;
    document.getElementById('resinNumber').textContent = type.resin_number || 7;
    document.getElementById('shortDescription').textContent = type.short_description;
    document.getElementById('characteristics').textContent = type.characteristics;
    document.getElementById('environmentalImpact').textContent = type.environmental_impact;
    document.getElementById('typeHero').style.backgroundColor = type.chart_color;

    const badge = document.getElementById('recycleBadge');
    badge.textContent = type.recyclable ? 'DAPAT DIDAUR ULANG' : 'PERLU PENANGANAN KHUSUS';
    badge.className = `rounded-full px-2.5 py-1 text-[9px] font-bold ${type.recyclable ? 'bg-ecoLight text-eco' : 'bg-orange-50 text-orange-600'}`;

    const steps = document.getElementById('sortingSteps');
    steps.innerHTML = '';
    type.sorting_steps.forEach((step, index) => {
        const item = document.createElement('li');
        item.className = 'flex gap-3 text-xs leading-relaxed text-gray-600';
        item.innerHTML = `<span class="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-ecoLight text-[10px] font-bold text-eco">${index + 1}</span><span class="pt-0.5">${step}</span>`;
        steps.appendChild(item);
    });

    const examples = document.getElementById('examples');
    examples.innerHTML = '';
    type.examples.forEach((example) => {
        const chip = document.createElement('span');
        chip.className = 'rounded-xl bg-gray-50 px-3 py-2 text-[10px] font-medium text-gray-600';
        chip.textContent = example;
        examples.appendChild(chip);
    });
}

saveButton.addEventListener('click', async () => {
    if (!currentType) return;
    saveButton.disabled = true;
    saveButton.innerHTML = '<i class="fa-solid fa-circle-notch fa-spin"></i><span>Menyimpan...</span>';
    try {
        await saveScan({
            plasticCode: currentType.code,
            itemName,
            identificationMethod: method,
            confidence,
        });
        showFeedback(`Tersimpan! Kamu memperoleh 10 poin untuk ${currentType.code}.`, 'success');
        saveButton.innerHTML = '<i class="fa-solid fa-circle-check"></i><span>Tersimpan</span>';
        window.setTimeout(() => window.location.assign('dashboard.html'), 900);
    } catch (error) {
        showFeedback(formatAppError(error));
        saveButton.disabled = false;
        saveButton.innerHTML = '<i class="fa-solid fa-coins text-warning"></i><span>Simpan & dapatkan 10 poin</span>';
    }
});

async function boot() {
    if (!plasticCode) {
        window.location.replace('identify.html');
        return;
    }
    if (!isBackendConfigured()) {
        showFeedback(getConfigurationMessage());
        saveButton.disabled = true;
        return;
    }
    try {
        const profile = await requireProfile();
        if (!profile) return;
        renderType(await getPlasticType(plasticCode));
    } catch (error) {
        showFeedback(formatAppError(error));
        saveButton.disabled = true;
    }
}

boot();

