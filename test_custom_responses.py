"""
Test script to verify custom responses are working correctly
"""
import requests
import json

def test_custom_responses():
    base_url = "http://localhost:5000"
    
    print("🧪 Testing Custom Responses...")
    print("=" * 50)
    
    test_questions = [
        {
            "question": "How can I check if a payment request is safe?",
            "expected_contains": "verify the source before making any payment"
        },
        {
            "question": "What are the warning signs of digital payment fraud?",
            "expected_contains": "Unexpected requests for money"
        },
        {
            "question": "What should I do if I think I've been scammed?",
            "expected_contains": "Stop the transaction immediately"
        },
        {
            "question": "Can you share emergency helpline numbers?",
            "expected_contains": "Cybercrime Helpline: 1930"
        },
        {
            "question": "What are the best digital payment safety tips?",
            "expected_contains": "Never share OTP, PIN, CVV"
        },
        {
            "question": "How do I know if my transaction is secure?",
            "expected_contains": "HTTPS encryption"
        }
    ]
    
    for i, test in enumerate(test_questions, 1):
        print(f"\n{i}️⃣ Testing: '{test['question']}'")
        
        try:
            chat_data = {
                "message": test['question'],
                "user_id": "test_user"
            }
            
            response = requests.post(
                f"{base_url}/chat", 
                json=chat_data,
                headers={"Content-Type": "application/json"},
                timeout=30
            )
            
            if response.status_code == 200:
                result = response.json()
                response_text = result.get('response', '')
                
                if test['expected_contains'].lower() in response_text.lower():
                    print(f"✅ PASSED - Got expected response")
                    print(f"   Model: {result.get('model', 'unknown')}")
                    print(f"   Service: {result.get('service', 'unknown')}")
                    print(f"   Response preview: {response_text[:100]}...")
                else:
                    print(f"❌ FAILED - Response doesn't contain expected text")
                    print(f"   Expected: '{test['expected_contains']}'")
                    print(f"   Got: {response_text[:200]}...")
            else:
                print(f"❌ FAILED - HTTP {response.status_code}")
                print(f"   Response: {response.text}")
                
        except Exception as e:
            print(f"❌ ERROR - {str(e)}")
    
    print("\n" + "=" * 50)
    print("Custom response testing complete!")

if __name__ == "__main__":
    test_custom_responses()