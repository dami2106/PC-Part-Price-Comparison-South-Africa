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

# All the links to the categories
All_links = [
    ['https://www.takealot.com/computers/cpu-26419','CPU'],
    ['https://www.takealot.com/computers/motherboards-26423','Motherboard'],
    ['https://www.takealot.com/computers/power-supplies-26425','Power Supplies'],
    ['https://www.takealot.com/computers/computer-memory-ram-26418','RAM'],
    ['https://www.takealot.com/computers/graphics-cards-26421','Graphics Card'],
    ['https://www.takealot.com/all?_sb=1&_r=1&qsearch=HDD&via=suggestions&_si=bc15f929dc10b77b309874df29ef4558','HDD'],
    ['https://www.takealot.com/all?_sb=1&_r=1&qsearch=SSD&via=suggestions&_si=bc15f929dc10b77b309874df29ef4558','SSD'],
    ['https://www.takealot.com/all?_sb=1&_r=1&qsearch=NVME&via=suggestions&_si=bc15f929dc10b77b309874df29ef4558','NVME'],
    ['https://www.takealot.com/all?_sb=1&_r=1&qsearch=SATA&via=suggestions&_si=bc15f929dc10b77b309874df29ef4558','SATA'],
    ['https://www.takealot.com/computers/cases-and-chassis-26416','Chasis'],
    ['https://www.takealot.com/computers/interface-cards-26422','Interface Cards'],
    ['https://www.takealot.com/computers/sound-cards-26426','Sound Cards'],
    ['https://www.takealot.com/computers/optical-drives-26424','Optical Drives'],
    ['https://www.takealot.com/computers/fans-and-cooling-26420','Fans and Cooling'],
    ['https://www.takealot.com/computers/computer-monitors-27167','Monitor'],
    ['https://www.takealot.com/computers/mouse-and-presentation-26412','Mouse'],
    ['https://www.takealot.com/computers/keyboards-26410','Keyboard'],
    ['https://www.takealot.com/computers/headsets-and-microphones-26409','Headset'],
    ['https://www.takealot.com/computers/computer-speakers-26407','Speakers'],
    ['https://www.takealot.com/computers/webcams-26413','Webcam'],
    ['https://www.takealot.com/computers/mouse-pads-26404','Mouse Pad']
]

# Create csv file
all_data = []

# Set up Chrome options for headless mode and different user agent
chrome_options = Options()
chrome_options.add_argument('--headless')  # Enable headless mode
# chrome_options.add_argument("--disable-gpu")
chrome_options.add_argument("--enable-features=SameSiteByDefaultCookies,CookiesWithoutSameSiteMustBeSecure")
chrome_options.add_argument('log-level=3')

# 
main_url = "https://www.takealot.com"

# Create a webdriver instance with the specified options
driver = webdriver.Chrome(options=chrome_options)

# Iterate through the categories
for i in tqdm(All_links):
    URL = i[0]
    Category = i[1]

    # Fetch the URL
    driver.get(URL)

    # Wait for the page to fully load
    time.sleep(5)   
    while True:
        # Scroll down to bottom
        driver.execute_script("window.scrollTo(0, document.body.scrollHeight);")
        time.sleep(3)
        # Wait to load page
        if driver.find_elements(By.XPATH, '//button[@class="button ghost search-listings-module_load-more_OwyvW"]')==[]:
            break

        driver.execute_script("window.scrollTo(0, document.body.scrollHeight);")
        time.sleep(3)
        # find the load more button
        load_more_button = driver.find_element(By.XPATH, '//button[@class="button ghost search-listings-module_load-more_OwyvW"]')
        load_more_button.click()
        time.sleep(3)
    
    # Get the page source (HTML content)
    page_source = driver.page_source

    # Use BeautifulSoup to parse the HTML
    soup = BeautifulSoup(page_source, 'html.parser')

    # Find all product 
    all_product = soup.findAll('div', class_="product-card product-card-module_product-card_fdqa8")
    # print('Scraping '+Category+' with '+str(len(all_product))+' products :'+URL)
    time.sleep(5)
    for j in all_product:
        price = j.find('li', class_="price product-card-module_price_zVU6d").text.strip().replace('R ','').replace(',','')
        name = j.find('h4', class_="product-title").text.strip()
        if j.find('div', class_="cell shrink stock-availability-status") != None:
            availability = j.find('div', class_="cell shrink stock-availability-status").text.strip()
        else:
            availability = 'In Stock'
        
        productURL = main_url+j.find('a', class_="product-anchor")['href']
        all_data.append([name,price,availability,Category, productURL])
    
driver.quit()

# Define the folder and subfolder paths
folder_path = '../Data/'
subfolder_path = f'{folder_path}/'

# Check if the subfolder exists, and create it if it doesn't
if not os.path.exists(subfolder_path):
    os.makedirs(subfolder_path)

# Write the data to csv file
with open(f'{subfolder_path}3_Takealot.csv', 'w', newline='', encoding='utf-8') as f:
    writer = csv.writer(f)
    writer.writerow(['Title','Price','In Stock','Category', 'URL'])
    writer.writerows(all_data)