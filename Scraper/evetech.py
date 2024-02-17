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

# datetime object containing current date and time
now = datetime.now()

# dd/mm/YY H:M:S
dt_string = now.strftime("%d-%m-%Y")

# Set up Chrome options for headless mode and different user agent
chrome_options = Options()
chrome_options.add_argument('--headless')  # Enable headless mode
# chrome_options.add_argument("--disable-gpu")
# chrome_options.add_argument('user-agent=Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36')
chrome_options.add_argument('log-level=3')

# Create a webdriver instance with the specified options
driver = webdriver.Chrome(options=chrome_options)

# Navigate to the desired website
url = 'https://www.evetech.co.za/components.aspx'
driver.get(url)

mainURL = 'https://www.evetech.co.za'
all_data = []

def scrape_site(driver,categories):
    time.sleep(5)
    # Get the page source (HTML content)
    page_source = driver.page_source

    # Use BeautifulSoup to parse the HTML
    soup = BeautifulSoup(page_source, 'html.parser')
    print("Scraping:", soup)

    #Product category
    product_category = soup.find('div',class_='d-block cols-12 gap-2 gap-sm-3 comp-top-section')
    product_category = product_category.findAll('div', class_='detail')
    get_len_of_product_category = len(product_category)
    if len(product_category) < 1:
        product_category = categories
    else:
        product_category = product_category[get_len_of_product_category-1].find('h1').text

    # Find the number of product
    products = soup.findAll('div', class_='ComponentCard_Products__Card__SJT5q ComponentCard_HoverGrow__Q2lEZ shadow overflow-hidden h-100 gap-2 position-relative card')
    print("Number of products:", len(products))

    for i in products:
        # Get the product name and price and availability 
        product_names = i.find('h3', class_="fs-6 fw-2 lh-1 m-0 overflow-hidden h-100").text.strip()
        product_price = int(i.find('div', class_="ComponentCard_Products__Price__SG2mn fw-3 fs-3 flex-shrink-0").text.replace("R ", "").strip())

        product_availiable_text = str(i.find('span', class_="fw-1 fs-6 text-wrap").text.strip())
        # print(product_availiable_text)
        product_availiablity = True if product_availiable_text.__contains__("In Stock") else False

        # Get the product URL
        product_url = mainURL + i.find('a')['href']

        all_data.append([product_names, product_price, product_availiablity, product_category, product_url])
        # print(product_names, ": ", product_price, ": ", product_availiablity,": ", product_category)

# Get the page source (HTML content)
page_source = driver.page_source

# Use BeautifulSoup to parse the HTML
soup = BeautifulSoup(page_source, 'html.parser')

# Find all categories button 
categories = soup.findAll('div', class_='Components_Child__mYntX Components_HoverGrow__br6Zs position-relative')
page_positioin = 250

for i, category in enumerate(categories):
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
        print("Scraping:", driver.current_url)
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
            print("Scraping:", driver.current_url)
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
        page_positioin += 250
        
    i += 1

# Close the browser
driver.quit()
# Define the folder and subfolder paths
folder_path = '../Products/'
subfolder_path = f'{folder_path}{dt_string}/'

# Check if the subfolder exists, and create it if it doesn't
if not os.path.exists(subfolder_path):
    os.makedirs(subfolder_path)

# Write the data to csv file
with open(f'{subfolder_path}{dt_string}_Evetech.csv', 'w', newline='', encoding='utf-8') as f:
    writer = csv.writer(f)
    writer.writerow(['Title','Price','In Stock','Category','URL'])
    writer.writerows(all_data)