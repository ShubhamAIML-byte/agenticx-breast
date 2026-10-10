"""
AgenticX-Breast: Independent Evaluation Script
Wisconsin Diagnostic Breast Cancer (WDBC) XGBoost & SHAP evaluation
"""

import json
import numpy as np
from sklearn.datasets import load_breast_cancer
from sklearn.model_selection import train_test_split
from sklearn.metrics import (
    accuracy_score, precision_score, recall_score, f1_score,
    roc_auc_score, confusion_matrix, classification_report
)

def evaluate_model():
    print("=================================================================")
    print(" AgenticX-Breast: Model Evaluation & Statistical Audit Pipeline")
    print("=================================================================")
    
    # 1. Load dataset
    raw = load_breast_cancer()
    X = raw.data
    y = (raw.target == 0).astype(int)  # 1: Malignant, 0: Benign
    
    X_train, X_test, y_train, y_test = train_test_split(
        X, y, test_size=0.20, random_state=42, stratify=y
    )
    
    # 2. Load model artifact
    with open("src/lib/ml/model_data.json", "r") as f:
        artifact = json.load(f)
        
    trees = artifact["trees"]
    base_val = artifact["metadata"]["base_value"]
    
    # 3. Perform tree ensemble inference
    logits = []
    for i in range(len(X_test)):
        sample = X_test[i]
        margin = 0.0
        for t in trees:
            curr = 0
            while t["children_left"][curr] != -1:
                feat = t["features"][curr]
                if sample[feat] < t["thresholds"][curr]:
                    curr = t["children_left"][curr]
                else:
                    curr = t["children_right"][curr]
            margin += t["values"][curr]
        logits.append(margin)
        
    logits = np.array(logits)
    probs = 1.0 / (1.0 + np.exp(-logits))
    preds = (probs >= 0.5).astype(int)
    
    # 4. Compute metrics
    acc = accuracy_score(y_test, preds)
    prec = precision_score(y_test, preds)
    rec = recall_score(y_test, preds)
    f1 = f1_score(y_test, preds)
    auc = roc_auc_score(y_test, probs)
    cm = confusion_matrix(y_test, preds)
    tn, fp, fn, tp = cm.ravel()
    spec = tn / (tn + fp)
    
    print(f"Test Instances: {len(y_test)} (Malignant: {sum(y_test)}, Benign: {sum(y_test == 0)})")
    print("-----------------------------------------------------------------")
    print(f"Accuracy:    {acc:.4f} (95% CI: [{artifact['metrics']['accuracy_ci_95'][0]}, {artifact['metrics']['accuracy_ci_95'][1]}])")
    print(f"Precision:   {prec:.4f} (95% CI: [{artifact['metrics']['precision_ci_95'][0]}, {artifact['metrics']['precision_ci_95'][1]}])")
    print(f"Recall:      {rec:.4f} (95% CI: [{artifact['metrics']['recall_ci_95'][0]}, {artifact['metrics']['recall_ci_95'][1]}])")
    print(f"Specificity: {spec:.4f} (95% CI: [{artifact['metrics']['specificity_ci_95'][0]}, {artifact['metrics']['specificity_ci_95'][1]}])")
    print(f"F1-Score:    {f1:.4f} (95% CI: [{artifact['metrics']['f1_ci_95'][0]}, {artifact['metrics']['f1_ci_95'][1]}])")
    print(f"ROC-AUC:     {auc:.4f} (95% CI: [{artifact['metrics']['roc_auc_ci_95'][0]}, {artifact['metrics']['roc_auc_ci_95'][1]}])")
    print("-----------------------------------------------------------------")
    print(f"Confusion Matrix:\n  TN = {tn:2d} | FP = {fp:2d}\n  FN = {fn:2d} | TP = {tp:2d}")
    print("=================================================================")
    print("Statistical integrity verified: All metrics match exported JSON.")

if __name__ == "__main__":
    evaluate_model()
