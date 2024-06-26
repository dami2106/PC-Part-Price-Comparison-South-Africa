from bs4 import BeautifulSoup
import time 
from datetime import datetime
import time
import requests
import csv
from datetime import datetime
import os
from tqdm import tqdm

# datetime object containing current date and time
now = datetime.now()
# dd/mm/YY H:M:S
dt_string = now.strftime("%d-%m-%Y")

# Function to format the category
def format_category(category):
    # Replace the category with the correct name
    category = category.replace('CPUs / Processors', 'CPU')
    category = category.replace('Motherboards', 'Motherboard')
    category = category.replace('RAM / Memory', 'RAM')
    category = category.replace('GPUs / Graphics Cards', 'GPU')
    category = category.replace('Cases / Chassis', 'Chassis')
    category = category.replace('PSUs / Power Supplies', 'PSU')
    category = category.replace('SSDs / Solid State Drives', 'Storage')
    category = category.replace('HDDs / Hard Drives', 'Storage')
    category = category.replace('Fans / Cooling', 'Cooler')
    
    # Replace the other categories with Others
    if category not in ['CPU', 'Motherboard', 'RAM', 'GPU', 'Chassis', 'PSU', 'Storage', 'Cooler']:
        category = 'Others'

    return category

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
csv_file_path = f'{subfolder_path}2_Rebeltech.csv'

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
# All Categories
URL = ['https://www.rebeltech.co.za/pc-components','https://www.rebeltech.co.za/peripherals'] 

links =[]
# Get all the links for the categories
for p in URL:
    home_response = requests.get(p)
    home_soup = BeautifulSoup(home_response.text, 'html.parser')
    allCategories = home_soup.find('ol', class_='items').findAll('li', class_='item')
    # print(len(allCategories))

    for i in allCategories:
        catLink = i.find('a')["href"]
        categoryNames= i.find('a').text.strip()

        # Get all the links for the sub-categories and categories name to a list
        links.append([catLink, categoryNames])
        

# Loop through all the links
for i in tqdm(links):
    # Get the URL and category name
    URL = i[0]
    category_name = i[1]

    # totalProduct = 0
    while True:
        # Parse the HTML and get the product link content
        home_response = requests.get(URL)
        home_soup = BeautifulSoup(home_response.text, 'html.parser')

        # Find all the products
        allProducts = home_soup.findAll('li', class_="item product product-item")

        # Loop through all the products    
        for j in allProducts:
            # Get the availability
            getAvailability = j.find("div", class_="actions-primary").text

            # Check if the product is in stock
            if getAvailability.strip() != "Out of stock":
                if getAvailability.strip() == "Add to Cart":
                    product_availability = True
                    # Get the product name, price and availability
                    product_name = j.find("a", class_="product-item-link").text.strip()
                    product_price = int(float(j.find("span", class_="price").text[4:].replace(',','')))

                    # Get the product URL
                    product_url = j.find("a", class_="product")["href"]

                    # Get the product URL
                    product_image_url = j.find("div", class_= "prolabels-wrapper").find("img")["src"]
                    
                    # Format the category and title
                    category_name = format_category(category_name)
                    product_name = format_title(product_name)

                    # Update the data dictionary
                    data_dict[product_name] = {
                        'Price': product_price,
                        'In Stock': product_availability,
                        'Category': category_name,
                        'URL': product_url,
                        'Image URL': product_image_url
                    }

        # Get the total number of products
        # totalProduct += (len(allProducts))

        # Check if there is a next page    
        if home_soup.find('li', class_="item pages-item-next") ==None:
            break
        
        # Get the next page URL
        URL = home_soup.find('li', class_="item pages-item-next").find('a', class_="action next")["href"]
 
# Write the updated data back to the CSV file
with open(csv_file_path, 'w', newline='', encoding='utf-8') as csv_file:
    csv_writer = csv.writer(csv_file)
    # Write the header row
    csv_writer.writerow(['Title', 'Price', 'In Stock', 'Category', 'URL', 'Image URL'])
    # Write the data rows
    for title, data in data_dict.items():
        csv_writer.writerow([title, data['Price'], data['In Stock'], data['Category'], data['URL'], data['Image URL']])
