from thefuzz import fuzz
from thefuzz import process
import pandas as pd 
from flask import Flask
import json

app = Flask(__name__)

@app.route('/api')


def search():
    """
    Return a dataframe with the product that best matches the search term.
    None if the product is less than tol
    """
    def search_product(search, df, tol):
        search_result = process.extractOne(search, df['Title'], scorer=fuzz.token_set_ratio)
        if int(search_result[1]) >= tol:
            return json.dumps(df[df['Title'] == search_result[0]].to_dict(orient='records')[0])
        
        return None 
    
        #Read in the wootware csv with pandas 
    woot = pd.read_csv('12-12-2023_2245_wootware.csv')
    evetech = pd.read_csv('11-12-2023_0705_evetech.csv')
    dream = pd.read_csv('10-12-2023_2338_dreamwaretech.csv')
    rebel = pd.read_csv('10-12-2023_2347_rebeltech.csv')
    takealot = pd.read_csv('11-12-2023_0924_takealot.csv')

    s = "wd blue nvme 1tb"

    return {
        "woot" : search_product(s, woot, 80),
        "evetech" : search_product(s, evetech, 80),
        "dream" : search_product(s, dream, 80),
        "rebel" : search_product(s, rebel, 80),
        "takealot" : search_product(s, takealot, 80)
    }

# print(search()["takealot"])