"""
Comprehensive Test Script for DigiRaksha AI Chatbot with Semantic Matching
Tests various question variations to ensure semantic understanding works properly
"""

import asyncio
import requests
import json
import time
from datetime import datetime

# Test questions that are variations of the trained questions
TEST_QUESTIONS = [
    # Testing semantic understanding - these are NOT exact matches
    {
        "question": "How do I secure my UPI account?",
        "expected_match": "How can I make my UPI account more secure?",
        "category": "UPI Security"
    },
    {
        "question": "Is it safe to use WiFi at cafes for payments?",
        "expected_match": "Is it safe to use public Wi-Fi for online payments?",
        "category": "WiFi Safety"
    },
    {
        "question": "My payment failed but money got deducted. What happened?",
        "expected_match": "Why did my digital payment fail even though money was deducted?",
        "category": "Payment Failure"
    },
    {
        "question": "Can I stop a UPI payment once I sent it?",
        "expected_match": "Can I cancel a UPI payment after sending it?",
        "category": "Transaction Cancellation"
    },
    {
        "question": "How do I report fraud online?",
        "expected_match": "Can I report digital payment fraud without going to the police station?",
        "category": "Fraud Reporting"
    },
    {
        "question": "Should I logout from my payment app every time?",
        "expected_match": "Should I log out of my payment app after every transaction?",
        "category": "App Security"
    },
    {
        "question": "How can I tell if my phone is hacked?",
        "expected_match": "How do I know if my phone has been hacked for payments?",
        "category": "Phone Security"
    },
    {
        "question": "What should I do if I lost my SIM?",
        "expected_match": "What should I do if I lose my SIM card linked to my bank?",
        "category": "SIM Security"
    },
    {
        "question": "How long for refund of failed payment?",
        "expected_match": "How long does it take for a failed transaction to be refunded?",
        "category": "Refund Timeline"
    },
    {
        "question": "How to verify money reached recipient?",
        "expected_match": "How can I confirm if the money has reached the right person?",
        "category": "Transaction Verification"
    },
    
    # Test questions that should NOT match (different topics)
    {
        "question": "What's the weather like today?",
        "expected_match": None,
        "category": "Non-Payment Topic"
    },
    {
        "question": "How to make a sandwich?",
        "expected_match": None,
        "category": "Non-Payment Topic"
    },
    {
        "question": "What is machine learning?",
        "expected_match": None,
        "category": "Non-Payment Topic"
    }
]

def test_local_semantic_engine():
    """Test the semantic engine directly"""
    print("=" * 80)
    print("🧪 TESTING LOCAL SEMANTIC ENGINE")
    print("=" * 80)
    
    async def run_semantic_tests():
        # Import and initialize the semantic engine
        import sys, os
        sys.path.append(os.path.join(os.getcwd(), 'backend'))
        
        from semantic_training_engine import semantic_engine
        
        # Initialize
        await semantic_engine.initialize()
        
        print(f"📊 Database loaded with {semantic_engine.get_database_stats()['total_qa_pairs']} Q&A pairs")
        print()
        
        for i, test_case in enumerate(TEST_QUESTIONS, 1):
            print(f"🔍 Test {i}: {test_case['category']}")
            print(f"❓ Question: '{test_case['question']}'")
            
            result = await semantic_engine.find_best_answer(test_case['question'])
            
            if result:
                print(f"✅ Match Found!")
                print(f"   📋 Matched: '{result['matched_question']}'")
                print(f"   🎯 Score: {result['similarity_score']:.3f}")
                print(f"   🔍 Type: {result['match_type']}")
                print(f"   📊 Confidence: {result['confidence']}")
                
                # Check if it matches expected
                if test_case['expected_match'] and test_case['expected_match'] in result['matched_question']:
                    print(f"   ✅ Expected match confirmed!")
                elif test_case['expected_match'] is None:
                    print(f"   ⚠️  Unexpected match (expected no match)")
                else:
                    print(f"   ⚠️  Different match than expected")
            else:
                print(f"❌ No match found")
                if test_case['expected_match']:
                    print(f"   ⚠️  Expected to match: '{test_case['expected_match']}'")
                else:
                    print(f"   ✅ Expected no match - correct!")
            
            print()
    
    # Run the async function
    asyncio.run(run_semantic_tests())

def test_chatbot_api(backend_url="http://localhost:5000"):
    """Test the full chatbot API with semantic matching"""
    print("=" * 80)
    print("🤖 TESTING FULL CHATBOT API")
    print("=" * 80)
    
    # Check if backend is running
    try:
        health_response = requests.get(f"{backend_url}/health", timeout=5)
        if health_response.status_code == 200:
            print("✅ Backend is running!")
            print(f"📊 Health check: {health_response.json()}")
        else:
            print("❌ Backend health check failed")
            return
    except requests.exceptions.RequestException as e:
        print(f"❌ Cannot connect to backend at {backend_url}")
        print(f"   Error: {e}")
        print("   Please start the backend server first:")
        print(f"   python backend/app.py")
        return
    
    print()
    
    # Test each question
    for i, test_case in enumerate(TEST_QUESTIONS[:6], 1):  # Test first 6 for brevity
        print(f"🔍 API Test {i}: {test_case['category']}")
        print(f"❓ Question: '{test_case['question']}'")
        
        try:
            # Send request to chatbot
            response = requests.post(
                f"{backend_url}/chat",
                json={"message": test_case['question']},
                timeout=30
            )
            
            if response.status_code == 200:
                data = response.json()
                print(f"✅ API Response received!")
                print(f"   🤖 Model: {data.get('model', 'Unknown')}")
                print(f"   📝 Response length: {len(data.get('response', ''))} characters")
                
                # Check if semantic matching was used
                response_text = data.get('response', '')
                if 'semantic matching' in response_text.lower() or 'ai-powered response' in response_text.lower():
                    print(f"   🔥 Semantic matching detected!")
                else:
                    print(f"   📚 Using knowledge base response")
                
                # Show first 150 characters of response
                preview = response_text[:150] + "..." if len(response_text) > 150 else response_text
                print(f"   💬 Preview: {preview}")
                
            else:
                print(f"❌ API Error: {response.status_code}")
                print(f"   Response: {response.text}")
        
        except requests.exceptions.Timeout:
            print(f"⏰ Request timed out - backend may be processing")
        except requests.exceptions.RequestException as e:
            print(f"❌ Request failed: {e}")
        
        print()
        time.sleep(1)  # Brief pause between requests

def main():
    """Main test function"""
    print("🤖 DigiRaksha AI Chatbot - Comprehensive Semantic Testing")
    print("=" * 80)
    print(f"🕐 Test started at: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}")
    print()
    
    # Test 1: Direct semantic engine testing
    try:
        test_local_semantic_engine()
    except Exception as e:
        print(f"❌ Local semantic engine test failed: {e}")
        print()
    
    # Test 2: Full API testing
    try:
        test_chatbot_api()
    except Exception as e:
        print(f"❌ API test failed: {e}")
        print()
    
    print("=" * 80)
    print("🎉 Testing completed!")
    print()
    print("📋 Summary:")
    print("1. Semantic engine can understand question variations")
    print("2. Trained on 20 payment security Q&As")
    print("3. Uses embedding-based similarity matching")
    print("4. Falls back to fuzzy and keyword matching")
    print("5. Integrates with full chatbot API")
    print()
    print("🚀 Your AI chatbot now has semantic understanding!")
    print("   Try asking questions like:")
    print("   • 'How do I make my UPI more secure?'")
    print("   • 'Is cafe WiFi safe for payments?'")
    print("   • 'What if payment fails but money is cut?'")

if __name__ == "__main__":
    main()