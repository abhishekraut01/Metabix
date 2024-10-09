import sys
import json
import numpy as np
import pandas as pd
import nltk
from Bio_Epidemiology_NER.bio_recognizer import ner_prediction
from transformers import pipeline

# Set pandas display options
pd.set_option('display.max_colwidth', 20)
nltk.download('punkt', quiet=True)

def main():
    print("Starting main...")
    
    # Input parameters
    pa = sys.argv[4]
    doc = f"CASE: {pa}"
    
    # NER pipeline with aggregation strategy to avoid warnings
    ner_pipeline = pipeline("ner", aggregation_strategy="simple")

    # NER prediction using custom model
    analysed = ner_prediction(corpus=doc, compute='cpu')

    # Check if the output is a DataFrame
    if not isinstance(analysed, pd.DataFrame) or analysed.empty:
        print("Cannot analyze your status: Please be more specific!")
        sys.exit("args: {}".format(analysed.shape))

    # Filter data
    analysed_filtered_DPBS = analysed[(analysed["entity_group"] == "Diagnostic_procedure") | 
                                      (analysed["entity_group"] == "Biological_structure")]
    analysed_filtered_SSLV = analysed[(analysed["entity_group"] == "Sign_symptom") | 
                                      (analysed["entity_group"] == "Lab_value")]

    # Load datasets
    sup_1 = pd.read_csv("LabelStatements_1.csv", engine='python')
    sup_2 = pd.read_csv("LabelStatements_2.csv", engine="python")
    prover_1 = pd.read_csv("ProductOverview_1.csv", engine="python")
    prover_2 = pd.read_csv("ProductOverview_2.csv", engine="python")
    othing_1 = pd.read_csv("OtherIngredients_1.csv", engine="python")
    othing_2 = pd.read_csv("OtherIngredients_2.csv", engine="python")

    # Merge datasets
    sup_merged = pd.concat([sup_1, sup_2], ignore_index=True, sort=False)
    prover_merged = pd.concat([prover_1, prover_2], ignore_index=True, sort=False)
    othing_merged = pd.concat([othing_1, othing_2], ignore_index=True, sort=False)

    full_merged = pd.merge(prover_merged, sup_merged, how="right", on=["URL", "DSLD ID", "Product Name"])
    full_merged = pd.merge(full_merged, othing_merged, how="right", on=["URL", "DSLD ID", "Product Name"])

    analysed_df = pd.DataFrame()
    for index, row in analysed_filtered_DPBS.iterrows():
        analysed_df = pd.concat([analysed_df, full_merged[full_merged["Statement"].str.contains(row['value'], na=False)]], ignore_index=True)

    # Age Detection
    if analysed_df.empty:
        print("No supplements available that satisfy your requirements")
        sys.exit("Bailing out of the program.")

    if not sys.argv[1]:
        d = {'Supplement Form [LanguaL]': ['Powder', 'Liquid', 'Gummy or Jelly']}
        child_rec = pd.DataFrame(data=d)

        new_df = pd.DataFrame()
        for index, row in child_rec.iterrows():
            new_df = pd.concat([new_df, analysed_df[analysed_df["Supplement Form [LanguaL]"].str.contains(row['Supplement Form [LanguaL]'], case=False)]], ignore_index=True)
        
        analysed_df = pd.concat([new_df, analysed_df], axis=0, ignore_index=True)

    # Brand preference
    if sys.argv[2] != 'Nan':
        d = {'Brand Name': [sys.argv[2]]}  # Using the input brand
        brand_rec = pd.DataFrame(data=d)

        new_df = pd.DataFrame()
        for index, row in brand_rec.iterrows():
            new_df = pd.concat([new_df, analysed_df[analysed_df["Brand Name"].str.contains(row['Brand Name'], case=False)]], ignore_index=True)

        analysed_df = pd.concat([new_df, analysed_df], axis=0, ignore_index=True)

    # Market status filtering
    if sys.argv[3]:
        d = {'Market Status': ['On Market']}
        on_rec = pd.DataFrame(data=d)

        new_df = pd.DataFrame()
        for index, row in on_rec.iterrows():
            new_df = pd.concat([new_df, analysed_df[analysed_df["Market Status"].str.contains(row['Market Status'], case=False)]], ignore_index=True)
        
        analysed_df = new_df  

    # Handle allergies input
    inp = sys.argv[5].replace(" ", "").split(",")

    allergic_food_dict = {
        'peanuts': ['peanuts'],
        'nuts': ['nuts', 'Walnuts', 'almonds', 'cashews', 'pistachios', 'pecans', 'hazelnuts'],
        'milk': ['cheese', 'butter', 'yogurt', 'milk', 'dairy'],
        'eggs': ['chicken', 'egg', 'eggs'],
        'fish': ['fish', 'salmon', 'tuna', 'halibut'],
        'shellfish': ['shellfish', 'shrimp', 'crab', 'lobster', 'mussel'],
        'wheat': ['bread', 'wheat', 'pasta', 'baked'],
        'soy': ['soy', 'tofu'],
        'mustard': ['mustard', 'mustard seed'],
        'sesame': ['sesame', 'sesame oil', 'sesame seed'],
        'celery': ['celery'],
        'sulfites': ['sulfite'],
        'lupin': ['lupin'],
        'mollusks': ['octopus', 'squid', 'cuttlefish'],
        'kiwi': ['kiwi'],
        'pineapple': ['pineapple'],
        'avocado': ['avocado', 'guacamole'],
        'banana': ['banana'],
        'strawberries': ['strawberry'],
        'tomato': ['tomato']
    }

    allergy_list = []

    if len(inp) != 0:
        for values in inp:
            for key, val in allergic_food_dict.items():
                if values in val:
                    allergy_list.append(key)

        final_tab_copy = analysed_df.copy()
        for key in allergy_list:
            final_tab_copy = final_tab_copy[~final_tab_copy["Other Ingredients"].str.contains(key, case=False, na=False)]
        
        analysed_df = final_tab_copy

    # Convert result to JSON format
    result = analysed_df.to_json(orient="split")
    parsed = json.loads(result)
    print(json.dumps(parsed, indent=4))

if __name__ == "__main__":
    main()
