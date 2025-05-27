import pandas as pd
from sklearn.model_selection import train_test_split
from sklearn.preprocessing import LabelEncoder, StandardScaler
from sklearn.tree import DecisionTreeClassifier
import joblib

# Load the training dataset
def load_training_data(file_path="data/Train_data.csv"):
    """Loads the training dataset for model development.
    
    Args:
        file_path: Path to the training data CSV file
        
    Returns:
        DataFrame containing the training data
    """
    return pd.read_csv(file_path)

# Preprocess the data for training
def preprocess_data(df):
    """Preprocesses the training data for model training.
    
    This function performs several preprocessing steps:
    1. Drops unnecessary columns
    2. Encodes categorical features
    3. Splits features and target
    4. Scales numerical features
    
    Args:
        df: DataFrame containing the training data
        
    Returns:
        Tuple containing (X_train, X_test, y_train, y_test, scaler)
    """
    # Drop unnecessary columns
    columns_to_drop = [
        'wrong_fragment', 'urgent', 'hot', 'num_failed_logins', 'logged_in', 'num_compromised',
        'root_shell', 'su_attempted', 'num_root', 'num_file_creations', 'num_shells',
        'num_access_files', 'num_outbound_cmds', 'is_host_login', 'is_guest_login'
    ]
    df = df.drop(columns=[col for col in columns_to_drop if col in df.columns], errors='ignore')
    
    # Encode categorical features
    label_encoder = LabelEncoder()
    for col in df.columns:
        if df[col].dtype == 'object':
            df[col] = label_encoder.fit_transform(df[col])
    
    # Split features and target
    X = df.drop('class', axis=1)
    y = df['class']
    
    # Scale features
    scaler = StandardScaler()
    X_scaled = scaler.fit_transform(X)
    
    # Split data
    X_train, X_test, y_train, y_test = train_test_split(X_scaled, y, test_size=0.3, random_state=42)
    
    return X_train, X_test, y_train, y_test, scaler

# Train the decision tree model
def train_model(X_train, y_train):
    """Trains a decision tree classifier model.
    
    Args:
        X_train: Training features (scaled)
        y_train: Training labels
        
    Returns:
        Trained DecisionTreeClassifier model
    """
    model = DecisionTreeClassifier(criterion='entropy', max_depth=10, class_weight='balanced', random_state=42)
    model.fit(X_train, y_train)
    return model

# Save the trained model and scaler
def save_model_and_scaler(model, scaler, model_path="data/decision_tree_model.pkl", scaler_path="data/scaler.pkl"):
    """Saves the trained model and scaler to disk.
    
    Args:
        model: Trained model to save
        scaler: Fitted scaler to save
        model_path: Path where the model will be saved
        scaler_path: Path where the scaler will be saved
    """
    joblib.dump(model, model_path)
    joblib.dump(scaler, scaler_path)
    print(f"Model saved to {model_path}")
    print(f"Scaler saved to {scaler_path}")

# Main execution
if __name__ == "__main__":
    # Load data
    train_data = load_training_data()
    
    # Preprocess data
    X_train, X_test, y_train, y_test, scaler = preprocess_data(train_data)
    
    # Train model
    model = train_model(X_train, y_train)
    
    # Evaluate model
    accuracy = model.score(X_test, y_test)
    print(f"Model accuracy: {accuracy:.4f}")
    
    # Save model and scaler
    save_model_and_scaler(model, scaler)