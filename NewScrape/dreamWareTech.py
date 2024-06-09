from bs4 import BeautifulSoup
import requests
import pandas as pd
import warnings
import time 
from datetime import datetime
import os
from tqdm import tqdm

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
    category = category.replace('Processors (CPUs)', 'CPU')
    category = category.replace('Graphics Cards (GPUs)', 'GPU')
    category = category.replace('Strorage', 'Storage')
    category = category.replace('Motherboards', 'Motherboard')
    category = category.replace('Memory (RAM)', 'RAM')
    category = category.replace('Power Supplies (PSUs)', 'PSU')
    category = category.replace('PC Cases/Chassis', 'Chassis')
    category = category.replace('Computer Cooling', 'Cooler')

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

# Option to ignore warnings
pd.options.mode.chained_assignment = None
warnings.simplefilter(action='ignore', category=FutureWarning)

###CREATE CSV FILE
# Define the folder and subfolder paths
folder_path = '../Data/'
subfolder_path = f'{folder_path}Raw/'

# Check if the subfolder exists, and create it if it doesn't
if not os.path.exists(subfolder_path):
    os.makedirs(subfolder_path)

# Create csv file
csv_file = open(f'{subfolder_path}0_DreamWareTech.csv', 'w', newline='', encoding='utf-8')
csv_writer = csv.writer(csv_file)
csv_writer.writerow(['Title','Price','In Stock','Category','URL', 'Image URL'])

###SCRAPING
# Get the content of the home page
home_url = 'https://www.dreamwaretech.co.za/c/computer-components/'
home_content = requests.get(home_url, headers={"User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36"})
home_soup = BeautifulSoup(home_content.content, 'html.parser')

# Get all the categories
categories = home_soup.findAll('div', class_='col-md-6 col-lg-4')

# Store all links that we need to scrape
links = []
# The main url for concatenating the productURl
main_url = "https://www.dreamwaretech.co.za"

# Skip the first link y
for cate in tqdm(categories[1:]):
    link = cate.find('a', href=True)
    new_links = 'https://www.dreamwaretech.co.za'+link['href']
    categories_name = cate.find('div', class_='category-text').text.strip()

    # Get the new page content and categories
    new_content = requests.get(new_links, headers={"User-Agent": "Mozilla/5.0"})
    new_soup = BeautifulSoup(new_content.content, 'html.parser')
    new_categories = new_soup.findAll('div', class_='col-md-6 col-lg-4')
    
    # If there are sub-categories, get the links of the sub-categories otherwise get the link of the current page
    if len(new_categories) != 0:
        final_links = []
        for new_cate in new_categories:
            final_new_link = new_cate.find('a', href=True)
            links.append(['https://www.dreamwaretech.co.za'+final_new_link['href'], categories_name])
    else:
        links.append([new_links, categories_name])
    
    time.sleep(1)

# Loop through all the links and scrape the data
for elem in tqdm(links):
    category_name = elem[1]
    URL = elem[0]

    paging = True
    url = URL + ""
    
    # Loop through all the pages
    while paging:
        # Get the content of the page
        html_content = requests.get(url, headers={"User-Agent": "Mozilla/5.0"})
        soup = BeautifulSoup(html_content.text, features="html.parser")
        divs = soup.find_all("div", class_= "product card")

        # print("Scraping :" + url)
        
        # Loop through all the products on the page
        for product in divs:
            if "with supplier" in product.find("p", class_="prod-availability").text.lower():
                product_availability = True
                product_name = product.find("p", class_="product-box-name").find("a").get("href").split("/")[-2].replace("-", " ")
                product_price = int(product.find("p", class_="product-price").text.split(' ')[1].replace('R', ''))
                product_url = main_url + product.find("a")["href"]
                product_image_url = product.find("img")["src"]

                # Format the category and title
                category_name = format_category(category_name)
                product_name = format_title(product_name)

                # Save to csv
                csv_writer.writerow([product_name, product_price, product_availability, category_name, product_url, product_image_url])
        
        # Check if there is a next page
        if soup.find("p", id="next-nav"):
            paging = True if soup.find("p", id="next-nav").text in "Last" else False
            next_page_url = soup.find("a", id="a-next-nav").get("href")

            if next_page_url:
                url = URL + next_page_url
            else:
                paging = False
        else:
            paging = False
        
        time.sleep(2)
    time.sleep(3)

# Close the csv file
csv_file.close()