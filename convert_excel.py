"""
Thanaweya Amma 2026 - High Precision Production Grade Excel to JSON Converter
Zero-Error Engine supporting dynamic subject breakdowns, dynamic max score detection (320/410),
and automatic Top Students Leaderboard generation.
"""

import sys
import os
import json
import re

sys.stdout.reconfigure(encoding='utf-8')
sys.stderr.reconfigure(encoding='utf-8')

try:
    import pandas as pd
except ImportError:
    print("Installing required packages (pandas, openpyxl)...")
    os.system("pip install pandas openpyxl")
    import pandas as pd

def normalize_arabic(text):
    if not isinstance(text, str):
        return ""
    text = re.sub(r'[\u064B-\u0652]', '', text) # remove tashkeel
    text = re.sub(r'[\u0622\u0623\u0625\u0671]', 'ا', text) # alif variants -> ا
    text = re.sub(r'ى', 'ي', text) # alef maqsoora -> ي
    text = re.sub(r'ة', 'ه', text) # ta marboota -> ه
    text = re.sub(r'عبد\s+', 'عبد', text)
    text = re.sub(r'ابو\s+', 'ابو', text)
    text = re.sub(r'\s+', ' ', text).strip()
    return text

def convert_excel(input_path, output_path):
    print(f"Reading official Excel file: {input_path}")
    excel_file = pd.ExcelFile(input_path)
    
    all_students = []
    detected_max_score = 410 # Default to 410, auto-detected below
    
    # Subject keyword mapping
    known_subjects = [
        'عربي', 'اللغة العربية', 'انجليزي', 'اللغة الأجنبية الأولى', 'فرنساوي', 'ألماني', 'إيطالي', 'اللغة الأجنبية الثانية',
        'فيزياء', 'كيمياء', 'أحياء', 'جيولوجيا', 'رياضيات', 'رياضة محضية', 'رياضة تطبيقية', 'جبر', 'تفاضل', 'ديناميكا',
        'تاريخ', 'جغرافيا', 'فلسفة', 'منطق', 'علم نفس', 'اجتماع', 'دين', 'تربية وطنية'
    ]

    for sheet_name in excel_file.sheet_names:
        print(f"Processing sheet: {sheet_name}")
        df = excel_file.parse(sheet_name)
        if len(df) == 0:
            continue
            
        cols = list(df.columns)
        print(f"Columns found ({len(cols)}): {cols}")
        
        col_map = {}
        subject_cols = []

        for col in cols:
            col_str = str(col).lower().strip()
            if 'جلوس' in col_str or 'seating' in col_str or 'رقم' in col_str:
                col_map['seating_no'] = col
            elif 'اسم' in col_str or 'name' in col_str or 'طالب' in col_str:
                col_map['arabic_name'] = col
            elif 'مجموع' in col_str or 'degree' in col_str or 'total' in col_str:
                col_map['total_degree'] = col
            elif 'مدرسة' in col_str or 'school' in col_str:
                col_map['school'] = col
            elif 'إدارة' in col_str or 'ادارة' in col_str or 'admin' in col_str:
                col_map['admin'] = col
            elif 'حافظة' in col_str or 'gov' in col_str:
                col_map['governorate'] = col
            elif 'شعبة' in col_str or 'sec' in col_str:
                col_map['section'] = col
            elif 'حالة' in col_str or 'status' in col_str:
                col_map['status'] = col
            else:
                # Check if it's a subject column
                for sub in known_subjects:
                    if sub in col_str:
                        subject_cols.append(col)
                        break

        # Check total column values to detect max score (e.g., 320 vs 410)
        total_col_name = col_map.get('total_degree')
        if total_col_name and total_col_name in df.columns:
            max_val = pd.to_numeric(df[total_col_name], errors='coerce').max()
            if pd.notna(max_val):
                if max_val <= 320:
                    detected_max_score = 320
                elif max_val <= 410:
                    detected_max_score = 410

        print(f"Auto-detected Max Score System: {detected_max_score}")

        for idx, row in df.iterrows():
            seating = row.get(col_map.get('seating_no'), '')
            name = str(row.get(col_map.get('arabic_name'), '')).strip()
            total = row.get(col_map.get('total_degree'), 0)
            
            if not name or name == 'nan' or name == 'None':
                continue
                
            try:
                total_float = round(float(total), 2)
            except:
                total_float = 0.0
                
            try:
                seating_int = int(seating)
            except:
                seating_int = seating

            percentage = round((total_float / detected_max_score) * 100, 2)
            
            # Subject grade dictionary
            subjects_dict = {}
            for sc in subject_cols:
                sub_val = row.get(sc)
                if pd.notna(sub_val):
                    try:
                        subjects_dict[str(sc)] = round(float(sub_val), 1)
                    except:
                        subjects_dict[str(sc)] = str(sub_val)

            student = {
                "id": len(all_students) + 1,
                "seating_no": seating_int,
                "name": name,
                "norm_name": normalize_arabic(name),
                "total": total_float,
                "max_total": detected_max_score,
                "percentage": percentage,
                "school": str(row.get(col_map.get('school'), 'المدرسة الرسمية')).strip() if col_map.get('school') else 'المدرسة الرسمية',
                "admin": str(row.get(col_map.get('admin'), 'الإدارة التعليمية')).strip() if col_map.get('admin') else 'الإدارة التعليمية',
                "governorate": str(row.get(col_map.get('governorate'), 'العامة')).strip() if col_map.get('governorate') else 'جميع المحافظات',
                "section": str(row.get(col_map.get('section'), 'عام')).strip() if col_map.get('section') else 'عام',
                "status": "ناجح" if percentage >= 50 else "دور ثاني",
                "subjects": subjects_dict
            }
            all_students.append(student)

    # Build Leaderboard (Top 100 students)
    all_students.sort(key=lambda s: s['total'], reverse=True)
    top_students = all_students[:100]

    print(f"Successfully processed {len(all_students)} student records.")
    print(f"Top Student Score: {top_students[0]['total'] if top_students else 0} / {detected_max_score}")

    output_data = {
        "max_score": detected_max_score,
        "total_records": len(all_students),
        "students": all_students,
        "top_students": top_students
    }
    
    with open(output_path, 'w', encoding='utf-8') as f:
        json.dump(output_data, f, ensure_ascii=False, indent=2)
        
    print(f"Output saved to: {output_path}")

if __name__ == "__main__":
    input_file = sys.argv[1] if len(sys.argv) > 1 else r"652587815849574نتيجة_الثانوية_العامة_2026_كاملة_جميع_المحافظات.xlsx"
    output_file = sys.argv[2] if len(sys.argv) > 2 else "results.json"
    
    if os.path.exists(input_file):
        convert_excel(input_file, output_file)
    else:
        print(f"File path does not exist yet: {input_file}")
