import numpy as np 
import pandas as pd 
import os 
import string
data_location = ''
raw_data_location = data_location + 'Raw/'
processed_data_location = data_location + 'Processed/'

data_sources = os.listdir(raw_data_location)
data_sources.sort()

dreamware = pd.read_csv(raw_data_location + data_sources[0])
evetech = pd.read_csv(raw_data_location + data_sources[1])
rebeltech = pd.read_csv(raw_data_location + data_sources[2])
takealot = pd.read_csv(raw_data_location + data_sources[3])
wootware = pd.read_csv(raw_data_location + data_sources[4])
progenix = pd.read_csv(raw_data_location + data_sources[5])
titancie = pd.read_csv(raw_data_location + data_sources[6])


dreamware['Category'] = dreamware['Category'].replace('Processors (CPUs)', 'CPU')
dreamware['Category'] = dreamware['Category'].replace('Graphics Cards (GPUs)', 'GPU')
dreamware['Category'] = dreamware['Category'].replace('Strorage', 'Storage')
dreamware['Category'] = dreamware['Category'].replace('Motherboards', 'Motherboard')
dreamware['Category'] = dreamware['Category'].replace('Memory (RAM)', 'RAM')
dreamware['Category'] = dreamware['Category'].replace('Power Supplies (PSUs)', 'PSU')
dreamware['Category'] = dreamware['Category'].replace('PC Cases/Chassis', 'Chassis')
dreamware['Category'] = dreamware['Category'].replace('Computer Cooling', 'Cooler')


rebeltech['Category'] = rebeltech['Category'].replace('CPUs / Processors', 'CPU')
rebeltech['Category'] = rebeltech['Category'].replace('Motherboards', 'Motherboard')
rebeltech['Category'] = rebeltech['Category'].replace('RAM / Memory', 'RAM')
rebeltech['Category'] = rebeltech['Category'].replace('GPUs / Graphics Cards', 'GPU')
rebeltech['Category'] = rebeltech['Category'].replace('Cases / Chassis', 'Chassis')
rebeltech['Category'] = rebeltech['Category'].replace('PSUs / Power Supplies', 'PSU')
rebeltech['Category'] = rebeltech['Category'].replace('SSDs / Solid State Drives', 'Storage')
rebeltech['Category'] = rebeltech['Category'].replace('HDDs / Hard Drives', 'Storage')
rebeltech['Category'] = rebeltech['Category'].replace('Fans / Cooling', 'Cooler')


evetech['Category'] = evetech['Category'].replace('Case Fans', 'Cooler')
evetech['Category'] = evetech['Category'].replace('Fractal Design Cases', 'Chassis')
evetech['Category'] = evetech['Category'].replace('ASUS Gaming Cases', 'Chassis')
evetech['Category'] = evetech['Category'].replace('Antec Gaming Cases', 'Chassis')
evetech['Category'] = evetech['Category'].replace('Corsair Gaming Cases', 'Chassis')
evetech['Category'] = evetech['Category'].replace('CPU Coolers', 'Cooler')
evetech['Category'] = evetech['Category'].replace('AMD RYZEN CPUs', 'CPU')
evetech['Category'] = evetech['Category'].replace('INTEL CPU', 'CPU')
evetech['Category'] = evetech['Category'].replace('Gamdias Gaming Keyboards', 'Keyboard')
evetech['Category'] = evetech['Category'].replace('Logitech Gaming Keyboards', 'Keyboard')
evetech['Category'] = evetech['Category'].replace('Corsair Gaming Keyboards', 'Keyboard')
evetech['Category'] = evetech['Category'].replace('Arozzi Gaming Mouse', 'Mouse')
evetech['Category'] = evetech['Category'].replace('Glorious Gaming Mouse', 'Mouse')
evetech['Category'] = evetech['Category'].replace('Logitech Gaming Mouse', 'Mouse')
evetech['Category'] = evetech['Category'].replace(['Corsair Gaming Mice', 'Steelseries Gaming Mouse'], 'Mouse')
evetech['Category'] = evetech['Category'].replace('Graphics Cards', 'GPU')
evetech['Category'] = evetech['Category'].replace(['Logitech Gaming Headsets', 'Corsair Gaming Headsets','Steelseries Headsets & Headphones', 'RAZER Headset & Headphones'], 'Headset')
evetech['Category'] = evetech['Category'].replace('Memory (RAM)', 'RAM')
evetech['Category'] = evetech['Category'].replace('Motherboards', 'Motherboard')
evetech['Category'] = evetech['Category'].replace('Power Supply (PSU)', 'PSU')
evetech['Category'] = evetech['Category'].replace('Solid State Drives (SSD)', 'Storage')
evetech['Category'] = evetech['Category'].replace('External Portable SSDs (Solid State Drives)', 'Storage')


takealot['In Stock'] = takealot['In Stock'].replace(['In Stock',  'Ships in 5 - 7 work days', 'Ships in 4 - 6 work days',
       'In stock', 'Ships in 8 - 10 work days',
       'Ships in 7 - 9 work days', 'Unboxed stock available', 'Ships in 3 - 5 work days',
       'Ships in 7 - 10 work days'],True)

takealot['In Stock'] = takealot['In Stock'].replace(['Supplier out of stock'],False)

takealot['Category'] = takealot['Category'].replace('Power Supplies', 'PSU')
takealot['Category'] = takealot['Category'].replace('Graphics Card', 'GPU')
takealot['Category'] = takealot['Category'].replace('Chasis', 'Chassis')
takealot['Category'] = takealot['Category'].replace('HDD', 'Storage')
takealot['Category'] = takealot['Category'].replace('SSD', 'Storage')
takealot['Category'] = takealot['Category'].replace('NVME', 'Storage')
takealot['Category'] = takealot['Category'].replace('SATA', 'Storage')
takealot['Category'] = takealot['Category'].replace('Memory', 'RAM')
takealot['Category'] = takealot['Category'].replace('Fans and Cooling', 'Cooler')


wootware['Category'] = wootware['Category'].replace('Graphics Cards', 'GPU')
wootware['Category'] = wootware['Category'].replace('Processors / CPUs', 'CPU')
wootware['Category'] = wootware['Category'].replace('Memory / RAM', 'RAM')
wootware['Category'] = wootware['Category'].replace('Motherboards', 'Motherboard')
wootware['Category'] = wootware['Category'].replace('Power Supplies / PSUs', 'PSU')
wootware['Category'] = wootware['Category'].replace('Cases / Chassis', 'Chassis')
wootware['Category'] = wootware['Category'].replace('Solid State Drives / SSDs', 'Storage')
wootware['Category'] = wootware['Category'].replace('Internal Hard Drives / HDDs', 'Storage')
wootware['Category'] = wootware['Category'].replace('External Hard Drives / HDDs', 'Storage')
wootware['Category'] = wootware['Category'].replace('Fans & CPU Coolers', 'Cooler')
wootware['Category'] = wootware['Category'].replace('Water / Liquid Cooling', 'Cooler')


def format_title(title):
    title = title.lower()
    title.replace('-', ' ')
    title.replace(',', ' ')
    title.replace('.', ' ')
    title.replace('(', '')
    title.replace(')', '')
    title.replace('[', '')
    title.replace(']', '')

    return title

#Format title of all dataframes:
dreamware['Title'] = dreamware['Title'].apply(format_title)
evetech['Title'] = evetech['Title'].apply(format_title)
rebeltech['Title'] = rebeltech['Title'].apply(format_title)
takealot['Title'] = takealot['Title'].apply(format_title)
wootware['Title'] = wootware['Title'].apply(format_title)
progenix['Title'] = progenix['Title'].apply(format_title)
titancie['Title'] = titancie['Title'].apply(format_title)


#Save updated dataframes
dreamware.to_csv(processed_data_location+'0_dreamware.csv', index=False)
evetech.to_csv(processed_data_location+'1_evetech.csv', index=False)
rebeltech.to_csv(processed_data_location+'2_rebeltech.csv', index=False)
takealot.to_csv(processed_data_location+'3_takealot.csv', index=False)
wootware.to_csv(processed_data_location+'4_wootware.csv', index=False)
progenix.to_csv(processed_data_location+'5_progenix.csv', index=False)
titancie.to_csv(processed_data_location+'6_titancie.csv', index=False)



