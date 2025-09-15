import requests

# Test the updated helpline response
try:
    response = requests.post(
        "http://localhost:5000/chat", 
        json={"message": "Can you share emergency helpline numbers?"},
        headers={"Content-Type": "application/json"},
        timeout=15
    )
    
    if response.status_code == 200:
        result = response.json()
        print("✅ Updated Helpline Response:")
        print("-" * 50)
        print(result.get('response', 'No response'))
        print("-" * 50)
        print(f"Model: {result.get('model', 'unknown')}")
        print(f"Service: {result.get('service', 'unknown')}")
    else:
        print(f"❌ Error: {response.status_code}")
        print(response.text)
        
except Exception as e:
    print(f"❌ Connection Error: {e}")
    print("Make sure backend is running on port 5000")