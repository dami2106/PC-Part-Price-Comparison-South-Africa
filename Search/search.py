

# %%
# %%
from thefuzz import fuzz
from thefuzz import process
import pandas as pd 
from texttable import Texttable


# %%
# %%
#Read in the wootware csv with pandas 
dream = pd.read_csv('../Data/Processed/0_dreamware.csv')
evetech = pd.read_csv('../Data/Processed/1_evetech.csv')
rebel = pd.read_csv('../Data/Processed/2_rebeltech.csv')
takealot = pd.read_csv('../Data/Processed/3_takealot.csv')
woot = pd.read_csv('../Data/Processed/4_wootware.csv')
progenix = pd.read_csv('../Data/Processed/5_progenix.csv')
titanice = pd.read_csv('../Data/Processed/6_titanice.csv')


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


# %%
# %%
# search_term = "32gb ddr5 6000"

# search_result = search_all_stores(search_term=search_term, tol=95)

# table = [['Store', 'Item', 'Price']]
# t = Texttable()
# for shop in search_result:
#     if shop:

#         try:
#             table.append([shop.capitalize(), 
#                           search_result[shop]['Title'].capitalize(), 
#                           str(int(search_result[shop]['Price'])) ])
#         except:
#             table.append([shop.capitalize(), "N/A", "N/A"])

# t.add_rows(table)
# print(t.draw())



