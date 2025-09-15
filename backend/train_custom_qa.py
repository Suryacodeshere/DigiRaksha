#!/usr/bin/env python3
"""
Custom Q&A Training Script for Digi Raksha Chatbot
This script trains the semantic AI with specific UPI security questions and answers.
"""

import json
import asyncio
import logging
from semantic_training_engine import semantic_engine

# Set up logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

async def train_with_custom_data():
    """Load and train the AI with custom Q&A data"""
    
    # Load training data
    try:
        with open('training_data.json', 'r', encoding='utf-8') as f:
            training_data = json.load(f)
        logger.info(f"✅ Loaded {len(training_data)} Q&A pairs from training_data.json")
    except FileNotFoundError:
        logger.error("❌ training_data.json not found!")
        return
    except json.JSONDecodeError as e:
        logger.error(f"❌ Error parsing JSON: {e}")
        return
    
    # Initialize semantic training engine
    logger.info("🤖 Initializing Semantic Training Engine...")
    try:
        await semantic_engine.initialize()
        logger.info("✅ Semantic Training Engine initialized")
    except Exception as e:
        logger.error(f"❌ Failed to initialize training engine: {e}")
        return
    
    # Train with each Q&A pair
    logger.info("🎓 Starting training process...")
    
    successful_training = 0
    failed_training = 0
    
    for i, qa_pair in enumerate(training_data, 1):
        try:
            question = qa_pair['question']
            answer = qa_pair['answer']
            category = qa_pair.get('category', 'general')
            keywords = qa_pair.get('keywords', [])
            
            # Create enhanced training data with metadata
            qa_data = {
                'question': question,
                'answer': answer,
                'category': category,
                'keywords': keywords
            }
            
            # Train the engine
            await semantic_engine.add_qa_pairs([qa_data])
            
            successful_training += 1
            logger.info(f"✅ [{i}/{len(training_data)}] Trained: {question[:50]}...")
            
        except Exception as e:
            failed_training += 1
            logger.error(f"❌ [{i}/{len(training_data)}] Failed to train: {e}")
            continue
    
    # Save the trained data
    try:
        # The semantic engine automatically saves data when adding Q&A pairs
        logger.info("💾 Training data saved successfully")
    except Exception as e:
        logger.warning(f"⚠️ Could not save training data: {e}")
    
    # Summary
    logger.info(f"""
🎉 Training Complete!
✅ Successfully trained: {successful_training} Q&A pairs
❌ Failed: {failed_training} Q&A pairs
📊 Success rate: {(successful_training/(successful_training+failed_training))*100:.1f}%
    """)
    
    # Test a few queries to verify training
    logger.info("🧪 Testing trained responses...")
    
    test_queries = [
        "How can I make my UPI secure?",
        "What to do if payment failed but money deducted?",
        "Can I cancel UPI payment?",
        "How to report fraud online?"
    ]
    
    for query in test_queries:
        try:
            response = await semantic_engine.find_best_answer(query)
            if response:
                logger.info(f"✅ Test Query: '{query}'")
                logger.info(f"   Response: {response['answer'][:100]}...")
            else:
                logger.warning(f"⚠️ No response for: '{query}'")
        except Exception as e:
            logger.error(f"❌ Test failed for '{query}': {e}")
    
    logger.info("🚀 Chatbot training completed successfully!")

def run_training():
    """Run the training in a sync context"""
    try:
        # Create and run event loop
        loop = asyncio.new_event_loop()
        asyncio.set_event_loop(loop)
        loop.run_until_complete(train_with_custom_data())
    except Exception as e:
        logger.error(f"❌ Training failed: {e}")
    finally:
        loop.close()

if __name__ == "__main__":
    print("🎓 Digi Raksha Chatbot - Custom Q&A Training")
    print("=" * 50)
    run_training()