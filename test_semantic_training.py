"""
Test script to verify semantic matching works for all new training data
Tests both exact questions and variations that should match
"""
import requests
import time

def test_semantic_responses():
    base_url = "http://localhost:5000"
    
    print("🧪 Testing Semantic AI Training...")
    print("=" * 60)
    
    # Test cases with variations that should match
    test_cases = [
        {
            "category": "Fake Apps",
            "variations": [
                "How can I spot a fake payment app?",  # Exact
                "How do I identify fake apps?",        # Variation
                "Tell me about fake payment apps",     # Different structure
                "Payment app safety tips"              # Related concept
            ],
            "expected_contains": "official app stores"
        },
        {
            "category": "Card Details Storage", 
            "variations": [
                "Is it safe to save my card details online?",  # Exact
                "Should I store my card information?",         # Variation
                "Can I keep my payment details saved?",        # Different wording
                "Auto save card details safe?"                 # Short form
            ],
            "expected_contains": "safer not to"
        },
        {
            "category": "OTP Accidentally Shared",
            "variations": [
                "What should I do if I accidentally shared my OTP?",  # Exact
                "I gave someone my OTP by mistake",                   # Variation
                "Told my OTP to scammer",                            # Different scenario
                "OTP compromised what to do"                         # Urgent form
            ],
            "expected_contains": "Call your bank"
        },
        {
            "category": "QR Code Scams",
            "variations": [
                "What are common QR code scams?",      # Exact
                "Tell me about QR fraud",             # Variation
                "QR code tricks scammers use",        # Different structure
                "Fake QR codes how to spot"           # Mixed keywords
            ],
            "expected_contains": "scanning actually makes you pay"
        },
        {
            "category": "Money Recovery",
            "variations": [
                "Can I get my money back after being scammed online?",  # Exact
                "Will I recover my money from fraud?",                  # Variation
                "Getting money back from scammers",                     # Different structure
                "Refund after online fraud"                             # Related concept
            ],
            "expected_contains": "if you report quickly"
        }
    ]
    
    total_tests = 0
    passed_tests = 0
    
    for category_data in test_cases:
        category = category_data["category"]
        variations = category_data["variations"]
        expected_text = category_data["expected_contains"]
        
        print(f"\n📂 Testing {category}:")
        print("-" * 40)
        
        for i, question in enumerate(variations, 1):
            total_tests += 1
            print(f"  {i}. '{question}'")
            
            try:
                response = requests.post(
                    f"{base_url}/chat",
                    json={"message": question},
                    headers={"Content-Type": "application/json"},
                    timeout=20
                )
                
                if response.status_code == 200:
                    result = response.json()
                    response_text = result.get('response', '')
                    
                    if expected_text.lower() in response_text.lower():
                        print(f"     ✅ PASSED - Semantic match found")
                        print(f"     📝 Model: {result.get('model', 'unknown')}")
                        passed_tests += 1
                    else:
                        print(f"     ❌ FAILED - No semantic match")
                        print(f"     📄 Response: {response_text[:100]}...")
                else:
                    print(f"     ❌ HTTP ERROR - {response.status_code}")
                    
            except requests.exceptions.Timeout:
                print(f"     ⏱️ TIMEOUT - Backend may be busy")
            except Exception as e:
                print(f"     ❌ ERROR - {str(e)}")
            
            time.sleep(1)  # Brief pause between requests
    
    print("\n" + "=" * 60)
    print(f"🎯 SEMANTIC TRAINING TEST RESULTS:")
    print(f"✅ Passed: {passed_tests}/{total_tests}")
    print(f"📊 Success Rate: {(passed_tests/total_tests)*100:.1f}%")
    
    if passed_tests >= total_tests * 0.8:  # 80% success rate
        print("🎉 EXCELLENT! AI shows strong semantic understanding")
    elif passed_tests >= total_tests * 0.6:  # 60% success rate
        print("👍 GOOD! AI shows reasonable semantic matching")
    else:
        print("🔧 NEEDS WORK! AI needs better semantic training")
    
    return passed_tests, total_tests

if __name__ == "__main__":
    test_semantic_responses()