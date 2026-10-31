/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_MODEL_PATH?: string;
  readonly VITE_MODEL_FORMAT?: 'onnx' | 'tensorflowjs';
  readonly VITE_MODEL_RUNTIME?: 'auto' | 'browser' | 'backend';
  readonly VITE_ML_API_URL?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
