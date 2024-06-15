# %%
# %%
from nicegui import ui


from thefuzz import fuzz
from thefuzz import process
import pandas as pd 
from texttable import Texttable


# %%
# %%
#Read in the wootware csv with pandas 
dream = pd.read_csv('../Data/0_DreamWareTech.csv')
evetech = pd.read_csv('../Data/1_Evetech.csv')
rebel = pd.read_csv('../Data/2_Rebeltech.csv')
takealot = pd.read_csv('../Data/3_Takealot.csv')
woot = pd.read_csv('../Data/4_Wootware.csv')
progenix = pd.read_csv('../Data/5_Progenix.csv')
titanice = pd.read_csv('../Data/6_Titanice.csv')


# %%
# %%
"""
Formatting tool
"""
def format_title(title):
    title = title.lower()
    title = title.replace('-', ' ')
    title = title.replace(',', ' ')
    title = title.replace('.', ' ')
    title = title.replace('(', '')
    title = title.replace(')', '')
    title = title.replace('[', '')
    title = title.replace(']', '')
    return title


"""
Return a dataframe with the product that best matches the search term.
None if the product is less than tol
"""
def search_product(search, df, tol):
    search = format_title(search)
    # search_result = process.extractOne(search, df['Title'], scorer=fuzz.token_set_ratio)
    matches = process.extract(search,  df['Title'], scorer=fuzz.token_set_ratio)
    filtered_matches = [match for match in matches if match[1] >= tol]


    matched_data = df[df['Title'].isin([match[0] for match in filtered_matches])]
    sorted_data = matched_data.sort_values(by='Price', ascending=True)
    
    if not sorted_data.empty:
        return sorted_data.iloc[0]
    else:
        return None

def search_all_stores(search_term, tol = 95):
    return  {
        'dream': search_product(search_term, dream, tol),
        'evetech': search_product(search_term, evetech, tol),
        'rebel': search_product(search_term, rebel, tol),
        'takealot': search_product(search_term, takealot, tol),
        'woot': search_product(search_term, woot, tol),
        'progenix': search_product(search_term, progenix, tol),
        'titanice': search_product(search_term, titanice, tol),
    }





columns = [
    {'name': 'store', 'label': 'Store', 'field': 'store', 'sortable' : True, 'align': 'left'},
    {'name': 'title', 'label': 'Title', 'field': 'title', 'sortable': True, 'align': 'left'},
    {'name': 'price', 'label': 'Price', 'field': 'price', 'sortable': True, 'align': 'left'},
]

def on_search_click():
    search_result = search_all_stores(search_term=search_box.value, tol=(float(knob.value) * 100))
    results = []
    for shop in search_result:
        if shop:

            try:
                results.append({ 
                    'store' : shop.capitalize(), 
                    'title' : search_result[shop]['Title'].capitalize(), 
                    'price' : str(int(search_result[shop]['Price'])) 
                    })
            except:
                results.append({'store' : shop.capitalize(), 
                            'title' : "N/A", 
                            'price' :"N/A"})
    table.rows = results

search_box = ui.input(label='Search by Title')
search_button = ui.button('Search', on_click=on_search_click)
knob = ui.knob(0.95, show_value=True)
table = ui.table(columns=columns, rows=[{ 
                    'store' : shop.capitalize(), 
                    'title' : 'N/A', 
                    'price' : 'N/A'
                    } for shop in search_all_stores(search_term=search_box.value, tol=(float(knob.value) * 100))], row_key='name')


ui.run()


