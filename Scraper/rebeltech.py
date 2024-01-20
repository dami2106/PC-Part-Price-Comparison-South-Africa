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
# datetime object containing current date and time
now = datetime.now()

# dd/mm/YY H:M:S
dt_string = now.strftime("%d-%m-%Y")

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

# Define the folder and subfolder paths
folder_path = '../Products/'
subfolder_path = f'{folder_path}{dt_string}/'

# Check if the subfolder exists, and create it if it doesn't
if not os.path.exists(subfolder_path):
    os.makedirs(subfolder_path)

# Open CSV File and write headers
csv_file = open(f'{subfolder_path}{dt_string}_Rebeltech.csv', 'w', newline='', encoding='utf-8')
csv_writer = csv.writer(csv_file)
csv_writer.writerow(['Title','Price','In Stock','Category'])

# Loop through all the links
for i in links:
    # Get the URL and category name
    URL =i[0]
    categoryNames = i[1]

    totalProduct = 0
    while True:
        # Parse the HTML and get the product link content
        home_response = requests.get(URL)
        home_soup = BeautifulSoup(home_response.text, 'html.parser')

        # Find all the products
        allProducts = home_soup.findAll('li', class_="item product product-item")

        # Loop through all the products    
        for j in allProducts:
            # Get the product name, price and availability
            name = j.find("a", class_="product-item-link").text.strip()
            price =j.find("span", class_="price").text[4:].replace(',','')
            getAvailability = j.find("div", class_="actions-primary").text

            # Check if the product is in stock
            prod_Availability = False
            if getAvailability.strip() == "Out of stock":
                prod_Availability = False
            else:
                if getAvailability.strip() == "Add to Cart":
                    prod_Availability = True
            # Add to CSV File
            csv_writer.writerow([name,price,prod_Availability,categoryNames])

        # Get the total number of products
        totalProduct += (len(allProducts))

        # Check if there is a next page    
        if home_soup.find('li', class_="item pages-item-next") ==None:
            break
        
        # Get the next page URL
        URL = home_soup.find('li', class_="item pages-item-next").find('a', class_="action next")["href"]
 
# Close CSV File
csv_file.close()