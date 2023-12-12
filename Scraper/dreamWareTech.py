from bs4 import BeautifulSoup
import requests
import pandas as pd
import warnings
import time 
from datetime import datetime

# datetime object containing current date and time
now = datetime.now()

# dd/mm/YY H:M:S
dt_string = now.strftime("%d-%m-%Y_%H%M")

pd.options.mode.chained_assignment = None
warnings.simplefilter(action='ignore', category=FutureWarning)

# Get the content of the home page
home_url = 'https://www.dreamwaretech.co.za/c/computer-components/'
home_content = requests.get(home_url, headers={"User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36"})
home_soup = BeautifulSoup(home_content.content, 'html.parser')

# Get all the categories
categories = home_soup.findAll('div', class_='col-md-6 col-lg-4')

# Store all links that we need to scrape
links = []

# Skip the first link 
for cate in categories[1:]:
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

# Create a dataframe to store the data
url_to_scrape = links
df = pd.DataFrame(columns=["Title", "Price", "In Stock", "Category"])

# Loop through all the links and scrape the data
for elem in url_to_scrape:
    base_url = elem[0]
    category = elem[1]

    paging = True
    url = base_url + ""
    
    # Loop through all the pages
    while paging:
        # Get the content of the page
        html_content = requests.get(url, headers={"User-Agent": "Mozilla/5.0"})
        soup = BeautifulSoup(html_content.text)
        divs = soup.find_all("div", class_= "product card")

        print("Scraping :" + url)
        
        # Loop through all the products on the page
        for product in divs:
            price = -99
            if product.find("p", class_="product-price").text.split(' ')[1] != "TBC":
                price = float(product.find("p", class_="product-price").text.split(' ')[1].replace('R', ''))
            title = product.find("p", class_="product-box-name").find("a").get("href").split("/")[-2].replace("-", " ")
            in_stock = True if "with supplier" in product.find("p", class_="prod-availability").text.lower() else False
        
            df = pd.concat([df, pd.DataFrame({"Title": title, "Price": price, "In Stock": in_stock, "Category": category}, index=[0])], ignore_index=True)
        
        # Check if there is a next page
        if soup.find("p", id="next-nav"):
            paging = True if soup.find("p", id="next-nav").text in "Last" else False
            next_page_url = soup.find("a", id="a-next-nav").get("href")

            if next_page_url:
                url = base_url + next_page_url
            else:
                paging = False
        else:
            paging = False
        
        time.sleep(2)
    
    time.sleep(5)

df.to_csv(f'../Products/{dt_string}_DreamWareTech.csv', index=False)