from selenium import webdriver as wd
from selenium.webdriver.common.by import By
from bs4 import BeautifulSoup
import time 
from selenium.webdriver.support.ui import Select
from datetime import datetime
import time
from selenium.webdriver.common.action_chains import ActionChains
import requests
import csv
from datetime import datetime
import os
from tqdm import tqdm


def update_category(category):
    if category == 'Graphics Cards':
        return 'GPU'
    elif category == 'Processors / CPUs':
        return 'CPU'
    elif category == 'Memory / RAM':
        return 'RAM'
    elif category == 'Motherboards':
        return 'Motherboard'
    elif category == 'Power Supplies / PSUs':
        return 'PSU'
    elif category == 'Cases / Chassis':
        return 'Chassis'
    elif category == 'Solid State Drives / SSDs':
        return 'Storage'
    elif category == 'Internal Hard Drives / HDDs':
        return 'Storage'
    elif category == 'External Hard Drives / HDDs':
        return 'Storage'
    elif category == 'Fans & CPU Coolers' or category == 'Water / Liquid Cooling':
        return 'Cooler'
    elif category == 'Other':
        return 'Other'
   
    
def format_title(title):
    title = title.lower()
    # @TODO: Uncomment the following lines if When finalizing the code
    # title = title.replace('-', ' ')
    # title = title.replace(',', ' ')
    # title = title.replace('.', ' ')
    # title = title.replace('(', '')
    # title = title.replace(')', '')
    # title = title.replace('[', '')
    # title = title.replace(']', '')

    return title

# datetime object containing current date and time
now = datetime.now()

# dd/mm/YY H:M:S
dt_string = now.strftime("%d-%m-%Y")

URL = 'https://www.wootware.co.za/'

# Parse the HTML
home_response = requests.get(URL)
home_soup = BeautifulSoup(home_response.text, 'html.parser')

# Define the folder and subfolder paths
folder_path = '../Data/'

# Open the database 
import sqlite3
conn = sqlite3.connect(folder_path + 'pc_stores.db')
c = conn.cursor()

total_products = 0
total_update = 0
total_Added = 0
total_failed = 0
# Find all the categories
nav_toggler = home_soup.find('div', class_='nav-dropdown level0')
different_categories = nav_toggler.findAll('a', class_='ww-block ww-text-base ww-text-gray-500 hover:ww-text-amber-500 ww-py-0.5 ww-no-underline ww-whitespace-nowrap')

# Iterate through the categories
for i in tqdm(different_categories):
   
    #Every category name and link
    category_name = i.text.strip()
    category_name = update_category(category_name)
    URL = i['href']

    #Open the category link
    stopping = False
    while stopping == False:
        # Send a GET request to the URL
        response = requests.get(URL)
        
        # Check if the request was successful (status code 200)
        if response.status_code == 200:
            # Parse the HTML content of the page
            soup = BeautifulSoup(response.text, 'html.parser')

            # Find all the products on the page
            products = soup.find_all('div', class_="main-info")

            total_products += len(products)
            #@TODO: Remove this print when finalize
            # print(f"Found {len(products)} products on the page {category_name}.")

            # Iterate through the products
            for product in products:
                # Get the product name
                product_name = product.find('h2', class_="product-name").text.strip()
                product_name = format_title(product_name)

                # Get the product availability
                get_availability = product.find('div', class_="availability-in-stock")
                product_availability = False
                # Check if the product is available
                if get_availability is None:
                    product_availability = False
                else:
                    if get_availability.text.strip() == "In stock with Supplier":
                        product_availability = True

                # Get the product price
                product_price = -99
                if get_availability != None:
                    price_box = product.find('div', class_="price-box")

                    # Get all the prices
                    all_prices = price_box.find_all('span', class_="price")
                    if len(all_prices) == 1:
                        product_price = all_prices[0].text.strip()
                    else:
                        product_price = all_prices[1].text.strip()
                    product_price = product_price.replace("R", "").replace(",", "").strip()
                
                # Get the product URL
                product_url = product.find('a', class_="product-image")['href']

                # update the table
                c.execute('''UPDATE wootware SET Price = ?, In_stock = ? WHERE URL = ?''', (product_price, product_availability, product_url))

                # Check the row count affected by the update
                rows_affected = c.rowcount

                if rows_affected > 0:
                    total_update += 1

                else:
                    c.execute('''INSERT INTO wootware (Title, Price, In_stock, Category, URL) VALUES (?, ?, ?, ?, ?)''', (product_name, product_price, product_availability, category_name, product_url))
                    rows_affected = c.rowcount
                    
                    if rows_affected > 0:
                        total_Added += 1
                       
                    else:
                        total_failed += 1

                # # Save to csv
                # csv_writer.writerow([product_name, product_price, product_availability, category_name, product_url])

        # else:
        #     print(f"Failed to retrieve the page. Status code: {response.status_code}")

        # Check if there is a next page
        if soup.find('a', class_="next i-next") is not None:
            nextpage = soup.find('a', class_="next i-next")
            URL = nextpage['href']
        else:
            stopping = True
        time.sleep(2)
    time.sleep(5)
print(f"Total products: {total_products}")
print(f"Total products updated: {total_update}")
print(f"Total products added: {total_Added}")
print(f"Total products failed: {total_failed}")


# commit the changes
conn.commit()
# close the database
c.close()