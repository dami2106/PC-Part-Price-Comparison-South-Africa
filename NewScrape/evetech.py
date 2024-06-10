from selenium import webdriver as wd
from selenium.webdriver.common.by import By
from bs4 import BeautifulSoup
import time 
from selenium.webdriver.support.ui import Select
from datetime import datetime
from selenium.webdriver.common.action_chains import ActionChains
import requests
import csv
from selenium import webdriver
from selenium.webdriver.chrome.options import Options
from datetime import datetime
import os
from tqdm import tqdm

# datetime object containing current date and time
now = datetime.now()
# dd/mm/YY H:M:S
dt_string = now.strftime("%d-%m-%Y")

# Set up Chrome options for headless mode and different user agent
chrome_options = Options()
chrome_options.add_argument('--headless')  # Enable headless mode
# chrome_options.add_argument("--disable-gpu")
chrome_options.add_argument('user-agent=Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36')
chrome_options.add_argument('log-level=3')

# Create a webdriver instance with the specified options
driver = webdriver.Chrome(options=chrome_options)

# Function to format the category
def format_category(category):
    # Replace the category with the correct name

    categories_to_replace = [
    'Logitech Gaming Headsets',
    'Corsair Gaming Headsets',
    'Steelseries Headsets & Headphones',
    'RAZER Headset & Headphones'
    ]

    for old_category in categories_to_replace:
        category = category.replace(old_category, 'Headset')
    category = category.replace('Case Fans', 'Cooler')
    category = category.replace('Fractal Design Cases', 'Chassis')
    category = category.replace('ASUS Gaming Cases', 'Chassis')
    category = category.replace('Antec Gaming Cases', 'Chassis')
    category = category.replace('Corsair Gaming Cases', 'Chassis')
    category = category.replace('CPU Coolers', 'Cooler')
    category = category.replace('AMD RYZEN CPUs', 'CPU')
    category = category.replace('INTEL CPU', 'CPU')
    category = category.replace('Gamdias Gaming Keyboards', 'Keyboard')
    category = category.replace('Logitech Gaming Keyboards', 'Keyboard')
    category = category.replace('Corsair Gaming Keyboards', 'Keyboard')
    category = category.replace('Arozzi Gaming Mouse', 'Mouse')
    category = category.replace('Glorious Gaming Mouse', 'Mouse')
    category = category.replace('Logitech Gaming Mouse', 'Mouse')
    category = category.replace('Steelseries Gaming Mouse', 'Mouse')
    category = category.replace('Corsair Gaming Mice', 'Mouse')
    category = category.replace('Graphics Cards', 'GPU')
    category = category.replace('Memory (RAM)', 'RAM')
    category = category.replace('Motherboards', 'Motherboard')
    category = category.replace('Power Supply (PSU)', 'PSU')
    category = category.replace('Solid State Drives (SSD)', 'Storage')
    category = category.replace('External Portable SSDs (Solid State Drives)', 'Storage')

    # Replace the other categories with Others
    if category not in ['CPU', 'Motherboard', 'RAM', 'GPU', 'Chassis', 'PSU', 'Storage', 'Cooler', 'Keyboard', 'Mouse', 'Headset']:
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

# Create csv file
csv_file = open(f'{subfolder_path}1_Evetech.csv', 'w', newline='', encoding='utf-8')
csv_writer = csv.writer(csv_file)
csv_writer.writerow(['Title','Price','In Stock','Category','URL', 'Image URL'])

###SCRAPING
# Define the URL
url = 'https://www.evetech.co.za/components.aspx'
mainURL = 'https://www.evetech.co.za'

# Scrape the site
def scrape_site(driver,categories):
    time.sleep(5)
    # Get the page source (HTML content)
    page_source = driver.page_source

    # Use BeautifulSoup to parse the HTML
    soup = BeautifulSoup(page_source, 'html.parser')

    # Product category
    category_name = soup.find('div',class_='d-block cols-12 gap-2 gap-sm-3 comp-top-section')
    category_name = category_name.findAll('div', class_='detail')
    get_len_of_product_category = len(category_name)
    if len(category_name) < 1:
        category_name = categories
    else:
        category_name = category_name[get_len_of_product_category-1].find('h1').text

    # Find the number of product
    products = soup.findAll('div', class_='ComponentCard_Products__Card__SJT5q ComponentCard_HoverGrow__Q2lEZ shadow overflow-hidden h-100 gap-2 position-relative card')
    # print("Number of products:", len(products))

    for i in products:
        # Get the availability 
        product_availiable_text = str(i.find('span', class_="fw-1 fs-6 text-wrap").text.strip())
        if product_availiable_text.__contains__("In Stock"):
            # Get the product name and price
            product_availability = True
            product_name = i.find('h3', class_="fs-6 fw-2 lh-1 m-0 overflow-hidden h-100").text.strip()
            product_price = i.find('div', class_="ComponentCard_Products__Price__SG2mn fw-3 fs-3 flex-shrink-0").text.replace("R ", "").strip()
            product_price = int(float(product_price))

            # Get the product URL
            product_url = mainURL + i.find('a')['href']

            # Get the product image URL
            product_image_url = i.find('img')['src']

            # Format the product name and category
            product_name = format_title(product_name)
            category_name = format_category(category_name)

            # Save to csv
            csv_writer.writerow([product_name, product_price, product_availability, category_name, product_url,product_image_url])    

# Navigate to the desired website
driver.get(url)

# Get the page source (HTML content)
page_source = driver.page_source
time.sleep(10)

# Use BeautifulSoup to parse the HTML
soup = BeautifulSoup(page_source, 'html.parser')

# Find all categories button 
categories = soup.findAll('div', class_='Components_Child__mYntX')
page_positioin = 250

for i, category in tqdm(enumerate(categories)):
    # Find all buttons within the category div
    buttons = category.find_all('button', class_='rounded-pill bg-gradient lh-1 border border-primary btn btn-light btn-sm')

    # Check if there is a button with view all
    button_view_all = category.find('button', class_='rounded-pill bg-gradient lh-1 btn btn-primary btn-sm')

    # Check if the button is not None
    if button_view_all is not None:
        get_number_of_buttons = len(buttons)
        # You can construct XPath using the button class if needed
        button_xpath = f'//*[@id="root"]/div/div[2]/div/section[2]/div/div/div[{i+1}]/div[1]/div[1]/button[{get_number_of_buttons+1}]'

        # Scroll to the button
        driver.execute_script(f"window.scrollTo(0, {str(page_positioin)});")
        time.sleep(5)

        # Click the button
        driver.find_element(By.XPATH, button_xpath).click()
        # print("Scraping:", driver.current_url)
        # Scrape the site
        scrape_site(driver, button_view_all.text)
        time.sleep(3)

        # Go back to the previous page and scroll to the button
        driver.execute_script("window.history.go(-1)")
        time.sleep(5)
        driver.execute_script(f"window.scrollTo(0, {str(page_positioin)});")
        time.sleep(5)
    else:
        for k, button in enumerate(buttons):
            # You can construct XPath using the button class if needed
            button_xpath = f'//*[@id="root"]/div/div[2]/div/section[2]/div/div/div[{i+1}]/div[1]/div[1]/button[{k+1}]'

            # Scroll to the button
            driver.execute_script(f"window.scrollTo(0, {str(page_positioin)});")
            time.sleep(7)

            # Click the button
            driver.find_element(By.XPATH, button_xpath).click()
            # print("Scraping:", driver.current_url)
            # Scrape the site
            scrape_site(driver, button.text)
            time.sleep(3)

            # Go back to the previous page and scroll to the button
            driver.execute_script("window.history.go(-1)")
            time.sleep(5)
            driver.execute_script(f"window.scrollTo(0, {str(page_positioin)});")
            time.sleep(5)
    
    # Get the page position
    if (i+1) % 3 == 0:
        page_positioin += 280
        
    i += 1

# Close the browser
driver.quit()

# Close CSV File
csv_file.close()