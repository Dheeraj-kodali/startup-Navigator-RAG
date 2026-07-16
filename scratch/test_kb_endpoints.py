import requests

def main():
    print("=== STARTING KNOWLEDGE BASE API VERIFICATION ===")
    
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

    # 2. Upload Document
    print("\nUploading mock text document...")
    upload_url = "http://localhost:8000/api/v1/knowledge/upload"
    
    # Create a mock text file in memory
    files = {
        "file": ("test_doc.txt", "This is a mock knowledge document context for testing.", "text/plain")
    }
    data = {
        "title": "Test Document Title"
    }
    
    upload_resp = requests.post(upload_url, headers=headers, files=files, data=data)
    print(f"Upload Status Code: {upload_resp.status_code}")
    print("Upload Response:")
    print(upload_resp.text)
    
    if upload_resp.status_code != 200:
        print("Upload failed. Aborting remaining tests.")
        return
        
    upload_result = upload_resp.json()
    doc_id = upload_result["data"]["id"]
    print(f"Document registered successfully with ID: {doc_id}")

    # 3. List Documents
    print("\nListing all knowledge documents...")
    list_url = "http://localhost:8000/api/v1/knowledge"
    list_resp = requests.get(list_url, headers=headers)
    print(f"List Status Code: {list_resp.status_code}")
    print("List Response:")
    print(list_resp.text)

    # 4. Get Single Document Metadata
    print(f"\nRetrieving metadata for document ID: {doc_id}...")
    get_url = f"http://localhost:8000/api/v1/knowledge/{doc_id}"
    get_resp = requests.get(get_url, headers=headers)
    print(f"Get Status Code: {get_resp.status_code}")
    print("Get Response:")
    print(get_resp.text)

    # 5. Delete Document
    print(f"\nDeleting document ID: {doc_id}...")
    delete_url = f"http://localhost:8000/api/v1/knowledge/{doc_id}"
    delete_resp = requests.delete(delete_url, headers=headers)
    print(f"Delete Status Code: {delete_resp.status_code}")
    print("Delete Response:")
    print(delete_resp.text)
    
    # 6. Verify Delete
    print("\nRe-listing to verify deletion...")
    verify_resp = requests.get(list_url, headers=headers)
    print(f"Verification List Response: {verify_resp.text}")

if __name__ == "__main__":
    main()
