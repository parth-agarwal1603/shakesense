import * as tf from '@tensorflow/tfjs';
import * as ort from 'onnxruntime-web';
import { Machine } from '../types';

export type ModelInferenceStatus = 'disabled' | 'ready' | 'loading' | 'error';
export type BrowserModelFormat = 'onnx' | 'tensorflowjs';
type ModelRuntime = 'browser' | 'backend';

export type NativeModelId =
  | 'globalRandomForest'
  | 'isolationForest'
  | 'medianMad'
  | 'personalized'
  | 'esp32Embedded';

export interface NativeModelArtifact {
  id: NativeModelId;
  path: string;
  format: 'pickle' | 'firmware';
  featureColumns: string[];
}

export interface ModelResult {
  score?: number;
  label?: string;
  isAnomaly?: boolean;
}

export interface ModelPrediction {
  machineId: string;
  healthStatus?: Machine['healthStatus'];
  recommendation?: {
    title: string;
    description: string;
    confidence: number;
    actionRequired: boolean;
    severity: 'nominal' | 'advisory' | 'urgent';
  };
  score?: number;
  label?: string;
  modelVersion?: string;
  models?: Partial<Record<NativeModelId, ModelResult>>;
}

interface ModelRequestMachine {
  id: string;
  features: number[];
  modelFeatures: {
    mean: number;
    rms: number;
    peak_to_peak: number;
    kurtosis: number;
    crest_factor: number;
    temperature_c: number;
  };
}

const modelPath = import.meta.env.VITE_MODEL_PATH?.trim() || '/model';
const modelApiUrl = import.meta.env.VITE_ML_API_URL?.trim() || 'http://localhost:8000/predict';
const configuredFormat = import.meta.env.VITE_MODEL_FORMAT?.trim().toLowerCase();
const configuredRuntime = import.meta.env.VITE_MODEL_RUNTIME?.trim().toLowerCase();
const nativeModelArtifacts: NativeModelArtifact[] = [
  {
    id: 'globalRandomForest',
    path: import.meta.env.VITE_GLOBAL_RF_MODEL_PATH?.trim() || 'global_models/shakesense_global_rf.pkl',
    format: 'pickle',
    featureColumns: ['mean', 'rms', 'peak_to_peak', 'kurtosis', 'crest_factor'],
  },
  {
    id: 'isolationForest',
    path:
      import.meta.env.VITE_ISOLATION_FOREST_MODEL_PATH?.trim() ||
      'global_models/shakesense_isolation_forest.pkl',
    format: 'pickle',
    featureColumns: ['mean', 'rms', 'peak_to_peak', 'kurtosis', 'crest_factor'],
  },
  {
    id: 'medianMad',
    path: import.meta.env.VITE_MEDIAN_MAD_MODEL_PATH?.trim() || 'global_models/shakesense_median_mad.pkl',
    format: 'pickle',
    featureColumns: ['mean', 'rms', 'peak_to_peak', 'kurtosis', 'crest_factor'],
  },
  {
    id: 'esp32Embedded',
    path: import.meta.env.VITE_ESP32_MODEL_PATH?.trim() || 'global_models/esp32-model/ShakeSense_ESP32.ino',
    format: 'firmware',
    featureColumns: ['mean', 'rms', 'peak_to_peak', 'kurtosis', 'crest_factor', 'temperature_c'],
  },
];
const personalizedModelPath = import.meta.env.VITE_PERSONALIZED_MODEL_PATH?.trim();
if (personalizedModelPath) {
  nativeModelArtifacts.push({
    id: 'personalized',
    path: personalizedModelPath,
    format: 'pickle',
    featureColumns: ['mean', 'rms', 'peak_to_peak', 'kurtosis', 'crest_factor', 'temperature_c'],
  });
}
const modelFormat: BrowserModelFormat | null =
  configuredFormat === 'tensorflowjs' || modelPath.endsWith('model.json')
    ? 'tensorflowjs'
    : configuredFormat === 'onnx' || modelPath.endsWith('.onnx')
    ? 'onnx'
    : null;
const modelRuntime: ModelRuntime =
  configuredRuntime === 'browser' || (configuredRuntime !== 'backend' && modelFormat)
    ? 'browser'
    : 'backend';

export const isModelConfigured =
  modelRuntime === 'browser' ? Boolean(modelFormat && modelPath) : Boolean(modelApiUrl);

export const checkModelHealth = async (): Promise<void> => {
  if (modelRuntime === 'browser') return;
  if (!modelApiUrl) throw new Error('ML backend URL is not configured.');

  const healthUrl = modelApiUrl.replace(/\/predict\/?$/, '/health');
  const response = await fetch(healthUrl);
  if (!response.ok) {
    throw new Error(`ML backend health check returned HTTP ${response.status}`);
  }
};

let onnxSession: ort.InferenceSession | null = null;
let tensorflowModel: tf.LayersModel | tf.GraphModel | null = null;

const toRequestMachine = (machine: Machine): ModelRequestMachine => {
  const axes = [machine.vibration.x, machine.vibration.y, machine.vibration.z];
  const mean = axes.reduce((sum, value) => sum + value, 0) / axes.length;
  const rms = Math.sqrt(axes.reduce((sum, value) => sum + value ** 2, 0) / axes.length);
  const peakToPeak = Math.max(...axes) - Math.min(...axes);
  const crestFactor = rms === 0 ? 0 : Math.max(...axes.map((value) => Math.abs(value))) / rms;

  return {
    id: machine.id,
    features: [
      machine.vibration.overall,
      machine.vibration.x,
      machine.vibration.y,
      machine.vibration.z,
      machine.temperature.core,
      machine.temperature.ambient,
      machine.edge.sampleRateHz,
    ],
    modelFeatures: {
      mean,
      rms,
      peak_to_peak: peakToPeak,
      kurtosis: 3,
      crest_factor: crestFactor,
      temperature_c: machine.temperature.core,
    },
  };
};

const toPrediction = (machineId: string, output: number[]): ModelPrediction => ({
  machineId,
  score: output[0],
  label: output[1] === 2 ? 'critical' : output[1] === 1 ? 'warning' : 'healthy',
});

const loadOnnxSession = async (): Promise<ort.InferenceSession> => {
  if (!onnxSession) {
    onnxSession = await ort.InferenceSession.create(modelPath);
  }
  return onnxSession;
};

const loadTensorflowModel = async (): Promise<tf.LayersModel | tf.GraphModel> => {
  if (!tensorflowModel) {
    const url = modelPath.endsWith('model.json') ? modelPath : `${modelPath}/model.json`;
    try {
      tensorflowModel = await tf.loadLayersModel(url);
    } catch {
      tensorflowModel = await tf.loadGraphModel(url);
    }
  }
  return tensorflowModel;
};

const runOnnxInference = async (machines: ModelRequestMachine[]): Promise<ModelPrediction[]> => {
  const session = await loadOnnxSession();
  const inputName = session.inputNames[0];
  if (!inputName) {
    throw new Error('ONNX model has no input tensor.');
  }

  const input = new ort.Tensor('float32', Float32Array.from(machines.flatMap((machine) => machine.features)), [
    machines.length,
    machines[0]?.features.length || 0,
  ]);
  const output = await session.run({ [inputName]: input });
  const outputTensor = output[session.outputNames[0]];
  if (!outputTensor || !Array.isArray(outputTensor.dims) || outputTensor.dims.length < 2) {
    throw new Error('ONNX model output must be a 2D numeric tensor.');
  }

  const values = Array.from(outputTensor.data as Float32Array);
  const columns = outputTensor.dims[1];
  return machines.map((machine, index) =>
    toPrediction(machine.id, values.slice(index * columns, (index + 1) * columns)),
  );
};

const runTensorflowInference = async (machines: ModelRequestMachine[]): Promise<ModelPrediction[]> => {
  const model = await loadTensorflowModel();
  const input = tf.tensor2d(machines.map((machine) => machine.features));
  const rawOutput = model.predict(input);
  const output = Array.isArray(rawOutput) ? rawOutput[0] : rawOutput;
  const values = await (output as tf.Tensor).array() as number[][];
  input.dispose();
  (output as tf.Tensor).dispose();

  return machines.map((machine, index) => toPrediction(machine.id, values[index] || []));
};

const isPredictionResponse = (value: unknown): value is { predictions: ModelPrediction[] } =>
  Boolean(value) &&
  typeof value === 'object' &&
  Array.isArray((value as { predictions?: unknown }).predictions) &&
  (value as { predictions: unknown[] }).predictions.every(
    (prediction) => Boolean(prediction) && typeof prediction === 'object' && typeof (prediction as ModelPrediction).machineId === 'string',
  );

const runBackendInference = async (machines: ModelRequestMachine[]): Promise<ModelPrediction[]> => {
  if (!modelApiUrl) {
    throw new Error(
      `The model format is not browser-compatible. Set VITE_ML_API_URL for ${modelPath} or export the model to ONNX/TensorFlow.js.`,
    );
  }

  const response = await fetch(modelApiUrl, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      modelPath,
      modelFormat: configuredFormat || 'unknown',
      models: nativeModelArtifacts,
      timestamp: new Date().toISOString(),
      machines,
    }),
  });

  if (!response.ok) {
    throw new Error(`ML backend returned HTTP ${response.status}`);
  }

  const data: unknown = await response.json();
  if (!isPredictionResponse(data)) {
    throw new Error('ML backend returned an invalid response. Expected { predictions: [...] }.');
  }

  return data.predictions;
};

export const runModelInference = async (machines: Machine[]): Promise<ModelPrediction[]> => {
  const requestMachines = machines
    .filter((machine) => machine.connectionStatus !== 'disconnected')
    .map(toRequestMachine);

  if (!requestMachines.length) {
    return [];
  }

  if (modelRuntime === 'backend') {
    return runBackendInference(requestMachines);
  }

  if (modelFormat === 'tensorflowjs') {
    return runTensorflowInference(requestMachines);
  }

  if (modelFormat !== 'onnx') {
    throw new Error(
      `Unsupported browser model "${modelPath}". Use an .onnx or TensorFlow.js model, or configure VITE_ML_API_URL.`,
    );
  }

  return runOnnxInference(requestMachines);
};
