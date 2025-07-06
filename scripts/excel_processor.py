import pandas as pd
import numpy as np
import json
import sys
from io import BytesIO
import warnings
warnings.filterwarnings('ignore')

def analyze_column_type(series):
    """Analyze pandas series to determine the best form field type"""
    
    # Remove null values for analysis
    clean_series = series.dropna()
    
    if len(clean_series) == 0:
        return 'text'
    
    # Check for boolean
    if series.dtype == 'bool' or clean_series.isin([True, False, 'true', 'false', 'True', 'False', 1, 0]).all():
        return 'checkbox'
    
    # Check for numeric
    if pd.api.types.is_numeric_dtype(series):
        if series.dtype in ['int64', 'int32']:
            return 'number'
        else:
            return 'number'
    
    # Check for datetime
    if pd.api.types.is_datetime64_any_dtype(series):
        return 'date'
    
    # Try to parse as datetime
    try:
        pd.to_datetime(clean_series.head(10))
        return 'date'
    except:
        pass
    
    # Check for email pattern
    if clean_series.astype(str).str.contains('@').any():
        email_pattern = clean_series.astype(str).str.contains(r'^[^@]+@[^@]+\.[^@]+$', regex=True)
        if email_pattern.sum() > len(clean_series) * 0.5:  # More than 50% are emails
            return 'email'
    
    # Check for categorical (limited unique values)
    unique_ratio = len(clean_series.unique()) / len(clean_series)
    if unique_ratio < 0.1 and len(clean_series.unique()) <= 20:  # Less than 10% unique and max 20 categories
        return 'select'
    
    # Check for long text
    avg_length = clean_series.astype(str).str.len().mean()
    if avg_length > 100:
        return 'textarea'
    
    # Default to text
    return 'text'

def process_excel_file(file_path_or_buffer):
    """Process Excel file and extract column information"""
    
    try:
        # Read Excel file
        if isinstance(file_path_or_buffer, str):
            df = pd.read_excel(file_path_or_buffer)
            filename = file_path_or_buffer.split('/')[-1]
        else:
            df = pd.read_excel(file_path_or_buffer)
            filename = "uploaded_file.xlsx"
        
        # Get basic info
        total_rows = len(df)
        
        columns_info = []
        
        for column in df.columns:
            series = df[column]
            
            # Basic statistics
            null_count = series.isnull().sum()
            unique_count = series.nunique()
            
            # Determine field type
            field_type = analyze_column_type(series)
            
            # Get sample values (non-null)
            sample_values = series.dropna().head(5).tolist()
            
            # For categorical fields, get all unique values
            categories = None
            if field_type == 'select':
                categories = sorted(series.dropna().unique().tolist())
            
            # Clean column name for form field
            clean_name = column.lower().replace(' ', '_').replace('-', '_')
            clean_name = ''.join(c for c in clean_name if c.isalnum() or c == '_')
            
            column_info = {
                'name': clean_name,
                'displayName': column,
                'dataType': str(series.dtype),
                'fieldType': field_type,
                'sampleValues': sample_values,
                'nullCount': int(null_count),
                'uniqueCount': int(unique_count),
                'totalCount': int(total_rows),
                'nullPercentage': round((null_count / total_rows) * 100, 2),
                'categories': categories
            }
            
            columns_info.append(column_info)
        
        result = {
            'filename': filename,
            'rowCount': total_rows,
            'columnCount': len(df.columns),
            'columns': columns_info,
            'metadata': {
                'processedAt': pd.Timestamp.now().isoformat(),
                'memoryUsage': df.memory_usage(deep=True).sum(),
                'dtypes': df.dtypes.to_dict()
            }
        }
        
        return result
        
    except Exception as e:
        return {
            'error': str(e),
            'success': False
        }

def process_image_for_ocr(image_buffer):
    """Simulate OCR processing for an image buffer."""
    # In a real scenario, you would use an OCR library like Tesseract here.
    # For now, we return mock data.
    
    # Simulate processing delay
    # time.sleep(1) # Uncomment if you want to simulate a delay

    mock_text = """
    GOVERNMENT FORM - CITIZEN REGISTRATION
    
    Full Name: John Michael Smith
    Date of Birth: 15/03/1985
    Address: 123 Main Street, Springfield
    Phone: (555) 123-4567
    Email: john.smith@email.com
    Department: Human Resources
    Employee ID: EMP-2024-001
    Signature: [Signature Present]

    This form was completed on 2024-01-15
    Processed by: Administrative Office
    """
    
    mock_fields = {
        "Full Name": "John Michael Smith",
        "Date of Birth": "15/03/1985",
        "Address": "123 Main Street, Springfield",
        "Phone": "(555) 123-4567",
        "Email": "john.smith@email.com",
        "Department": "Human Resources",
        "Employee ID": "EMP-2024-001",
    }

    return {
        "text": mock_text,
        "confidence": 87.5,
        "fields": mock_fields,
        "success": True
    }


def main():
    """Main function for command line usage"""
    if len(sys.argv) < 2:
        print("Usage: python excel_processor.py <mode> <file_path_or_buffer>")
        sys.exit(1)
    
    mode = sys.argv[1]
    
    if mode == "excel":
        if len(sys.argv) != 3:
            print("Usage: python excel_processor.py excel <file_path>")
            sys.exit(1)
        file_path = sys.argv[2]
        result = process_excel_file(file_path)
    elif mode == "ocr":
        # For OCR, we expect the image buffer to be passed via stdin
        image_buffer = sys.stdin.buffer.read()
        result = process_image_for_ocr(image_buffer)
    else:
        print(f"Unknown mode: {mode}")
        sys.exit(1)
        
    print(json.dumps(result, indent=2, default=str))

if __name__ == "__main__":
    main()