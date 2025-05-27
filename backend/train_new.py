import pandas as pd
from sklearn.tree import DecisionTreeClassifier
from sklearn.preprocessing import StandardScaler
from sklearn.model_selection import train_test_split
import joblib

# Load the combined training dataset
df = pd.read_csv("data/Combined_Train.csv")

# Drop irrelevant features
columns_to_drop = [
    'wrong_fragment', 'urgent', 'hot', 'num_failed_logins', 'logged_in', 'num_compromised',
    'root_shell', 'su_attempted', 'num_root', 'num_file_creations', 'num_shells',
    'num_access_files', 'num_outbound_cmds', 'is_host_login', 'is_guest_login'
]
df = df.drop(columns=[col for col in columns_to_drop if col in df.columns], errors='ignore')

# Convert class to binary (normal/anomaly)
def convert_to_binary(cls):
    """Converts class labels to binary format.
    
    Args:
        cls: Original class label
        
    Returns:
        1 for any intrusion type, 0 for normal traffic
    """
    if cls == "normal":
        return 0
    else:
        return 1

df['class'] = df['class'].apply(convert_to_binary)

# Encode categorical columns
for col in df.select_dtypes(include='object').columns:
    df[col] = pd.factorize(df[col])[0]

# Split features and target
X = df.drop('class', axis=1)
y = df['class']

# Scale features
scaler = StandardScaler()
X_scaled = scaler.fit_transform(X)

# Split data
X_train, X_test, y_train, y_test = train_test_split(X_scaled, y, test_size=0.2, random_state=42)

# Train decision tree model
def train_model(X_train, y_train):
    """Trains a decision tree classifier model.
    
    Args:
        X_train: Training features (scaled)
        y_train: Training labels
        
    Returns:
        Trained DecisionTreeClassifier model
    """
    model = DecisionTreeClassifier(max_depth=10, random_state=42)
    model.fit(X_train, y_train)
    return model

model = train_model(X_train, y_train)

# Save model and scaler
joblib.dump(model, "data/decision_tree_model.pkl")
joblib.dump(scaler, "data/scaler.pkl")

# Evaluate model
accuracy = model.score(X_test, y_test)
print(f"Model accuracy: {accuracy:.4f}")