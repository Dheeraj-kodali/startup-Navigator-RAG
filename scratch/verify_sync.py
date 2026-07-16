import requests
import time

def main():
    print("=== STARTING CHROMADB AUTOMATIC SYNCHRONIZATION VERIFICATION ===")
    
    # 1. Login as Admin
    login_url = "http://localhost:8000/api/v1/auth/login"
    login_payload = {
        "email": "admin@startupnavigator.com",
        "password": "SuperSecretAdminPassword123!"
    }
    
    print("\nAttempting login as admin...")
    login_resp = requests.post(login_url, json=login_payload)
    if login_resp.status_code != 200:
        print(f"Login failed: {login_resp.status_code} - {login_resp.text}")
        return
        
    login_data = login_resp.json()
    token = login_data["data"]["access_token"]
    print("Login successful! Token acquired.")
    
    headers = {
        "Authorization": f"Bearer {token}"
    }

    # Fetch Categories to get a valid category_id
    print("\nFetching categories...")
    cat_url = "http://localhost:8000/api/v1/categories"
    cat_resp = requests.get(cat_url)
    cat_data = cat_resp.json()
    category_id = cat_data["data"][0]["id"]
    print(f"Using category ID: {category_id}")

    # ==========================================
    # ARTICLE CRUD TESTING
    # ==========================================
    
    # 2. Create Article
    print("\n1. Creating Article...")
    article_create_url = "http://localhost:8000/api/v1/admin/articles"
    article_payload = {
        "category_id": category_id,
        "title": "Chroma Sync Test Article",
        "excerpt": "This is a temporary test article for verifying ChromaDB synchronization.",
        "content_markdown": "Detailed content for ChromaDB synchronization checks.",
        "status": "published",
        "is_featured": False
    }
    art_resp = requests.post(article_create_url, headers=headers, json=article_payload)
    print(f"Article Create Status Code: {art_resp.status_code}")
    if art_resp.status_code not in (200, 201):
        print(art_resp.text)
        return
    article_id = art_resp.json()["data"]["id"]
    print(f"Created Article ID: {article_id}")
    
    # Wait a moment for background task to execute
    time.sleep(2)

    # 3. Edit Article
    print("\n2. Editing Article...")
    article_update_url = f"http://localhost:8000/api/v1/admin/articles/{article_id}"
    article_update_payload = {
        "title": "Chroma Sync Test Article UPDATED",
        "content_markdown": "Detailed content for ChromaDB synchronization checks. UPDATED VERSION.",
        "change_summary": "Testing editing flow"
    }
    art_update_resp = requests.patch(article_update_url, headers=headers, json=article_update_payload)
    print(f"Article Update Status Code: {art_update_resp.status_code}")
    if art_update_resp.status_code not in (200, 201):
        print(art_update_resp.text)
    
    # Wait a moment for background task to execute
    time.sleep(2)

    # 4. Delete Article
    print("\n3. Deleting Article...")
    article_delete_url = f"http://localhost:8000/api/v1/admin/articles/{article_id}"
    art_delete_resp = requests.delete(article_delete_url, headers=headers)
    print(f"Article Delete Status Code: {art_delete_resp.status_code}")

    # Wait a moment for background task to execute
    time.sleep(2)

    # ==========================================
    # RESOURCE CRUD TESTING
    # ==========================================

    # 5. Create Resource
    print("\n4. Creating Resource...")
    resource_create_url = "http://localhost:8000/api/v1/admin/resources"
    resource_payload = {
        "category_id": category_id,
        "title": "Chroma Sync Test Resource",
        "description": "This is a temporary test resource for verifying ChromaDB synchronization.",
        "url": "https://example.com/sync-test",
        "resource_type": "link",
        "icon": "globe",
        "is_featured": False,
        "sort_order": 99
    }
    res_resp = requests.post(resource_create_url, headers=headers, json=resource_payload)
    print(f"Resource Create Status Code: {res_resp.status_code}")
    if res_resp.status_code not in (200, 201):
        print(res_resp.text)
        return
    resource_id = res_resp.json()["data"]["id"]
    print(f"Created Resource ID: {resource_id}")

    # Wait a moment for background task to execute
    time.sleep(2)

    # 6. Edit Resource
    print("\n5. Editing Resource...")
    resource_update_url = f"http://localhost:8000/api/v1/admin/resources/{resource_id}"
    resource_update_payload = {
        "title": "Chroma Sync Test Resource UPDATED",
        "description": "This is a temporary test resource for verifying ChromaDB synchronization. UPDATED.",
    }
    res_update_resp = requests.patch(resource_update_url, headers=headers, json=resource_update_payload)
    print(f"Resource Update Status Code: {res_update_resp.status_code}")
    if res_update_resp.status_code not in (200, 201):
        print(res_update_resp.text)

    # Wait a moment for background task to execute
    time.sleep(2)

    # 7. Delete Resource
    print("\n6. Deleting Resource...")
    resource_delete_url = f"http://localhost:8000/api/v1/admin/resources/{resource_id}"
    res_delete_resp = requests.delete(resource_delete_url, headers=headers)
    print(f"Resource Delete Status Code: {res_delete_resp.status_code}")

    # Wait a moment for background task to execute
    time.sleep(2)

    print("\n=== VERIFICATION RUN COMPLETED ===")

if __name__ == "__main__":
    main()
