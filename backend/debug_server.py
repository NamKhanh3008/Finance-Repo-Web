import requests

# CONFIGURATION
BASE_URL = "http://127.0.0.1:5000"
# LOGIN - Replace with valid credentials to get a real token
EMAIL = "test@example.com" 
PASSWORD = "password"

def run_diagnostics():
    print(f"--- 1. Testing Connectivity to {BASE_URL} ---")
    try:
        # 1. Check if server is up
        r = requests.get(f"{BASE_URL}/")
        print(f"Server Status: {r.status_code} (Expected 200 or 404)")
    except Exception as e:
        print(f"CRITICAL: Server is not reachable. Is it running? Error: {e}")
        return

    print("\n--- 2. Getting Auth Token ---")
    try:
        auth_res = requests.post(f"{BASE_URL}/api/auth/login", json={"email": EMAIL, "password": PASSWORD})
        if auth_res.status_code != 200:
            print(f"Login Failed: {auth_res.text}")
            return
        token = auth_res.json().get('access_token')
        headers = {"Authorization": f"Bearer {token}"}
        print("Token acquired.")
    except Exception as e:
        print(f"Login Error: {e}")
        return

    print("\n--- 3. Testing 'Temp ID' Crash ---")
    # This simulates exactly what your frontend is doing: sending a PUT to a temp ID
    # If the server crashes (500), Flask often strips CORS headers, causing the browser error.
    temp_id_url = f"{BASE_URL}/api/annotations/temp_123456"
    
    print(f"Sending PUT to: {temp_id_url}")
    try:
        # We send a PUT request to a fake ID
        res = requests.put(temp_id_url, json={"text": "Debug test"}, headers=headers)
        
        print(f"Status Code: {res.status_code}")
        print(f"Response Text: {res.text}")
        
        if res.status_code == 500:
            print(">>> DIAGNOSIS: SERVER CRASH. Your backend code does not handle string IDs like 'temp_'.")
        elif res.status_code == 404:
            print(">>> DIAGNOSIS: 404. The route exists but ID not found (Correct behavior).")
        elif res.status_code == 405:
            print(">>> DIAGNOSIS: 405 Method Not Allowed. Check your @app.route methods.")
        else:
            print(f">>> DIAGNOSIS: Unexpected status {res.status_code}")

    except Exception as e:
        print(f"Request failed: {e}")

if __name__ == "__main__":
    run_diagnostics()