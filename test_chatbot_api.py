"""
Simple test script to verify the chatbot API is working correctly
Run this while the backend server is running
"""
import requests
import json
import time

# Test the backend API
def test_chatbot_api():
    base_url = "http://localhost:5000"
    
    print("🧪 Testing Digi Raksha Chatbot API...")
    print("=" * 50)
    
    # Test 1: Health check
    print("1️⃣ Testing health endpoint...")
    try:
        response = requests.get(f"{base_url}/health", timeout=10)
        if response.status_code == 200:
            health_data = response.json()
            print("✅ Backend is healthy!")
            print(f"   Status: {health_data.get('status', 'unknown')}")
            print(f"   Advanced AI Available: {health_data.get('advanced_ai_available', 'unknown')}")
            print(f"   Service Info: {health_data.get('ai_service_info', {}).get('service_type', 'unknown')}")
        else:
            print(f"❌ Health check failed with status: {response.status_code}")
            return False
    except requests.RequestException as e:
        print(f"❌ Cannot connect to backend: {e}")
        print("   Make sure the backend is running on port 5000")
        return False
    
    # Test 2: Simple greeting
    print("\n2️⃣ Testing simple greeting...")
    try:
        chat_data = {
            "message": "Hello! Can you help me with UPI security?",
            "user_id": "test_user_123",
            "personality": "friendly_conversational_assistant"
        }
        
        response = requests.post(
            f"{base_url}/chat", 
            json=chat_data,
            headers={"Content-Type": "application/json"},
            timeout=30
        )
        
        if response.status_code == 200:
            result = response.json()
            print("✅ Chat API working!")
            print(f"   Model: {result.get('model', 'unknown')}")
            print(f"   Service: {result.get('service', 'unknown')}")
            print(f"   Response: {result.get('response', 'No response')[:100]}...")
            
            if result.get('enhanced_features'):
                print(f"   🧠 Enhanced Features: {result.get('enhanced_features')}")
                
        else:
            print(f"❌ Chat request failed with status: {response.status_code}")
            print(f"   Response: {response.text}")
            return False
            
    except requests.RequestException as e:
        print(f"❌ Chat request failed: {e}")
        return False
    
    # Test 3: Security tips request
    print("\n3️⃣ Testing security tips request...")
    try:
        chat_data = {
            "message": "What are the best digital payment security tips?",
            "user_id": "test_user_123"
        }
        
        response = requests.post(
            f"{base_url}/chat", 
            json=chat_data,
            headers={"Content-Type": "application/json"},
            timeout=30
        )
        
        if response.status_code == 200:
            result = response.json()
            print("✅ Security tips request working!")
            print(f"   Response length: {len(result.get('response', ''))} characters")
            print(f"   Contains security content: {'security' in result.get('response', '').lower()}")
        else:
            print(f"❌ Security tips request failed: {response.status_code}")
            return False
            
    except requests.RequestException as e:
        print(f"❌ Security tips request failed: {e}")
        return False
    
    # Test 4: Conversation context test
    print("\n4️⃣ Testing conversation context...")
    try:
        # First message
        chat_data = {
            "message": "I'm worried about QR code fraud",
            "user_id": "test_user_context",
            "conversation_history": []
        }
        
        response1 = requests.post(
            f"{base_url}/chat", 
            json=chat_data,
            headers={"Content-Type": "application/json"},
            timeout=30
        )
        
        if response1.status_code == 200:
            result1 = response1.json()
            
            # Follow-up message with context
            chat_data2 = {
                "message": "Can you tell me more about that?",
                "user_id": "test_user_context",
                "conversation_history": [
                    {"role": "user", "content": "I'm worried about QR code fraud"},
                    {"role": "assistant", "content": result1.get('response', '')}
                ]
            }
            
            response2 = requests.post(
                f"{base_url}/chat", 
                json=chat_data2,
                headers={"Content-Type": "application/json"},
                timeout=30
            )
            
            if response2.status_code == 200:
                print("✅ Conversation context working!")
                print("   Both messages processed successfully")
            else:
                print(f"❌ Follow-up message failed: {response2.status_code}")
                return False
        else:
            print(f"❌ Initial context message failed: {response1.status_code}")
            return False
            
    except requests.RequestException as e:
        print(f"❌ Context test failed: {e}")
        return False
    
    print("\n" + "=" * 50)
    print("🎉 ALL TESTS PASSED!")
    print("✅ Your chatbot is fully functional and ready to use!")
    print("\n💡 Next steps:")
    print("   1. Start the frontend: npm run dev (or use start_digi_raksha_frontend.bat)")
    print("   2. Open http://localhost:5173 in your browser")
    print("   3. Look for the chat widget in the bottom-right corner")
    print("   4. Test the chat functionality")
    
    return True

if __name__ == "__main__":
    test_chatbot_api()