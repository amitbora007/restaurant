import asyncio
from motor.motor_asyncio import AsyncIOMotorClient
import os
from dotenv import load_dotenv
from pathlib import Path

ROOT_DIR = Path(__file__).parent
load_dotenv(ROOT_DIR / '.env')

mongo_url = os.environ['MONGO_URL']
db_name = os.environ['DB_NAME']

categories_data = [
    {"id": "cat_1", "name": "MOMOS", "description": "Delicious steamed and fried momos", "order": 1, "image_url": "https://images.unsplash.com/photo-1719454261026-fc7f0ffc1835?w=600&q=80"},
    {"id": "cat_2", "name": "SOUTH INDIAN", "description": "Authentic South Indian delicacies", "order": 2, "image_url": "https://images.unsplash.com/photo-1708184528306-f75a0a5118ee?w=600&q=80"},
    {"id": "cat_3", "name": "TANDOORI SNACKS", "description": "Tandoori specialties", "order": 3, "image_url": "https://images.unsplash.com/photo-1672477179695-7276b0602fa9?w=600&q=80"},
    {"id": "cat_4", "name": "BURGER", "description": "Gourmet burgers", "order": 4, "image_url": "https://images.unsplash.com/photo-1520072959219-c595dc870360?w=600&q=80"},
    {"id": "cat_5", "name": "SANDWICH", "description": "Grilled sandwiches", "order": 5, "image_url": "https://images.unsplash.com/photo-1528735602780-2552fd46c7af?w=600&q=80"},
    {"id": "cat_6", "name": "PASTA", "description": "Italian pasta dishes", "order": 6, "image_url": "https://images.unsplash.com/photo-1734356959885-54fe2e99c1cd?w=600&q=80"},
    {"id": "cat_7", "name": "CHINESE STARTER", "description": "Crispy Chinese starters", "order": 7, "image_url": "https://images.unsplash.com/photo-1551851300-1fd39219a668?w=600&q=80"},
    {"id": "cat_8", "name": "BEVERAGES", "description": "Refreshing beverages", "order": 8, "image_url": "https://images.unsplash.com/photo-1514432324607-a09d9b4aefdd?w=600&q=80"},
    {"id": "cat_9", "name": "SHAKES", "description": "Creamy shakes", "order": 9, "image_url": "https://images.unsplash.com/photo-1572490122747-3968b75cc699?w=600&q=80"},
    {"id": "cat_10", "name": "MOCKTAILS", "description": "Colorful mocktails", "order": 10, "image_url": "https://images.unsplash.com/photo-1536935338788-846bb9981813?w=600&q=80"},
    {"id": "cat_11", "name": "TANDOORI ROLLS", "description": "Tandoori rolls", "order": 11, "image_url": "https://images.unsplash.com/photo-1626074353765-517a681e40be?w=600&q=80"},
    {"id": "cat_12", "name": "CHINESE GRAVY", "description": "Chinese gravy dishes", "order": 12, "image_url": "https://images.unsplash.com/photo-1563245372-f21724e3856d?w=600&q=80"},
    {"id": "cat_13", "name": "NOODLES", "description": "Asian noodles", "order": 13, "image_url": "https://images.unsplash.com/photo-1555126634-323283e090fa?w=600&q=80"},
    {"id": "cat_14", "name": "VEG GRAVY", "description": "Indian veg curries", "order": 14, "image_url": "https://images.unsplash.com/photo-1585937421612-70a008356fbe?w=600&q=80"},
    {"id": "cat_15", "name": "BREADS", "description": "Indian breads", "order": 15, "image_url": "https://images.unsplash.com/photo-1553452118-621e1f860c74?w=600&q=80"},
    {"id": "cat_16", "name": "RICE", "description": "Rice dishes", "order": 16, "image_url": "https://images.unsplash.com/photo-1516684732162-798a0062be99?w=600&q=80"}
]

menu_items = [
    {"id": "item_1", "name": "Veg Momos", "category_id": "cat_1", "price_half": 40, "price_full": 70, "image_url": "https://images.unsplash.com/photo-1719454261026-fc7f0ffc1835?w=400&q=80", "is_available": True},
    {"id": "item_2", "name": "Veg Fried Momos", "category_id": "cat_1", "price_half": 40, "price_full": 70, "image_url": "https://images.unsplash.com/photo-1496116218417-1a781b1c416c?w=400&q=80", "is_available": True},
    {"id": "item_3", "name": "Kurkure Momos", "category_id": "cat_1", "price_half": 70, "price_full": 120, "image_url": "https://images.unsplash.com/photo-1601050690597-df0568f70950?w=400&q=80", "is_available": True},
    {"id": "item_4", "name": "Chilli Momos", "category_id": "cat_1", "price_half": 70, "price_full": 120, "image_url": "https://images.unsplash.com/photo-1534422298391-e4f8c172dddb?w=400&q=80", "is_available": True},
    {"id": "item_5", "name": "Tandoori Momos", "category_id": "cat_1", "price_half": 70, "price_full": 120, "image_url": "https://images.unsplash.com/photo-1626074353765-517a681e40be?w=400&q=80", "is_available": True},
    {"id": "item_6", "name": "Afghani Momos", "category_id": "cat_1", "price_half": 80, "price_full": 140, "image_url": "https://images.unsplash.com/photo-1604908176997-125f25cc6f3d?w=400&q=80", "is_available": True},
    {"id": "item_7", "name": "Paneer Momos", "category_id": "cat_1", "price_half": 50, "price_full": 80, "image_url": "https://images.unsplash.com/photo-1601050690597-df0568f70950?w=400&q=80", "is_available": True},
    {"id": "item_8", "name": "Paneer Fried Momos", "category_id": "cat_1", "price_half": 50, "price_full": 90, "image_url": "https://images.unsplash.com/photo-1496116218417-1a781b1c416c?w=400&q=80", "is_available": True},
    {"id": "item_9", "name": "Paneer Kurkure Momos", "category_id": "cat_1", "price_half": 80, "price_full": 150, "image_url": "https://images.unsplash.com/photo-1601050690597-df0568f70950?w=400&q=80", "is_available": True},
    {"id": "item_10", "name": "Paneer Chilli Momos", "category_id": "cat_1", "price_half": 80, "price_full": 150, "image_url": "https://images.unsplash.com/photo-1534422298391-e4f8c172dddb?w=400&q=80", "is_available": True},
    {"id": "item_11", "name": "Paneer Tandoori Momos", "category_id": "cat_1", "price_half": 80, "price_full": 150, "image_url": "https://images.unsplash.com/photo-1626074353765-517a681e40be?w=400&q=80", "is_available": True},
    {"id": "item_12", "name": "Paneer Afghani Momos", "category_id": "cat_1", "price_half": 90, "price_full": 160, "image_url": "https://images.unsplash.com/photo-1604908176997-125f25cc6f3d?w=400&q=80", "is_available": True},

    {"id": "item_13", "name": "Plain Dosa", "category_id": "cat_2", "price_full": 50, "image_url": "https://images.unsplash.com/photo-1694171761549-28c94d1f6145?w=400&q=80", "is_available": True},
    {"id": "item_14", "name": "Masala Dosa", "category_id": "cat_2", "price_full": 70, "image_url": "https://images.unsplash.com/photo-1630383249896-424e482df921?w=400&q=80", "is_available": True},
    {"id": "item_15", "name": "Paneer Dosa", "category_id": "cat_2", "price_full": 80, "image_url": "https://images.unsplash.com/photo-1668236543090-82eba5ee5976?w=400&q=80", "is_available": True},
    {"id": "item_16", "name": "Cheese Dosa", "category_id": "cat_2", "price_full": 120, "image_url": "https://images.unsplash.com/photo-1668236543089-74c29c88f06f?w=400&q=80", "is_available": True},
    {"id": "item_17", "name": "Rawa Dosa", "category_id": "cat_2", "price_full": 70, "image_url": "https://images.unsplash.com/photo-1694171761549-28c94d1f6145?w=400&q=80", "is_available": True},
    {"id": "item_18", "name": "Rawa Masala Dosa", "category_id": "cat_2", "price_full": 90, "image_url": "https://images.unsplash.com/photo-1630383249896-424e482df921?w=400&q=80", "is_available": True},
    {"id": "item_19", "name": "Schezwan Dosa", "category_id": "cat_2", "price_full": 80, "image_url": "https://images.unsplash.com/photo-1668236543090-82eba5ee5976?w=400&q=80", "is_available": True},
    {"id": "item_20", "name": "Onion Dosa", "category_id": "cat_2", "price_full": 80, "image_url": "https://images.unsplash.com/photo-1694171761549-28c94d1f6145?w=400&q=80", "is_available": True},
    {"id": "item_21", "name": "Plain Uttapam", "category_id": "cat_2", "price_full": 50, "image_url": "https://images.unsplash.com/photo-1567188040759-fb8a883dc6d8?w=400&q=80", "is_available": True},
    {"id": "item_22", "name": "Tomato Uttapam", "category_id": "cat_2", "price_full": 60, "image_url": "https://images.unsplash.com/photo-1567188040759-fb8a883dc6d8?w=400&q=80", "is_available": True},
    {"id": "item_23", "name": "Onion Uttapam", "category_id": "cat_2", "price_full": 60, "image_url": "https://images.unsplash.com/photo-1567188040759-fb8a883dc6d8?w=400&q=80", "is_available": True},
    {"id": "item_24", "name": "Tomato Onion Uttapam", "category_id": "cat_2", "price_full": 80, "image_url": "https://images.unsplash.com/photo-1567188040759-fb8a883dc6d8?w=400&q=80", "is_available": True},
    {"id": "item_25", "name": "Mendu Vada (2 Pcs)", "category_id": "cat_2", "price_full": 40, "image_url": "https://images.unsplash.com/photo-1606491956689-2ea866880c84?w=400&q=80", "is_available": True},
    {"id": "item_26", "name": "Idli (2 Pcs)", "category_id": "cat_2", "price_full": 60, "image_url": "https://images.unsplash.com/photo-1630505250781-394c68b1e7e4?w=400&q=80", "is_available": True},

    {"id": "item_27", "name": "Veg Burger", "category_id": "cat_4", "price_full": 49, "image_url": "https://images.unsplash.com/photo-1520072959219-c595dc870360?w=400&q=80", "is_available": True},
    {"id": "item_28", "name": "Veg Cheese Burger", "category_id": "cat_4", "price_full": 59, "image_url": "https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=400&q=80", "is_available": True},
    {"id": "item_29", "name": "Veg Paneer Burger", "category_id": "cat_4", "price_full": 79, "image_url": "https://images.unsplash.com/photo-1572802419224-296b0aeee0d9?w=400&q=80", "is_available": True},
    {"id": "item_30", "name": "TFJ Special Burger", "category_id": "cat_4", "price_full": 99, "image_url": "https://images.unsplash.com/photo-1550547660-d9450f859349?w=400&q=80", "is_available": True},

    {"id": "item_31", "name": "Red Sauce Pasta", "category_id": "cat_6", "price_full": 99, "image_url": "https://images.unsplash.com/photo-1621996346565-e3dbc646d9a9?w=400&q=80", "is_available": True},
    {"id": "item_32", "name": "White Sauce Pasta", "category_id": "cat_6", "price_full": 119, "image_url": "https://images.unsplash.com/photo-1611270629569-8b357cb88da9?w=400&q=80", "is_available": True},
    {"id": "item_33", "name": "Mix Sauce Pasta", "category_id": "cat_6", "price_full": 129, "image_url": "https://images.unsplash.com/photo-1734356959885-54fe2e99c1cd?w=400&q=80", "is_available": True},

    {"id": "item_34", "name": "Paneer Tikka", "category_id": "cat_3", "price_half": 120, "price_full": 230, "image_url": "https://images.unsplash.com/photo-1567188040759-fb8a883dc6d8?w=400&q=80", "is_available": True},
    {"id": "item_35", "name": "Malai Chaap", "category_id": "cat_3", "price_half": 120, "price_full": 220, "image_url": "https://images.unsplash.com/photo-1599487488170-d11ec9c172f0?w=400&q=80", "is_available": True},

    {"id": "item_36", "name": "Paneer Butter Masala", "category_id": "cat_14", "price_half": 130, "price_full": 220, "image_url": "https://images.unsplash.com/photo-1631452180519-c014fe946bc7?w=400&q=80", "is_available": True},
    {"id": "item_37", "name": "Dal Makhani", "category_id": "cat_14", "price_half": 120, "price_full": 200, "image_url": "https://images.unsplash.com/photo-1546833998-877b37c2e5c6?w=400&q=80", "is_available": True},
    {"id": "item_38", "name": "Kadhai Paneer", "category_id": "cat_14", "price_half": 120, "price_full": 220, "image_url": "https://images.unsplash.com/photo-1601050690597-df0568f70950?w=400&q=80", "is_available": True},

    {"id": "item_39", "name": "Butter Naan", "category_id": "cat_15", "price_full": 30, "image_url": "https://images.unsplash.com/photo-1553452118-621e1f860c74?w=400&q=80", "is_available": True},
    {"id": "item_40", "name": "Garlic Naan", "category_id": "cat_15", "price_full": 40, "image_url": "https://images.unsplash.com/photo-1628840042765-356cda07504e?w=400&q=80", "is_available": True},
    {"id": "item_41", "name": "Tandoori Roti", "category_id": "cat_15", "price_full": 6, "image_url": "https://images.unsplash.com/photo-1601050690597-df0568f70950?w=400&q=80", "is_available": True},

    {"id": "item_42", "name": "Veg Fried Rice", "category_id": "cat_16", "price_half": 60, "price_full": 100, "image_url": "https://images.unsplash.com/photo-1512058564366-18510be2db19?w=400&q=80", "is_available": True},
    {"id": "item_43", "name": "Jeera Rice", "category_id": "cat_16", "price_half": 50, "price_full": 80, "image_url": "https://images.unsplash.com/photo-1586201375761-83865001e31c?w=400&q=80", "is_available": True},

    {"id": "item_44", "name": "Cold Coffee", "category_id": "cat_8", "price_full": 69, "image_url": "https://images.unsplash.com/photo-1517487881594-2787fef5ebf7?w=400&q=80", "is_available": True},
    {"id": "item_45", "name": "Vanilla Shake", "category_id": "cat_9", "price_full": 70, "image_url": "https://images.unsplash.com/photo-1572490122747-3968b75cc699?w=400&q=80", "is_available": True},
    {"id": "item_46", "name": "Mango Shake", "category_id": "cat_9", "price_full": 70, "image_url": "https://images.unsplash.com/photo-1623065422902-30a2d299bbe4?w=400&q=80", "is_available": True},
    {"id": "item_47", "name": "Virgin Mojito", "category_id": "cat_10", "price_full": 60, "image_url": "https://images.unsplash.com/photo-1551538827-9c037cb4f32a?w=400&q=80", "is_available": True},

    {"id": "item_48", "name": "Chilli Paneer Dry", "category_id": "cat_7", "price_half": 100, "price_full": 180, "image_url": "https://images.unsplash.com/photo-1626074353765-517a681e40be?w=400&q=80", "is_available": True},
    {"id": "item_49", "name": "Manchurian Dry", "category_id": "cat_7", "price_half": 70, "price_full": 130, "image_url": "https://images.unsplash.com/photo-1583835746434-cf1534674e3e?w=400&q=80", "is_available": True},

    {"id": "item_50", "name": "Veg Noodles", "category_id": "cat_13", "price_half": 50, "price_full": 80, "image_url": "https://images.unsplash.com/photo-1555126634-323283e090fa?w=400&q=80", "is_available": True}
]

async def seed_database():
    client = AsyncIOMotorClient(mongo_url)
    db = client[db_name]

    await db.categories.delete_many({})
    await db.menu_items.delete_many({})

    await db.categories.insert_many(categories_data)
    await db.menu_items.insert_many(menu_items)

    print(f"Seeded {len(categories_data)} categories and {len(menu_items)} menu items")

    client.close()

if __name__ == "__main__":
    asyncio.run(seed_database())
