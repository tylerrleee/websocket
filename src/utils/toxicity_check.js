// import '@tensorflow/tfjs-node';
import * as toxicity from '@tensorflow-models/toxicity';

const threshold = 0.9;
let toxicityModel = null;

toxicity.load(threshold).then(model => {
    toxicityModel = model;
    console.log('Toxicity model loaded and ready.');
}).catch(err => {
    console.error('Failed to load toxicity model:', err);
});

export async function isToxic(message) {
    if (!toxicityModel) {
        console.warn('Toxicity model not yet loaded - allowing message through.');
        return false;
    }

    const predictions = await toxicityModel.classify([message]);

    return predictions.some(prediction => prediction.results[0].match === true);
}