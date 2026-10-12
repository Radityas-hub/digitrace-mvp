let modelPromise;

const LABEL_MAPPINGS = [
    { pattern: /water bottle|bottle|flask/i, candidates: [['PET', 0.78], ['HDPE', 0.16], ['PP', 0.06]] },
    { pattern: /plastic bag|shopping bag|bag/i, candidates: [['LDPE', 0.72], ['PP', 0.16], ['OTHER', 0.12]] },
    { pattern: /cup|mug|bowl|dish|plate|container/i, candidates: [['PP', 0.58], ['PS', 0.24], ['HDPE', 0.18]] },
    { pattern: /packet|wrapper|envelope/i, candidates: [['OTHER', 0.62], ['LDPE', 0.25], ['PP', 0.13]] },
];

async function loadModel() {
    if (!modelPromise) {
        modelPromise = import('https://cdn.jsdelivr.net/npm/@tensorflow-models/mobilenet@2.1.1/+esm')
            .then((mobilenet) => mobilenet.load({ version: 2, alpha: 0.5 }));
    }
    return modelPromise;
}

/**
 * Mengklasifikasikan bentuk objek pada canvas di perangkat pengguna.
 * Canvas dipakai sebagai input model dan tidak dikirim atau disimpan.
 */
export async function identifyWaste(canvas) {
    const model = await loadModel();
    const predictions = await model.classify(canvas, 3);
    const matchingPrediction = predictions.find((prediction) => LABEL_MAPPINGS.some((mapping) => mapping.pattern.test(prediction.className)));

    if (!matchingPrediction) {
        return { predictions, candidates: [] };
    }

    const mapping = LABEL_MAPPINGS.find((item) => item.pattern.test(matchingPrediction.className));
    const multiplier = Math.max(0.45, Math.min(1, matchingPrediction.probability * 1.8));
    return {
        predictions,
        candidates: mapping.candidates.map(([code, confidence]) => ({
            code,
            confidence: Number((confidence * multiplier).toFixed(2)),
        })),
    };
}

