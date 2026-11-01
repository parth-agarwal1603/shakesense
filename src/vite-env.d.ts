/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_MODEL_PATH?: string;
  readonly VITE_MODEL_FORMAT?: 'onnx' | 'tensorflowjs';
  readonly VITE_MODEL_RUNTIME?: 'auto' | 'browser' | 'backend';
  readonly VITE_ML_API_URL?: string;
  readonly VITE_GLOBAL_RF_MODEL_PATH?: string;
  readonly VITE_ISOLATION_FOREST_MODEL_PATH?: string;
  readonly VITE_MEDIAN_MAD_MODEL_PATH?: string;
  readonly VITE_PERSONALIZED_MODEL_PATH?: string;
  readonly VITE_ESP32_MODEL_PATH?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
