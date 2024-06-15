from bs4 import BeautifulSoup
import requests
import pandas as pd
import warnings
import time 
from datetime import datetime
import os
from tqdm import tqdm
import csv

# Function to format the title
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

###CREATE CSV FILE
# Define the folder and subfolder paths
folder_path = '../Data/'
subfolder_path = f'{folder_path}'

# Check if the subfolder exists, and create it if it doesn't
if not os.path.exists(subfolder_path):
    os.makedirs(subfolder_path)

# Define the csv file path
csv_file_path = f'{subfolder_path}5_Progenix.csv'

# Read existing data into a dictionary
data_dict = {}
if os.path.exists(csv_file_path):
    with open(csv_file_path, 'r', newline='', encoding='utf-8') as csv_file:
        csv_reader = csv.reader(csv_file)
        next(csv_reader)  # Skip header row
        for row in csv_reader:
            title, price, in_stock, category, url, image_url = row
            data_dict[title] = {
                'Price': price,
                'In Stock': in_stock,
                'Category': category,
                'URL': url,
                'Image URL': image_url
            }
###SCRAPING
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
    URL = i[0]
    category_name = i[1]
    
    # Start scraping all products under one category
    scraping = True
    while scraping:
        # Get the page content
        page_content = requests.get(URL, headers={"User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36"})
        soup = BeautifulSoup(page_content.content, 'html.parser')
        
        # Get all the products on the page
        all_product= soup.find_all('div', class_='product-thumb')
        
        # Loop through all the products
        for i in all_product:
            # Check if the product is in stock
            stock_availability = i.find('div', class_='button-group').find('button').text.strip()
            if stock_availability == 'Add to Cart':
                product_availability = True
                # Get the product name 
                product_name = i.find('div', class_='caption').find('h4').find('a').text.strip()


                # Get the price of the product and check if it is on sale or not
                product_price = -99
                price_info = i.find('div', class_='caption').find('p', class_='price')
                if price_info.find('span', class_='price-new') !=None:
                    product_price = price_info.find('span', class_='price-new').text.strip().replace('R', '').replace(',', '')
                else:
                    product_price = price_info.text.strip().replace('R', '').replace(',', '')
                product_price = int(float(product_price))

                # Get the product URL
                product_url = i.find('a')['href']

                # Get the product image URL
                product_image_url = i.find('div', class_='image').find('a').find('img')['src']

                # Format the category and title
                product_name = format_title(product_name)

                # Update the data dictionary
                data_dict[product_name] = {
                    'Price': product_price,
                    'In Stock': product_availability,
                    'Category': category_name,
                    'URL': product_url,
                    'Image URL': product_image_url
                }


        # Check if there is another page
        naviga = soup.find('ul', class_='pagination').find_all('li')
        get_navig_info = naviga[-2].find('a').text.strip()
        if get_navig_info == '>':
            URL = naviga[-2].find('a')['href']
        else:
            # Stop scraping if there is no more pages
            scraping = False

# Write the updated data back to the CSV file
with open(csv_file_path, 'w', newline='', encoding='utf-8') as csv_file:
    csv_writer = csv.writer(csv_file)
    # Write the header row
    csv_writer.writerow(['Title', 'Price', 'In Stock', 'Category', 'URL', 'Image URL'])
    # Write the data rows
    for title, data in data_dict.items():
        csv_writer.writerow([title, data['Price'], data['In Stock'], data['Category'], data['URL'], data['Image URL']])
