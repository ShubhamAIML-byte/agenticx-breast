import numpy as np
import xgboost as xgb
import shap
from sklearn.datasets import load_breast_cancer
from sklearn.model_selection import train_test_split

# 1. Train model
data = load_breast_cancer()
X = data.data
y = (data.target == 0).astype(int)

X_train, X_test, y_train, y_test = train_test_split(
    X, y, test_size=0.2, random_state=42, stratify=y
)

clf = xgb.XGBClassifier(
    n_estimators=30,
    max_depth=3,
    learning_rate=0.1,
    random_state=42,
    eval_metric="logloss"
)
clf.fit(X_train, y_train)

# Official SHAP
explainer = shap.TreeExplainer(clf)
shap_official = explainer.shap_values(X_test)
base_value = explainer.expected_value

# Pure implementation
def extend_path(feature_indexes, zero_fractions, one_fractions, pweights, unique_depth, zero_fraction, one_fraction, feature_index):
    feature_indexes[unique_depth] = feature_index
    zero_fractions[unique_depth] = zero_fraction
    one_fractions[unique_depth] = one_fraction
    if unique_depth == 0:
        pweights[unique_depth] = 1.0
    else:
        pweights[unique_depth] = 0.0

    for i in range(unique_depth - 1, -1, -1):
        pweights[i + 1] += one_fraction * pweights[i] * (i + 1.0) / (unique_depth + 1.0)
        pweights[i] = zero_fraction * pweights[i] * (unique_depth - i) / (unique_depth + 1.0)

def unwind_path(feature_indexes, zero_fractions, one_fractions, pweights, unique_depth, path_index):
    one_fraction = one_fractions[path_index]
    zero_fraction = zero_fractions[path_index]
    next_one_portion = pweights[unique_depth]

    for i in range(unique_depth - 1, -1, -1):
        if one_fraction != 0.0:
            tmp = pweights[i]
            pweights[i] = next_one_portion * (unique_depth + 1.0) / ((i + 1.0) * one_fraction)
            next_one_portion = tmp - pweights[i] * zero_fraction * (unique_depth - i) / (unique_depth + 1.0)
        else:
            pweights[i] = (pweights[i] * (unique_depth + 1.0)) / (zero_fraction * (unique_depth - i))

    for i in range(path_index, unique_depth):
        feature_indexes[i] = feature_indexes[i + 1]
        zero_fractions[i] = zero_fractions[i + 1]
        one_fractions[i] = one_fractions[i + 1]

def unwound_path_sum(feature_indexes, zero_fractions, one_fractions, pweights, unique_depth, path_index):
    one_fraction = one_fractions[path_index]
    zero_fraction = zero_fractions[path_index]
    next_one_portion = pweights[unique_depth]
    total = 0.0

    for i in range(unique_depth - 1, -1, -1):
        if one_fraction != 0.0:
            tmp = next_one_portion * (unique_depth + 1.0) / ((i + 1.0) * one_fraction)
            total += tmp
            next_one_portion = pweights[i] - tmp * zero_fraction * ((unique_depth - i) / (unique_depth + 1.0))
        else:
            total += (pweights[i] / zero_fraction) / ((unique_depth - i) / (unique_depth + 1.0))

    return total

def tree_shap_rec(
    tree, x, phi, node_index, unique_depth,
    feat_idx, zero_f, one_f, pweights,
    p_zero_f, p_one_f, p_feat_idx,
    condition_fraction
):
    if condition_fraction == 0.0:
        return

    feat_idx = feat_idx.copy()
    zero_f = zero_f.copy()
    one_f = one_f.copy()
    pweights = pweights.copy()

    extend_path(feat_idx, zero_f, one_f, pweights, unique_depth, p_zero_f, p_one_f, p_feat_idx)

    split_feat = tree.features[node_index]

    if tree.children_left[node_index] == -1: # Leaf
        leaf_val = tree.values[node_index][0]
        for i in range(1, unique_depth + 1):
            w = unwound_path_sum(feat_idx, zero_f, one_f, pweights, unique_depth, i)
            phi[feat_idx[i]] += w * (one_f[i] - zero_f[i]) * leaf_val * condition_fraction
    else:
        cleft = tree.children_left[node_index]
        cright = tree.children_right[node_index]
        if x[split_feat] < tree.thresholds[node_index]:
            hot = cleft
            cold = cright
        else:
            hot = cright
            cold = cleft

        w = tree.node_sample_weight[node_index]
        hot_zero_f = tree.node_sample_weight[hot] / w
        cold_zero_f = tree.node_sample_weight[cold] / w
        in_zero_f = 1.0
        in_one_f = 1.0

        path_idx = 0
        while path_idx <= unique_depth:
            if feat_idx[path_idx] == split_feat:
                break
            path_idx += 1

        if path_idx != unique_depth + 1:
            in_zero_f = zero_f[path_idx]
            in_one_f = one_f[path_idx]
            unwind_path(feat_idx, zero_f, one_f, pweights, unique_depth, path_idx)
            unique_depth -= 1

        tree_shap_rec(
            tree, x, phi, hot, unique_depth + 1,
            feat_idx, zero_f, one_f, pweights,
            hot_zero_f * in_zero_f, in_one_f, split_feat,
            condition_fraction
        )

        tree_shap_rec(
            tree, x, phi, cold, unique_depth + 1,
            feat_idx, zero_f, one_f, pweights,
            cold_zero_f * in_zero_f, 0.0, split_feat,
            condition_fraction
        )

# Test on test set sample 0
trees = explainer.model.trees
maxd = max(t.max_depth for t in trees) + 2
s = (maxd * (maxd + 1)) // 2

sample_0 = X_test[0]
phi_pure = np.zeros(30)

for t in trees:
    feat_idx = np.zeros(s, dtype=int)
    zero_f = np.zeros(s)
    one_f = np.zeros(s)
    pweights = np.zeros(s)
    
    # Root call
    tree_shap_rec(
        t, sample_0, phi_pure, 0, 0,
        feat_idx, zero_f, one_f, pweights,
        1.0, 0.0, -1,
        1.0
    )

print("Official SHAP sample 0 (first 5):", shap_official[0][:5])
print("Pure SHAP sample 0     (first 5):", phi_pure[:5])
max_diff = np.max(np.abs(shap_official[0] - phi_pure))
print("Max absolute difference across all 30 features:", max_diff)
assert max_diff < 1e-5, f"Difference too high: {max_diff}"
print("SUCCESS! Pure TreeSHAP matches official SHAP to machine precision!")
