from bs4 import BeautifulSoup
import requests
import pandas as pd
import warnings
import time 
from datetime import datetime
import os
from tqdm import tqdm
import csv

# Define the folder and subfolder paths
folder_path = '../Data/'
subfolder_path = f'{folder_path}Raw/'

# Check if the subfolder exists, and create it if it doesn't
if not os.path.exists(subfolder_path):
    os.makedirs(subfolder_path)

# Create csv file 
csv_file = open(f'{subfolder_path}5_Progen.csv', 'w', newline='', encoding='utf-8')
csv_writer = csv.writer(csv_file)
csv_writer.writerow(['Title','Price','In Stock','Category','URL'])

# Define the URLs and catorgories
All_links =[
    ['https://progenix.co.za/Components/Graphics-Cards', 'GPU'],
    ['https://progenix.co.za/Components/CPUs', 'CPU'],
    ['https://progenix.co.za/Components/Motherboards','Motherboard'],
    ['https://progenix.co.za/Components/RAM-Memory','RAM'],
    ['https://progenix.co.za/Components/Storage','Storage'],
    ['https://progenix.co.za/Components/Cooling','Cooler'],
    ['https://progenix.co.za/Components/PSUs','PSU'],
    ['https://progenix.co.za/Components/Computer-Cases','Chassis'],
]

# Loop through all the links
for i in tqdm(All_links):
    # Get the URL and category
    url = i[0]
    category = i[1]
    
    # Start scraping all products under one category
    scraping = True
    while scraping:
        # Get the page content
        page_content = requests.get(url, headers={"User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36"})
        soup = BeautifulSoup(page_content.content, 'html.parser')
        
        # Get all the products on the page
        all_product= soup.find_all('div', class_='product-thumb')
        
        # Loop through all the products
        for i in all_product:
            # Get the product name 
            product_name = i.find('div', class_='caption').find('h4').find('a').text.strip()

            # Initialize the price and stock availability
            product_price = -99
            in_stock = False

            # Check if the product is in stock
            stock_availability = i.find('div', class_='button-group').find('button').text.strip()
            if stock_availability == 'Add to Cart':
                in_stock = True

                # Get the price of the product and check if it is on sale or not
                price_info = i.find('div', class_='caption').find('p', class_='price')
                if price_info.find('span', class_='price-new') !=None:
                    product_price = price_info.find('span', class_='price-new').text.strip().replace('R', '').replace(',', '')
                else:
                    product_price = price_info.text.strip().replace('R', '').replace(',', '')

            # Get the product URL
            product_url = i.find('a')['href']

            # Write the information to the csv file
            csv_writer.writerow([product_name, product_price, in_stock, category, product_url])
            # print(title, price, in_stock, product_url)

        # Check if there is another page
        naviga = soup.find('ul', class_='pagination').find_all('li')
        get_navig_info = naviga[-2].find('a').text.strip()
        if get_navig_info == '>':
            url = naviga[-2].find('a')['href']
        else:
            # Stop scraping if there is no more pages
            scraping = False

# Close the csv file
csv_file.close()