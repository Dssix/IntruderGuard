import pandas as pd
import joblib

# Load model and scaler
model = joblib.load("data/decision_tree_model.pkl")
scaler = joblib.load("data/scaler.pkl")

# Load live data
live_data = pd.read_csv("data/live_data.csv")

# Drop irrelevant columns
columns_to_drop = [
    'wrong_fragment', 'urgent', 'hot', 'num_failed_logins', 'logged_in', 'num_compromised',
    'root_shell', 'su_attempted', 'num_root', 'num_file_creations', 'num_shells',
    'num_access_files', 'num_outbound_cmds', 'is_host_login', 'is_guest_login', 'class'
]
live_data = live_data.drop(columns=[col for col in columns_to_drop if col in live_data.columns], errors='ignore')

# Keep only meaningful traffic
live_data = live_data[(live_data['src_bytes'] > 0) | (live_data['dst_bytes'] > 0)]

# Ensure all expected features exist
expected_cols = scaler.feature_names_in_
for col in expected_cols:
    if col not in live_data.columns:
        live_data[col] = 0.0

# Encode categorical columns
for col in live_data.select_dtypes(include='object').columns:
    live_data[col] = pd.factorize(live_data[col])[0]

# Reorder columns
live_data = live_data[expected_cols]

# Scale features
live_scaled = scaler.transform(live_data)

# Predict probabilities
probs = model.predict_proba(live_scaled)[:, 1]
live_data['intrusion_prob'] = probs

# Classify based on range
def classify(prob):
    """Classifies a probability into an intrusion category.
    
    Args:
        prob: Probability value between 0 and 1
        
    Returns:
        1 for intrusion, -1 for uncertain, 0 for normal
    """
    if prob >= 0.999:
        return 1  # Intrusion
    elif prob >= 0.85:
        return -1  # Uncertain
    else:
        return 0  # Normal

live_data['predicted_class'] = live_data['intrusion_prob'].apply(classify)

# Rule-based override: skip small outbound-only packets
def override(row):
    """Applies rule-based override to prediction results.
    
    Small outbound-only packets with low intrusion probability are
    classified as normal (0) regardless of the model's prediction.
    
    Args:
        row: DataFrame row containing prediction data
        
    Returns:
        Modified prediction class (0, -1, or 1)
    """
    if row['dst_bytes'] == 0 and row['src_bytes'] < 500 and row['intrusion_prob'] < 0.999:
        return 0
    return row['predicted_class']

live_data['predicted_class'] = live_data.apply(override, axis=1)

# Save predictions
live_data.to_csv("data/live_predictions.csv", index=False)

# Output result
print("\nPrediction Summary:")
print(live_data['predicted_class'].value_counts())
print("Avg Intrusion Probability:", round(live_data['intrusion_prob'].mean(), 4))

# Final status
# Output result with probability check
intrusion_detected = any(live_data['predicted_class'] == 1)
uncertain_detected = any(live_data['predicted_class'] == -1)
avg_prob = live_data['intrusion_prob'].mean()

if intrusion_detected and avg_prob >= 0.5:
    print("\nHigh-confidence intrusion detected!")
elif intrusion_detected and avg_prob < 0.5:
    print("\nSome packets were flagged as intrusion, but average confidence is low.")
elif uncertain_detected:
    print("\nSome traffic is uncertain — review advised.")
else:
    print("\nAll traffic appears normal.")