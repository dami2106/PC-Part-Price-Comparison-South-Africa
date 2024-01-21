from flask import Flask, request, jsonify
from flask_cors import CORS  # Import the CORS module
import pandas as pd 
from thefuzz import fuzz
from thefuzz import process
import json


app = Flask(__name__)
CORS(app)  # Enable CORS for all routes

df_woot = pd.read_csv('12-12-2023_2245_wootware.csv')
df_evetech = pd.read_csv('11-12-2023_0705_evetech.csv')
df_dream = pd.read_csv('10-12-2023_2338_dreamwaretech.csv')
df_rebel = pd.read_csv('10-12-2023_2347_rebeltech.csv')
df_takealot = pd.read_csv('11-12-2023_0924_takealot.csv')


@app.route('/search', methods=['POST'])
def search():
    data = request.get_json()
    search_query = data.get('search_query', '')
    
    # Your search logic goes here (replace with your actual implementation)
    results = perform_search(search_query)

    print(results)

    return jsonify(results)


def search_df(df, query, tol = 75):
    search_result = process.extractOne(query, df['Title'], scorer=fuzz.token_set_ratio)

    if int(search_result[1]) >= tol:
        return df[df['Title'] == search_result[0]].to_dict(orient='records')[0]
    
    return {
        'Title': 'No results found',
        'Price': -99,
        'In Stock': 'No results found',
        'Category': 'No results found'
    }

def perform_search(query):

    woot_results = search_df(df_woot, query)
    evetech_results = search_df(df_evetech, query)
    dream_results = search_df(df_dream, query)
    rebel_results = search_df(df_rebel, query)
    takealot_results = search_df(df_takealot, query)

    print(dream_results)

    return {
        'woot': woot_results,
        'evetech': evetech_results,
        'dreamwaretech': dream_results,
        'rebel': rebel_results,
        'takealot': takealot_results
    }

if __name__ == '__main__':
    app.run(debug=True)
