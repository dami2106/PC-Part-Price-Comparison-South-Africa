from bs4 import BeautifulSoup
import requests
import pandas as pd
import warnings
import time 
from datetime import datetime
import os
from tqdm import tqdm
import csv

# datetime object containing current date and time
now = datetime.now()
# dd/mm/YY H:M:S
dt_string = now.strftime("%d-%m-%Y")

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
csv_file_path = f'{subfolder_path}6_Titanice.csv'

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
# Get all the links for the categories
All_links =[
    ['https://www.titan-ice.co.za/hardware/solid-state-drives/', 'Storage'],
    ['https://www.titan-ice.co.za/hardware/memory-ram/', 'RAM'],
    ['https://www.titan-ice.co.za/hardware/graphics-cards/', 'GPU'],
    ['https://www.titan-ice.co.za/hardware/hard-drives/', 'Storage'],
    ['https://www.titan-ice.co.za/hardware/motherboards/', 'Motherboard'],
    ['https://www.titan-ice.co.za/hardware/processors/', 'CPU'],
    ['https://www.titan-ice.co.za/hardware/power-supplies/', 'PSU'],
    ['https://www.titan-ice.co.za/hardware/chassis/', 'Chassis'],
    ['https://www.titan-ice.co.za/hardware/air-cooling/', 'Cooler'],
    ['https://www.titan-ice.co.za/hardware/thermal-interface-material/', 'Cooler'],
    ['https://www.titan-ice.co.za/hardware/water-cooling/', 'Cooler'],
    ['https://www.titan-ice.co.za/hardware/multimedia/', 'MULTIMEDIA'],
    ['https://www.titan-ice.co.za/hardware/io-cards/', 'I/O CARDS'],
    ['https://www.titan-ice.co.za/hardware/software/', 'SOFTWARE'],
    ['https://www.titan-ice.co.za/hardware/drive-bay-accessories/', 'Chassis'],
    ['https://www.titan-ice.co.za/hardware/internal-cables/', 'Chassis'],
]

# Loop through all the links
for i in tqdm(All_links):
    # Get the URL and category
    URL = i[0]
    category_name = i[1]
    
    # Start scraping all products under one category
    scraping = True
  
    while scraping:
        # Send a GET request to the URL
        page_content = requests.get(URL, headers={"User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36"})
        soup = BeautifulSoup(page_content.content, 'html.parser')
        products = soup.findAll('div', class_='ty-column3')
        
        for i in products:
            if i.find('a', class_='product-title') is None:
                continue
            
            product_availability = False
            if i.find('div', class_='ty-control-group') is not None:
                availability = i.find('div', class_='ty-control-group').find('span').text.strip()
                # Check if the product is in stock
                if availability != "Out of stock":
                    # Get the product details
                    product_availability = True
                    product_name = i.find('a', class_='product-title').text.strip()
                    product_price = i.find('span', class_='ty-list-price').text.strip().replace('R', '').replace('.00', '').replace(' ', '')
                    product_price = int(float(product_price))

                    product_url = i.find('a', class_='product-title')['href']
                    product_image_url = i.find('img', class_='ty-pict').get('src')

                    # Format the title
                    product_name = format_title(product_name)

                    # Update the data dictionary
                    data_dict[product_name] = {
                        'Price': product_price,
                        'In Stock': product_availability,
                        'Category': category_name,
                        'URL': product_url,
                        'Image URL': product_image_url
                    }
            

        url = soup.find('a', class_='ty-pagination__right-arrow')
        #check if the url contains a href
        if url is not None and 'href' in url.attrs:
            URL = url['href']
        else:
            scraping = False
   
# Write the updated data back to the CSV file
with open(csv_file_path, 'w', newline='', encoding='utf-8') as csv_file:
    csv_writer = csv.writer(csv_file)
    # Write the header row
    csv_writer.writerow(['Title', 'Price', 'In Stock', 'Category', 'URL', 'Image URL'])
    # Write the data rows
    for title, data in data_dict.items():
        csv_writer.writerow([title, data['Price'], data['In Stock'], data['Category'], data['URL'], data['Image URL']])


