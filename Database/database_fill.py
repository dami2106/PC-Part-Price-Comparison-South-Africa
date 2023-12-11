import sqlite3

# Connect to SQLite database
conn = sqlite3.connect('pc_part_database.sqlite3')
cursor = conn.cursor()

# Insert data into Store table
cursor.execute("INSERT INTO Store (store_name) VALUES ('Wootware')")
cursor.execute("INSERT INTO Store (store_name) VALUES ('Evetech')")

# Insert data into Product table
cursor.execute("INSERT INTO Product (product_name, product_category) VALUES ('Palit Nvidia RTX 4090 24GB', 'Graphics Card')")
cursor.execute("INSERT INTO Product (product_name, product_category) VALUES ('Intel i5 13600K 5Ghz', 'Processor')")

# Insert data into Price table
cursor.execute("INSERT INTO Price (store_id, product_id, date, price) VALUES (1, 1, '2023-01-01', 44999.00)")
cursor.execute("INSERT INTO Price (store_id, product_id, date, price) VALUES (1, 2, '2023-01-01', 8999.99)")
cursor.execute("INSERT INTO Price (store_id, product_id, date, price) VALUES (2, 1, '2023-01-01', 43999.00)")

# Commit changes and close connection
conn.commit()
conn.close()
