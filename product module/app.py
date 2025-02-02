import csv
import requests

MAGENTO_REST_URL = "http://magento2.local.com/rest/V1/products"
MAGENTO_ADMIN_TOKEN = "eyJraWQiOiIxIiwiYWxnIjoiSFMyNTYifQ.eyJ1aWQiOjEsInV0eXBpZCI6MiwiaWF0IjoxNzM4NDMyNjMyLCJleHAiOjE3Mzg0MzYyMzJ9.-M2K9uaQ3NQQRk0H55ZAUwA6KrzYcGyrzbJpveaLjzE"

def import_products(csv_file):
    with open(csv_file, mode="r", encoding="utf-8") as file:
        reader = csv.DictReader(file)
        
        for row in reader:
            product_data = {
                "product": {
                    "sku": row["sku"],
                    "name": row["name"],
                    "price": float(row["price"]),
                    "status": int(row["status"]),
                    "visibility": int(row["visibility"]),
                    "type_id": row["type_id"],
                    "attribute_set_id": int(row["attribute_set_id"]),
                    "weight": float(row["weight"]),
                    "extension_attributes": {
                        "stock_item": {
                            "qty": int(row["qty"]),
                            "is_in_stock": bool(int(row["is_in_stock"])),
                            "manage_stock": True
                        }
                    },

                }
            }

            response = requests.post(
                MAGENTO_REST_URL,
                headers={
                    "Content-Type": "application/json",
                    "Authorization": f"Bearer {MAGENTO_ADMIN_TOKEN}",
                },
                json=product_data,
            )

            result = response.json()
            if "message" in result:
                print(f"Error importing product {row['sku']}: {result['message']}")
            else:
                print(f"Product {row['sku']} imported successfully!")

import_products("products.csv")
