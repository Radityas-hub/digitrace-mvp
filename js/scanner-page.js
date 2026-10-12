import { getConfigurationMessage, isBackendConfigured } from './config.js';
import { requireProfile } from './auth.js';
import { formatAppError } from './app-shell.js';
import { identifyWaste } from './waste-classifier.js';

const video = document.getElementById('cameraStream');
const fallback = document.getElementById('cameraFallback');
const button = document.getElementById('scanBtn');
const buttonText = document.getElementById('btnText');
const instruction = document.getElementById('scanInstruction');
const feedback = document.getElementById('scanFeedback');
let stream;

function showFeedback(message, type = 'error') {
    feedback.textContent = message;
    feedback.className = `rounded-2xl border px-4 py-3 text-xs font-medium ${type === 'error' ? 'border-red-100 bg-red-50 text-red-600' : 'border-eco/20 bg-ecoLight text-eco'}`;
}

function stopCamera() {
    if (stream) {
        stream.getTracks().forEach((track) => track.stop());
        stream = null;
    }
}

async function setupCamera() {
    try {
        stream = await navigator.mediaDevices.getUserMedia({
            video: { facingMode: { ideal: 'environment' } },
            audio: false,
        });
        video.srcObject = stream;
        video.addEventListener('loadeddata', () => {
            video.classList.remove('hidden');
            fallback.classList.add('hidden');
        }, { once: true });
    } catch (error) {
        fallback.querySelector('i').className = 'fa-solid fa-video-slash text-4xl text-gray-600';
        fallback.querySelector('span').textContent = 'Kamera tidak tersedia. Kamu tetap dapat memilih jenis sampah secara manual.';
        instruction.textContent = 'Izinkan akses kamera atau gunakan pilihan manual.';
    }
}

function captureFrame() {
    if (!video.videoWidth || !video.videoHeight) return null;

    const canvas = document.createElement('canvas');
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    canvas.getContext('2d').drawImage(video, 0, 0, canvas.width, canvas.height);

    return canvas;
}

button.addEventListener('click', async () => {
    button.disabled = true;
    button.classList.add('opacity-70');
    buttonText.textContent = 'MENGANALISIS BENTUK...';
    instruction.textContent = 'Menganalisis objek secara lokal di perangkatmu...';

    const canvas = captureFrame();
    let result = { candidates: [] };
    if (canvas) {
        try {
            result = await identifyWaste(canvas);
        } catch (error) {
            // Model dapat gagal dimuat pada jaringan lemah. Pilihan manual
            // tetap menjadi alur utama yang dapat digunakan.
            showFeedback('Identifikasi otomatis belum tersedia. Pilih jenis plastik secara manual.');
        } finally {
            // Frame langsung dibuang setelah inferensi. Tidak disimpan di
            // localStorage, sessionStorage, database, atau storage berkas.
            canvas.width = 0;
            canvas.height = 0;
        }
    }
    stopCamera();

    if (!canvas) {
        instruction.textContent = 'Kamera belum siap. Lanjutkan dengan pemilihan jenis secara manual.';
    }
    const params = new URLSearchParams();
    if (result.candidates.length) {
        params.set('candidates', result.candidates.map((candidate) => `${candidate.code}:${candidate.confidence}`).join(','));
        params.set('source', 'vision');
    }
    window.setTimeout(() => window.location.assign(`identify.html${params.size ? `?${params.toString()}` : ''}`), 350);
});

window.addEventListener('pagehide', stopCamera);

async function boot() {
    if (!isBackendConfigured()) {
        showFeedback(getConfigurationMessage());
        button.disabled = true;
        return;
    }

    try {
        const profile = await requireProfile();
        if (!profile) return;
        await setupCamera();
    } catch (error) {
        showFeedback(formatAppError(error));
    }
}

boot();

