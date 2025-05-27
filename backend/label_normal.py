import pandas as pd

# Load the live data captured from network
def load_live_data(file_path="data/live_data.csv"):
    """Loads the captured live network data.
    
    Args:
        file_path: Path to the live data CSV file
        
    Returns:
        DataFrame containing the captured network data
    """
    return pd.read_csv(file_path)

# Label all traffic as normal
def label_as_normal(df):
    """Labels all traffic in the dataset as 'normal'.
    
    This function adds a 'class' column to the DataFrame and sets all values to 'normal',
    which can be used for training the model with known benign traffic.
    
    Args:
        df: DataFrame containing network traffic data
        
    Returns:
        DataFrame with added 'class' column set to 'normal'
    """
    df['class'] = 'normal'
    return df

# Save the labeled data
def save_labeled_data(df, output_path="data/normal_live_data.csv"):
    """Saves the labeled data to a CSV file.
    
    Args:
        df: DataFrame with labeled data
        output_path: Path where the labeled CSV will be saved
    """
    df.to_csv(output_path, index=False)
    print(f"Labeled normal data saved to {output_path}")

# Main execution
if __name__ == "__main__":
    # Load the live data
    live_data = load_live_data()
    
    # Label all traffic as normal
    labeled_data = label_as_normal(live_data)
    
    # Save the labeled data
    save_labeled_data(labeled_data)
    
    print(f"Labeled {len(labeled_data)} packets as normal traffic")