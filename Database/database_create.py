import sqlite3

conn = sqlite3.connect("pc_part_database.sqlite3")
cursor = conn.cursor()

# Create Store table
cursor.execute('''
    CREATE TABLE IF NOT EXISTS Store (
        store_id INTEGER PRIMARY KEY,
        store_name TEXT
    )
''')

# Create Product table
cursor.execute('''
    CREATE TABLE IF NOT EXISTS Product (
        product_id INTEGER PRIMARY KEY,
        product_name TEXT,
        product_category TEXT
    )
''')

# Create Price table
cursor.execute('''
    CREATE TABLE IF NOT EXISTS Price (
        price_id INTEGER PRIMARY KEY,
        store_id INTEGER,
        product_id INTEGER,
        date DATE,
        price DECIMAL(10, 2),
        FOREIGN KEY (store_id) REFERENCES Store(store_id),
        FOREIGN KEY (product_id) REFERENCES Product(product_id)
    )
''')

conn.commit()
conn.close()
