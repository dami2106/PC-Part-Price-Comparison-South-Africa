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
subfolder_path = f'{folder_path}Raw/'

# Check if the subfolder exists, and create it if it doesn't
if not os.path.exists(subfolder_path):
    os.makedirs(subfolder_path)

# Create csv file
csv_file = open(f'{subfolder_path}4_Wootware.csv', 'w', newline='', encoding='utf-8')
csv_writer = csv.writer(csv_file)
csv_writer.writerow(['Title','Price','In Stock','Category','URL'])

# Find all the categories
nav_toggler = home_soup.find('div', class_='nav-dropdown level0')
different_categories = nav_toggler.findAll('a', class_='ww-block ww-text-base ww-text-gray-500 hover:ww-text-amber-500 ww-py-0.5 ww-no-underline ww-whitespace-nowrap')

# Iterate through the categories
for i in tqdm(different_categories):
   
    #Every category name and link
    category_name = i.text.strip()
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

            #@TODO: Remove this print when finalize
            # print(f"Found {len(products)} products on the page {category_name}.")

            # Iterate through the products
            for product in products:
                # Get the product name
                product_name = product.find('h2', class_="product-name").text.strip()

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
                # Save to csv
                csv_writer.writerow([product_name, product_price, product_availability, category_name, product_url])

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

# Close the csv file
csv_file.close()