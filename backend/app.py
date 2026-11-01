from __future__ import annotations

import os
from pathlib import Path
from typing import Any

import joblib
import numpy as np
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field


ROOT = Path(__file__).resolve().parents[1]
GLOBAL_MODEL_PATHS = {
    "globalRandomForest": os.getenv(
        "SHAKESENSE_GLOBAL_RF_MODEL_PATH",
        str(ROOT / "global_models" / "shakesense_global_rf.pkl"),
    ),
    "isolationForest": os.getenv(
        "SHAKESENSE_ISOLATION_FOREST_MODEL_PATH",
        str(ROOT / "global_models" / "shakesense_isolation_forest.pkl"),
    ),
    "medianMad": os.getenv(
        "SHAKESENSE_MEDIAN_MAD_MODEL_PATH",
        str(ROOT / "global_models" / "shakesense_median_mad.pkl"),
    ),
}
PERSONALIZED_MODEL_PATH = os.getenv("SHAKESENSE_PERSONALIZED_MODEL_PATH", "")
ESP32_FIRMWARE_PATH = os.getenv(
    "SHAKESENSE_ESP32_MODEL_PATH",
    str(ROOT / "global_models" / "esp32-model" / "ShakeSense_ESP32" / "ShakeSense_ESP32.ino"),
)


class ModelFeatures(BaseModel):
    mean: float
    rms: float
    peak_to_peak: float
    kurtosis: float
    crest_factor: float
    temperature_c: float


class MachineInput(BaseModel):
    id: str = Field(min_length=1)
    features: list[float] = Field(min_length=7, max_length=7)
    modelFeatures: ModelFeatures


class PredictionRequest(BaseModel):
    machines: list[MachineInput] = Field(min_length=1)
    models: list[dict[str, Any]] = Field(default_factory=list)


app = FastAPI(title="ShakeSense ML Inference API", version="1.0.0")
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000", "http://localhost:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

_loaded_models: dict[str, Any] = {}


def _load_model(model_id: str) -> Any:
    if model_id in _loaded_models:
        return _loaded_models[model_id]

    path = PERSONALIZED_MODEL_PATH if model_id == "personalized" else GLOBAL_MODEL_PATHS.get(model_id, "")
    if not path:
        raise HTTPException(status_code=500, detail=f"No path configured for model '{model_id}'.")
    model_path = Path(path).expanduser().resolve()
    if not model_path.is_file():
        raise HTTPException(status_code=503, detail=f"Model file not found: {model_path}")

    try:
        loaded = joblib.load(model_path)
    except Exception as error:
        raise HTTPException(status_code=500, detail=f"Unable to load {model_id}: {error}") from error
    _loaded_models[model_id] = loaded
    return loaded


def _feature_matrix(machines: list[MachineInput]) -> np.ndarray:
    return np.asarray(
        [
            [
                machine.modelFeatures.mean,
                machine.modelFeatures.rms,
                machine.modelFeatures.peak_to_peak,
                machine.modelFeatures.kurtosis,
                machine.modelFeatures.crest_factor,
            ]
            for machine in machines
        ],
        dtype=float,
    )


def _global_random_forest(machines: list[MachineInput]) -> list[dict[str, Any]]:
    artifact = _load_model("globalRandomForest")
    model = artifact["model"]
    values = _feature_matrix(machines)
    labels = model.predict(values)
    probabilities = model.predict_proba(values) if hasattr(model, "predict_proba") else None
    results = []
    for index, label in enumerate(labels):
        score = float(np.max(probabilities[index])) if probabilities is not None else None
        results.append({"label": str(label), "score": score})
    return results


def _isolation_forest(machines: list[MachineInput]) -> list[dict[str, Any]]:
    artifact = _load_model("isolationForest")
    scores = artifact["model"].decision_function(_feature_matrix(machines))
    threshold = float(artifact["threshold"])
    return [
        {
            "score": float(score),
            "isAnomaly": bool(score < threshold),
            "label": "abnormal" if score < threshold else "normal",
        }
        for score in scores
    ]


def _median_mad(machines: list[MachineInput]) -> list[dict[str, Any]]:
    artifact = _load_model("medianMad")
    values = _feature_matrix(machines)
    medians = np.asarray([artifact["medians"][name] for name in artifact["feature_names"]], dtype=float)
    mads = np.asarray([artifact["mads"][name] for name in artifact["feature_names"]], dtype=float)
    robust_z = np.max(np.abs((values - medians) / mads * float(artifact["robust_z_constant"])), axis=1)
    threshold = float(artifact["threshold"])
    return [
        {
            "score": float(value),
            "isAnomaly": bool(value > threshold),
            "label": "abnormal" if value > threshold else "normal",
        }
        for value in robust_z
    ]


def _personalized(machines: list[MachineInput]) -> list[dict[str, Any]]:
    artifact = _load_model("personalized")
    feature_names = artifact["feature_columns"]
    values = np.asarray(
        [[getattr(machine.modelFeatures, name) for name in feature_names] for machine in machines],
        dtype=float,
    )
    scores = artifact["model"].decision_function(artifact["scaler"].transform(values))
    threshold = float(artifact["threshold"])
    return [
        {
            "score": float(score),
            "isAnomaly": bool(score < threshold),
            "label": "abnormal" if score < threshold else "normal",
        }
        for score in scores
    ]


def _esp32_embedded(machines: list[MachineInput], median_mad_results: list[dict[str, Any]]) -> list[dict[str, Any]]:
    """Represent the same six-feature detector compiled into the ESP32 firmware."""
    return [
        {
            **result,
            "label": "ABNORMAL" if result["isAnomaly"] else "NORMAL",
            "firmware": Path(ESP32_FIRMWARE_PATH).name,
        }
        for result in median_mad_results
    ]


@app.get("/health")
def health() -> dict[str, Any]:
    return {
        "status": "ok",
        "models": {
            model_id: Path(path).expanduser().is_file()
            for model_id, path in GLOBAL_MODEL_PATHS.items()
        }
        | {
            "personalized": bool(
                PERSONALIZED_MODEL_PATH and Path(PERSONALIZED_MODEL_PATH).expanduser().is_file()
            ),
            "esp32Embedded": Path(ESP32_FIRMWARE_PATH).expanduser().is_file(),
        },
    }


@app.post("/predict")
def predict(request: PredictionRequest) -> dict[str, list[dict[str, Any]]]:
    try:
        results = {
            "globalRandomForest": _global_random_forest(request.machines),
            "isolationForest": _isolation_forest(request.machines),
            "medianMad": _median_mad(request.machines),
        }
        results["esp32Embedded"] = _esp32_embedded(request.machines, results["medianMad"])
        if PERSONALIZED_MODEL_PATH:
            results["personalized"] = _personalized(request.machines)
    except HTTPException:
        raise
    except Exception as error:
        raise HTTPException(status_code=500, detail=f"Inference failed: {error}") from error

    predictions = []
    for index, machine in enumerate(request.machines):
        rf = results["globalRandomForest"][index]
        predictions.append(
            {
                "machineId": machine.id,
                "label": str(rf["label"]).lower(),
                "score": rf["score"],
                "models": {
                    model_id: model_results[index]
                    for model_id, model_results in results.items()
                },
            }
        )
    return {"predictions": predictions}
