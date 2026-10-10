import json
import os
import numpy as np
import pandas as pd
import xgboost as xgb
import shap
from sklearn.datasets import load_breast_cancer
from sklearn.model_selection import train_test_split
from sklearn.metrics import (
    accuracy_score,
    precision_score,
    recall_score,
    f1_score,
    roc_auc_score,
    confusion_matrix,
    roc_curve,
    precision_recall_curve,
    brier_score_loss,
)
from sklearn.calibration import calibration_curve

# Set random seed
SEED = 42
np.random.seed(SEED)

print("--- 1. Loading WDBC Dataset ---")
raw_data = load_breast_cancer()
# scikit-learn standard: target 0 is malignant, 1 is benign
# In oncology classification, Malignant is positive (1), Benign is negative (0)
X = raw_data.data
y = (raw_data.target == 0).astype(int)
feature_names = [name.replace(" ", "_") for name in raw_data.feature_names]

print(f"Total instances: {X.shape[0]}, Features: {X.shape[1]}")
print(f"Malignant (1): {int(np.sum(y))}, Benign (0): {int(np.sum(y == 0))}")

# Stratified split 80/20
X_train, X_test, y_train, y_test = train_test_split(
    X, y, test_size=0.20, random_state=SEED, stratify=y
)
print(f"Train samples: {X_train.shape[0]}, Test samples: {X_test.shape[0]}")
print(f"Train Malignant: {int(np.sum(y_train))}, Train Benign: {int(np.sum(y_train == 0))}")
print(f"Test Malignant: {int(np.sum(y_test))}, Test Benign: {int(np.sum(y_test == 0))}")

# Compute training set feature statistics (prevent leakage by using ONLY training data for stats)
feature_stats = {}
for i, feat in enumerate(feature_names):
    feat_train = X_train[:, i]
    feat_mal = X_train[y_train == 1, i]
    feat_ben = X_train[y_train == 0, i]
    
    feature_stats[feat] = {
        "index": i,
        "name": feat,
        "overall": {
            "mean": float(np.mean(feat_train)),
            "std": float(np.std(feat_train)),
            "min": float(np.min(feat_train)),
            "max": float(np.max(feat_train)),
            "median": float(np.median(feat_train)),
            "q25": float(np.percentile(feat_train, 25)),
            "q75": float(np.percentile(feat_train, 75)),
        },
        "malignant": {
            "mean": float(np.mean(feat_mal)),
            "std": float(np.std(feat_mal)),
            "min": float(np.min(feat_mal)),
            "max": float(np.max(feat_mal)),
            "median": float(np.median(feat_mal)),
        },
        "benign": {
            "mean": float(np.mean(feat_ben)),
            "std": float(np.std(feat_ben)),
            "min": float(np.min(feat_ben)),
            "max": float(np.max(feat_ben)),
            "median": float(np.median(feat_ben)),
        }
    }

print("--- 2. Training XGBoost Classifier ---")
clf = xgb.XGBClassifier(
    n_estimators=45,
    max_depth=3,
    learning_rate=0.08,
    subsample=0.85,
    colsample_bytree=0.85,
    random_state=SEED,
    eval_metric="logloss"
)
clf.fit(X_train, y_train)

# Evaluate on test set
y_pred_proba = clf.predict_proba(X_test)[:, 1]
y_pred = (y_pred_proba >= 0.5).astype(int)

# Metrics
acc = accuracy_score(y_test, y_pred)
prec = precision_score(y_test, y_pred)
rec = recall_score(y_test, y_pred)
f1 = f1_score(y_test, y_pred)
auc = roc_auc_score(y_test, y_pred_proba)
cm = confusion_matrix(y_test, y_pred)
tn, fp, fn, tp = cm.ravel()
spec = tn / (tn + fp)
brier = brier_score_loss(y_test, y_pred_proba)

print(f"Accuracy:  {acc:.4f}")
print(f"Precision: {prec:.4f}")
print(f"Recall:    {rec:.4f}")
print(f"Specificity: {spec:.4f}")
print(f"F1-score:  {f1:.4f}")
print(f"ROC-AUC:   {auc:.4f}")
print(f"Confusion Matrix: TN={tn}, FP={fp}, FN={fn}, TP={tp}")
print(f"Brier Score: {brier:.4f}")

# 95% Wilson Score Confidence Interval for proportions
def wilson_score_ci(p, n, z=1.96):
    denominator = 1 + z**2 / n
    centre = (p + z**2 / (2 * n)) / denominator
    spread = z * np.sqrt((p * (1 - p) + z**2 / (4 * n)) / n) / denominator
    return float(max(0.0, centre - spread)), float(min(1.0, centre + spread))

acc_ci = wilson_score_ci(acc, len(y_test))
prec_ci = wilson_score_ci(prec, tp + fp)
rec_ci = wilson_score_ci(rec, tp + fn)
spec_ci = wilson_score_ci(spec, tn + fp)

# Bootstrap 95% CI for ROC-AUC and F1 (1000 iterations)
n_bootstraps = 1000
boot_aucs = []
boot_f1s = []
rng = np.random.RandomState(SEED)
for _ in range(n_bootstraps):
    indices = rng.choice(len(y_test), len(y_test), replace=True)
    if len(np.unique(y_test[indices])) < 2:
        continue
    boot_aucs.append(roc_auc_score(y_test[indices], y_pred_proba[indices]))
    boot_f1s.append(f1_score(y_test[indices], (y_pred_proba[indices] >= 0.5).astype(int)))

auc_ci = (float(np.percentile(boot_aucs, 2.5)), float(np.percentile(boot_aucs, 97.5)))
f1_ci = (float(np.percentile(boot_f1s, 2.5)), float(np.percentile(boot_f1s, 97.5)))

print(f"95% CI Accuracy: [{acc_ci[0]:.4f}, {acc_ci[1]:.4f}]")
print(f"95% CI Precision: [{prec_ci[0]:.4f}, {prec_ci[1]:.4f}]")
print(f"95% CI Recall: [{rec_ci[0]:.4f}, {rec_ci[1]:.4f}]")
print(f"95% CI F1: [{f1_ci[0]:.4f}, {f1_ci[1]:.4f}]")
print(f"95% CI AUC: [{auc_ci[0]:.4f}, {auc_ci[1]:.4f}]")

# ROC Curve points
fpr, tpr, thresholds = roc_curve(y_test, y_pred_proba)
# Downsample to ~25 points for neat rendering
step = max(1, len(fpr) // 25)
roc_curve_data = []
for f, t, th in zip(fpr[::step], tpr[::step], thresholds[::step]):
    th_val = 1.0 if np.isinf(th) else float(th)
    roc_curve_data.append({
        "fpr": round(float(f), 4),
        "tpr": round(float(t), 4),
        "threshold": round(th_val, 4)
    })
# Ensure (0,0) and (1,1) are included
if roc_curve_data[0]["fpr"] != 0.0 or roc_curve_data[0]["tpr"] != 0.0:
    roc_curve_data.insert(0, {"fpr": 0.0, "tpr": 0.0, "threshold": 1.0})
if roc_curve_data[-1]["fpr"] != 1.0 or roc_curve_data[-1]["tpr"] != 1.0:
    roc_curve_data.append({"fpr": 1.0, "tpr": 1.0, "threshold": 0.0})

# Precision-Recall Curve points
prec_curve, rec_curve, pr_thresholds = precision_recall_curve(y_test, y_pred_proba)
pr_step = max(1, len(prec_curve) // 25)
pr_curve_data = [
    {"recall": round(float(r), 4), "precision": round(float(p), 4)}
    for r, p in zip(rec_curve[::pr_step], prec_curve[::pr_step])
]

# Calibration Curve (5 bins)
prob_true, prob_pred = calibration_curve(y_test, y_pred_proba, n_bins=5, strategy="uniform")
calibration_data = [
    {"bin": i + 1, "predicted": round(float(p), 4), "empirical": round(float(t), 4)}
    for i, (p, t) in enumerate(zip(prob_pred, prob_true))
]

print("--- 3. Genuine SHAP Computation ---")
explainer = shap.TreeExplainer(clf)
shap_test_values = explainer.shap_values(X_test)
base_value = float(explainer.expected_value)

# Global feature importance (mean absolute SHAP across test set)
mean_abs_shap = np.mean(np.abs(shap_test_values), axis=0)
sorted_indices = np.argsort(mean_abs_shap)[::-1]
global_importance = [
    {
        "rank": rank + 1,
        "feature": feature_names[idx],
        "index": int(idx),
        "mean_abs_shap": round(float(mean_abs_shap[idx]), 5),
        "direction_summary": "risk-increasing when high" if np.corrcoef(X_test[:, idx], shap_test_values[:, idx])[0, 1] > 0 else "risk-decreasing when high"
    }
    for rank, idx in enumerate(sorted_indices)
]

print("Top 5 Global Features by Mean |SHAP|:")
for item in global_importance[:5]:
    print(f"  {item['rank']}. {item['feature']}: {item['mean_abs_shap']}")

# Export Tree Ensemble for pure TypeScript Lundberg TreeSHAP engine
booster = clf.get_booster()
trees = explainer.model.trees
exported_trees = []

for t_idx, t in enumerate(trees):
    tree_dict = {
        "tree_index": t_idx,
        "max_depth": int(t.max_depth),
        "children_left": t.children_left.tolist(),
        "children_right": t.children_right.tolist(),
        "children_default": t.children_default.tolist() if hasattr(t, "children_default") else t.children_left.tolist(),
        "features": t.features.tolist(),
        "thresholds": [round(float(th), 6) for th in t.thresholds],
        "values": [round(float(v[0]), 6) for v in t.values],
        "node_sample_weight": [round(float(w), 4) for w in t.node_sample_weight],
    }
    exported_trees.append(tree_dict)

print(f"Exported {len(exported_trees)} trees for TypeScript Lundberg TreeSHAP engine.")

# Find representative preset patient cases in the test set
# 1. Clear Malignant (high probability)
mal_indices = np.where((y_test == 1) & (y_pred_proba > 0.95))[0]
preset_mal_idx = int(mal_indices[0])

# 2. Clear Benign (low probability)
ben_indices = np.where((y_test == 0) & (y_pred_proba < 0.05))[0]
preset_ben_idx = int(ben_indices[0])

# 3. Borderline Case (probability between 0.35 and 0.65)
border_indices = np.where((y_pred_proba >= 0.30) & (y_pred_proba <= 0.70))[0]
if len(border_indices) > 0:
    preset_border_idx = int(border_indices[0])
else:
    # Closest to 0.5
    preset_border_idx = int(np.argmin(np.abs(y_pred_proba - 0.5)))

# 4. Another benign case
preset_ben2_idx = int(ben_indices[1]) if len(ben_indices) > 1 else int(ben_indices[0])

def build_preset(sample_idx, case_id, name, clinical_note):
    x_val = X_test[sample_idx]
    y_true = int(y_test[sample_idx])
    prob = float(y_pred_proba[sample_idx])
    shap_val = shap_test_values[sample_idx]
    
    top_pos = np.argsort(shap_val)[::-1][:3]
    top_neg = np.argsort(shap_val)[:3]
    
    features_obj = {feature_names[i]: round(float(x_val[i]), 5) for i in range(len(feature_names))}
    
    return {
        "id": case_id,
        "name": name,
        "clinical_note": clinical_note,
        "true_label": "Malignant" if y_true == 1 else "Benign",
        "true_label_numeric": y_true,
        "predicted_probability": round(prob, 4),
        "predicted_label": "Malignant" if prob >= 0.5 else "Benign",
        "features": features_obj,
        "shap_contributions": [
            {
                "feature": feature_names[i],
                "feature_value": round(float(x_val[i]), 4),
                "shap_value": round(float(shap_val[i]), 5),
                "impact": "Increases Risk" if shap_val[i] > 0 else "Decreases Risk"
            }
            for i in range(len(feature_names))
        ]
    }

presets = [
    build_preset(
        preset_mal_idx,
        "case_malignant",
        "Patient Case A: High-Risk Infiltrating Ductal Carcinoma Profile",
        "Fine-needle aspirate showing high nuclear pleomorphism, marked chromatin irregularity, and prominent concavity margins."
    ),
    build_preset(
        preset_ben_idx,
        "case_benign",
        "Patient Case B: Typical Benign Fibroadenoma Profile",
        "FNA showing regular cohesive sheets, uniform nuclear diameter, intact myoepithelial cells, and minimal contour variations."
    ),
    build_preset(
        preset_border_idx,
        "case_borderline",
        "Patient Case C: Atypical / Borderline Diagnostic Dilemma",
        "Intermediate nuclear enlargement with focal margin indentations; borderline risk requiring multidisciplinary correlation."
    ),
    build_preset(
        preset_ben2_idx,
        "case_benign_cyst",
        "Patient Case D: Typical Benign Cystic / Fibrocystic Change",
        "FNA demonstrating cohesive regular cells, low area/perimeter worst, and smooth contours consistent with fibrocystic change."
    ),
]

output_payload = {
    "metadata": {
        "project_name": "AgenticX-Breast",
        "dataset": "Wisconsin Diagnostic Breast Cancer (WDBC)",
        "model_type": "XGBoost Classifier",
        "train_samples": int(X_train.shape[0]),
        "test_samples": int(X_test.shape[0]),
        "features_count": len(feature_names),
        "base_value": round(base_value, 5),
        "random_seed": SEED,
    },
    "feature_names": feature_names,
    "feature_stats": feature_stats,
    "metrics": {
        "accuracy": round(float(acc), 4),
        "accuracy_ci_95": [round(acc_ci[0], 4), round(acc_ci[1], 4)],
        "precision": round(float(prec), 4),
        "precision_ci_95": [round(prec_ci[0], 4), round(prec_ci[1], 4)],
        "recall": round(float(rec), 4),
        "recall_ci_95": [round(rec_ci[0], 4), round(rec_ci[1], 4)],
        "specificity": round(float(spec), 4),
        "specificity_ci_95": [round(spec_ci[0], 4), round(spec_ci[1], 4)],
        "f1_score": round(float(f1), 4),
        "f1_ci_95": [round(f1_ci[0], 4), round(f1_ci[1], 4)],
        "roc_auc": round(float(auc), 4),
        "roc_auc_ci_95": [round(auc_ci[0], 4), round(auc_ci[1], 4)],
        "brier_score": round(float(brier), 4),
        "confusion_matrix": {
            "tn": int(tn),
            "fp": int(fp),
            "fn": int(fn),
            "tp": int(tp),
        }
    },
    "roc_curve": roc_curve_data,
    "pr_curve": pr_curve_data,
    "calibration_curve": calibration_data,
    "global_importance": global_importance,
    "presets": presets,
    "trees": exported_trees
}

os.makedirs("output_artifacts", exist_ok=True)
with open("output_artifacts/model_and_metrics.json", "w") as f:
    json.dump(output_payload, f, indent=2)

print("Exported output_artifacts/model_and_metrics.json successfully!")
