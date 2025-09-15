"""
Training Script for DigiRaksha AI Chatbot
Loads the 20 provided Q&As and trains the semantic matching engine
"""

import asyncio
import logging
import sys
import os
from typing import List, Dict

# Add backend directory to path
sys.path.append(os.path.dirname(__file__))

from semantic_training_engine import semantic_engine

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

# The 20 Q&As provided by the user
TRAINING_QA_PAIRS = [
    {
        "question": "How can I make my UPI account more secure?",
        "answer": "Use a strong UPI PIN, never share it, enable app lock or biometric login, and regularly check your linked bank statements.",
        "category": "security"
    },
    {
        "question": "Should I log out of my payment app after every transaction?",
        "answer": "Most apps are secured with PIN/biometric, so logging out each time is not necessary. However, always secure your phone with a lock screen.",
        "category": "security"
    },
    {
        "question": "How do I know if my phone has been hacked for payments?",
        "answer": "Signs include unknown apps installed, unusual SMS about transactions, faster battery drain, or money deductions you didn't authorize.",
        "category": "security"
    },
    {
        "question": "What should I do if I lose my SIM card linked to my bank?",
        "answer": "Block your SIM immediately by calling the telecom provider. Then inform your bank to prevent misuse.",
        "category": "emergency"
    },
    {
        "question": "Is it safe to use public Wi-Fi for online payments?",
        "answer": "No. Public Wi-Fi can be unsafe. Use mobile data or a secured private network for financial transactions.",
        "category": "security"
    },
    {
        "question": "Why did my digital payment fail even though money was deducted?",
        "answer": "This happens due to network or server issues. The amount is usually reversed to your account within 3–5 working days.",
        "category": "technical"
    },
    {
        "question": "How can I confirm if the money has reached the right person?",
        "answer": "Check the transaction status in your payment app. You should also confirm with the recipient directly.",
        "category": "transaction"
    },
    {
        "question": "What details should I check before sending money online?",
        "answer": "Always verify the recipient's name, phone number, or UPI ID before confirming payment.",
        "category": "transaction"
    },
    {
        "question": "How long does it take for a failed transaction to be refunded?",
        "answer": "Generally within 3–5 working days, depending on your bank and payment app.",
        "category": "refund"
    },
    {
        "question": "Can I cancel a UPI payment after sending it?",
        "answer": "No. Once a UPI payment is successful, it cannot be cancelled. You must request the recipient to refund if sent by mistake.",
        "category": "transaction"
    },
    {
        "question": "What are common social media payment scams?",
        "answer": "Scams include fake shopping offers, lottery/prize claims, job offers requiring a \"registration fee,\" or impersonation of friends asking for money.",
        "category": "fraud"
    },
    {
        "question": "Why should I not share screenshots of my payment online?",
        "answer": "Screenshots may contain sensitive details like transaction ID, phone number, or partial account details that fraudsters can misuse.",
        "category": "privacy"
    },
    {
        "question": "Can someone misuse my bank account number if I share it?",
        "answer": "Sharing only an account number is usually safe for receiving money. But fraudsters may use it for phishing attempts. Avoid sharing additional details like OTP or PIN.",
        "category": "privacy"
    },
    {
        "question": "What are fake job or part-time work scams involving payments?",
        "answer": "Fraudsters offer fake jobs and ask for advance fees, deposits, or \"training charges.\" Once paid, they disappear.",
        "category": "fraud"
    },
    {
        "question": "How can I avoid investment scams online?",
        "answer": "Invest only through licensed platforms. Avoid schemes promising unusually high returns. Always verify the company's authenticity.",
        "category": "fraud"
    },
    {
        "question": "What documents should I keep ready while reporting payment fraud?",
        "answer": "Keep transaction ID, bank/payment app statement, screenshots, fraudster's contact details, and your ID proof.",
        "category": "reporting"
    },
    {
        "question": "Can I report digital payment fraud without going to the police station?",
        "answer": "Yes. In India, you can report online at cybercrime.gov.in or call 1930. Other countries have their own online complaint portals.",
        "category": "reporting"
    },
    {
        "question": "What should I do if someone threatens me for online payment?",
        "answer": "Do not pay. Collect proof (messages, calls) and immediately report to police and the cybercrime helpline.",
        "category": "emergency"
    },
    {
        "question": "Is there insurance coverage for online payment fraud?",
        "answer": "Some banks and digital wallets provide fraud protection or cyber insurance. Check with your bank or insurer for details.",
        "category": "insurance"
    },
    {
        "question": "How do I freeze my bank account in case of fraud?",
        "answer": "Call your bank's customer care or visit the nearest branch to request an immediate freeze. This stops further unauthorized transactions.",
        "category": "emergency"
    }
]

async def train_semantic_engine():
    """Train the semantic engine with the provided Q&As"""
    try:
        logger.info("Starting semantic training process...")
        
        # Initialize the semantic engine
        if not await semantic_engine.initialize():
            logger.error("Failed to initialize semantic engine")
            return False
        
        # Get current database stats
        stats_before = semantic_engine.get_database_stats()
        logger.info(f"Database stats before training: {stats_before}")
        
        # Add all Q&A pairs
        success = await semantic_engine.add_qa_pairs(TRAINING_QA_PAIRS)
        
        if success:
            # Get updated stats
            stats_after = semantic_engine.get_database_stats()
            logger.info(f"Database stats after training: {stats_after}")
            
            added_count = stats_after['total_qa_pairs'] - stats_before['total_qa_pairs']
            logger.info(f"✅ Successfully added {added_count} new Q&A pairs")
            logger.info(f"✅ Generated {stats_after['embedding_count']} embeddings")
            
            return True
        else:
            logger.error("Failed to add Q&A pairs")
            return False
            
    except Exception as e:
        logger.error(f"Error during training: {e}")
        return False

async def test_semantic_matching():
    """Test the semantic matching with sample questions"""
    test_questions = [
        # Variations of training questions to test semantic matching
        "How to secure my UPI account?",  # Similar to: "How can I make my UPI account more secure?"
        "Is public wifi safe for payments?",  # Similar to: "Is it safe to use public Wi-Fi for online payments?"
        "What if my payment failed but money was cut?",  # Similar to: "Why did my digital payment fail even though money was deducted?"
        "Can I reverse a UPI transaction?",  # Similar to: "Can I cancel a UPI payment after sending it?"
        "How to report online fraud?",  # Similar to: "Can I report digital payment fraud without going to the police station?"
        
        # Test questions that should not match well
        "What is the weather today?",
        "How to cook pasta?"
    ]
    
    logger.info("\n" + "="*50)
    logger.info("TESTING SEMANTIC MATCHING")
    logger.info("="*50)
    
    for question in test_questions:
        result = await semantic_engine.find_best_answer(question)
        
        print(f"\n🔍 User Question: '{question}'")
        
        if result:
            print(f"✅ Match Found!")
            print(f"   📋 Matched Question: '{result['matched_question']}'")
            print(f"   💬 Answer: {result['answer'][:100]}...")
            print(f"   🎯 Similarity Score: {result['similarity_score']:.3f}")
            print(f"   🔍 Match Type: {result['match_type']}")
            print(f"   📊 Confidence: {result['confidence']}")
        else:
            print(f"❌ No suitable match found")

async def main():
    """Main training and testing function"""
    try:
        logger.info("🤖 DigiRaksha AI Chatbot - Semantic Training")
        logger.info("="*60)
        
        # Train the semantic engine
        training_success = await train_semantic_engine()
        
        if training_success:
            logger.info("✅ Training completed successfully!")
            
            # Test the semantic matching
            await test_semantic_matching()
            
            logger.info("\n✅ Training and testing completed successfully!")
            logger.info("🚀 Your AI chatbot is now trained with semantic understanding!")
            
        else:
            logger.error("❌ Training failed!")
            
    except Exception as e:
        logger.error(f"Error in main function: {e}")

if __name__ == "__main__":
    # Run the training process
    asyncio.run(main())