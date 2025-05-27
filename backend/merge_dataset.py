import pandas as pd

# Load the original training dataset
def load_training_data(file_path="data/Train_data.csv"):
    """Loads the original training dataset.
    
    Args:
        file_path: Path to the training data CSV file
        
    Returns:
        DataFrame containing the training data
    """
    return pd.read_csv(file_path)

# Load the normal live data
def load_normal_data(file_path="data/normal_live_data.csv"):
    """Loads the normal live data that has been labeled.
    
    Args:
        file_path: Path to the normal live data CSV file
        
    Returns:
        DataFrame containing the normal live data
    """
    return pd.read_csv(file_path)

# Merge the datasets
def merge_datasets(train_df, normal_df):
    """Merges training data with normal live data.
    
    Args:
        train_df: Training data DataFrame
        normal_df: Normal live data DataFrame
        
    Returns:
        Combined DataFrame with both datasets
    """
    # Ensure column compatibility
    common_columns = list(set(train_df.columns) & set(normal_df.columns))
    
    # Use only common columns for both datasets
    train_subset = train_df[common_columns]
    normal_subset = normal_df[common_columns]
    
    # Concatenate the datasets
    combined = pd.concat([train_subset, normal_subset], ignore_index=True)
    return combined

# Save the combined dataset
def save_combined_data(combined_df, output_path="data/Combined_Train.csv"):
    """Saves the combined dataset to a CSV file.
    
    Args:
        combined_df: Combined DataFrame to save
        output_path: Path where the combined CSV will be saved
    """
    combined_df.to_csv(output_path, index=False)
    print(f"Combined dataset saved to {output_path}")

# Main execution
if __name__ == "__main__":
    train_data = load_training_data()
    normal_data = load_normal_data()
    combined_data = merge_datasets(train_data, normal_data)
    save_combined_data(combined_data)
    
    print(f"Original training data: {len(train_data)} rows")
    print(f"Normal live data: {len(normal_data)} rows")
    print(f"Combined dataset: {len(combined_data)} rows")