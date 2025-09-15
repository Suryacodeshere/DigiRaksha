"""
Semantic Training Engine for DigiRaksha AI Chatbot
Handles semantic similarity matching for Q&As using sentence embeddings and fuzzy matching
"""

import numpy as np
import logging
from typing import List, Dict, Any, Optional, Tuple
from sentence_transformers import SentenceTransformer
from sklearn.metrics.pairwise import cosine_similarity
import pickle
import os
import json
from datetime import datetime
import re
from difflib import SequenceMatcher

logger = logging.getLogger(__name__)

class SemanticTrainingEngine:
    """
    Advanced semantic training engine for understanding questions with similar meanings
    """
    
    def __init__(self, model_name: str = "all-MiniLM-L6-v2"):
        self.model_name = model_name
        self.embedding_model = None
        self.qa_database = []
        self.question_embeddings = []
        self.embedding_cache_file = "backend/question_embeddings.pkl"
        self.qa_database_file = "backend/qa_database.json"
        self.is_initialized = False
        
        # Semantic similarity threshold (adjustable)
        self.similarity_threshold = 0.65
        self.fuzzy_match_threshold = 0.70
        
    async def initialize(self) -> bool:
        """Initialize the semantic training engine"""
        try:
            logger.info("Initializing Semantic Training Engine...")
            
            # Load sentence transformer model
            self.embedding_model = SentenceTransformer(self.model_name)
            logger.info(f"✅ Loaded embedding model: {self.model_name}")
            
            # Load existing Q&A database and embeddings
            await self._load_qa_database()
            await self._load_embeddings()
            
            self.is_initialized = True
            logger.info("✅ Semantic Training Engine initialized successfully")
            return True
            
        except Exception as e:
            logger.error(f"Failed to initialize Semantic Training Engine: {e}")
            return False
    
    async def _load_qa_database(self):
        """Load Q&A database from file"""
        try:
            if os.path.exists(self.qa_database_file):
                with open(self.qa_database_file, 'r', encoding='utf-8') as f:
                    self.qa_database = json.load(f)
                logger.info(f"Loaded {len(self.qa_database)} Q&A pairs from database")
            else:
                self.qa_database = []
                logger.info("No existing Q&A database found, starting fresh")
        except Exception as e:
            logger.error(f"Error loading Q&A database: {e}")
            self.qa_database = []
    
    async def _load_embeddings(self):
        """Load pre-computed embeddings from cache"""
        try:
            if os.path.exists(self.embedding_cache_file) and self.qa_database:
                with open(self.embedding_cache_file, 'rb') as f:
                    self.question_embeddings = pickle.load(f)
                logger.info(f"Loaded {len(self.question_embeddings)} cached embeddings")
                
                # Verify embedding count matches Q&A count
                if len(self.question_embeddings) != len(self.qa_database):
                    logger.warning("Embedding count mismatch, regenerating embeddings")
                    await self._regenerate_embeddings()
            else:
                await self._regenerate_embeddings()
        except Exception as e:
            logger.error(f"Error loading embeddings: {e}")
            await self._regenerate_embeddings()
    
    async def _regenerate_embeddings(self):
        """Regenerate embeddings for all questions"""
        if not self.qa_database or not self.embedding_model:
            self.question_embeddings = []
            return
            
        try:
            logger.info("Generating embeddings for all questions...")
            questions = [qa['question'] for qa in self.qa_database]
            self.question_embeddings = self.embedding_model.encode(questions)
            
            # Save embeddings to cache
            with open(self.embedding_cache_file, 'wb') as f:
                pickle.dump(self.question_embeddings, f)
            
            logger.info(f"Generated and cached {len(self.question_embeddings)} embeddings")
        except Exception as e:
            logger.error(f"Error generating embeddings: {e}")
            self.question_embeddings = []
    
    async def add_qa_pairs(self, qa_pairs: List[Dict[str, str]]) -> bool:
        """Add multiple Q&A pairs to the database"""
        try:
            added_count = 0
            for qa_pair in qa_pairs:
                question = qa_pair.get('question', '').strip()
                answer = qa_pair.get('answer', '').strip()
                
                if question and answer:
                    # Check for duplicates
                    if not self._is_duplicate_question(question):
                        new_qa = {
                            'id': len(self.qa_database),
                            'question': question,
                            'answer': answer,
                            'created_at': datetime.now().isoformat(),
                            'category': qa_pair.get('category', 'general'),
                            'keywords': self._extract_keywords(question)
                        }
                        self.qa_database.append(new_qa)
                        added_count += 1
                    else:
                        logger.info(f"Skipping duplicate question: {question[:50]}...")
            
            if added_count > 0:
                # Save updated database
                await self._save_qa_database()
                # Regenerate embeddings
                await self._regenerate_embeddings()
                logger.info(f"Added {added_count} new Q&A pairs to database")
            
            return True
            
        except Exception as e:
            logger.error(f"Error adding Q&A pairs: {e}")
            return False
    
    def _is_duplicate_question(self, question: str) -> bool:
        """Check if question already exists in database"""
        question_lower = question.lower().strip()
        for qa in self.qa_database:
            if qa['question'].lower().strip() == question_lower:
                return True
        return False
    
    def _extract_keywords(self, text: str) -> List[str]:
        """Extract important keywords from text"""
        # Remove common stop words and extract meaningful terms
        stop_words = {'the', 'a', 'an', 'and', 'or', 'but', 'in', 'on', 'at', 'to', 'for', 'of', 'with', 'by', 'is', 'are', 'was', 'were', 'can', 'should', 'would', 'could', 'do', 'does', 'did', 'how', 'what', 'when', 'where', 'why', 'who', 'which'}
        
        # Clean and tokenize
        text_clean = re.sub(r'[^\w\s]', ' ', text.lower())
        words = [word.strip() for word in text_clean.split() if len(word) > 2 and word not in stop_words]
        
        # Return unique keywords
        return list(set(words))
    
    async def find_best_answer(self, user_question: str) -> Optional[Dict[str, Any]]:
        """Find the best matching answer for a user question using semantic similarity"""
        if not self.is_initialized or not self.qa_database or not self.embedding_model:
            return None
        
        try:
            # Clean and prepare the user question
            clean_question = user_question.strip()
            
            # Generate embedding for user question
            user_embedding = self.embedding_model.encode([clean_question])
            
            # Calculate cosine similarity with all stored questions
            similarities = cosine_similarity(user_embedding, self.question_embeddings)[0]
            
            # Find best match
            best_match_idx = np.argmax(similarities)
            best_similarity = similarities[best_match_idx]
            
            logger.info(f"Best semantic match score: {best_similarity:.3f} for question: '{clean_question[:50]}...'")
            
            # Check if similarity is above threshold
            if best_similarity >= self.similarity_threshold:
                best_qa = self.qa_database[best_match_idx]
                return {
                    'answer': best_qa['answer'],
                    'matched_question': best_qa['question'],
                    'similarity_score': float(best_similarity),
                    'match_type': 'semantic',
                    'confidence': self._calculate_confidence(best_similarity),
                    'qa_id': best_qa['id']
                }
            
            # Fall back to fuzzy matching if semantic similarity is low
            fuzzy_result = self._fuzzy_match_question(clean_question)
            if fuzzy_result:
                return fuzzy_result
            
            # Check for keyword-based matching
            keyword_result = self._keyword_match_question(clean_question)
            if keyword_result:
                return keyword_result
            
            return None
            
        except Exception as e:
            logger.error(f"Error finding best answer: {e}")
            return None
    
    def _fuzzy_match_question(self, user_question: str) -> Optional[Dict[str, Any]]:
        """Use fuzzy string matching as fallback"""
        try:
            best_ratio = 0.0
            best_qa = None
            
            user_question_lower = user_question.lower()
            
            for qa in self.qa_database:
                ratio = SequenceMatcher(None, user_question_lower, qa['question'].lower()).ratio()
                if ratio > best_ratio:
                    best_ratio = ratio
                    best_qa = qa
            
            if best_ratio >= self.fuzzy_match_threshold:
                logger.info(f"Fuzzy match found with ratio: {best_ratio:.3f}")
                return {
                    'answer': best_qa['answer'],
                    'matched_question': best_qa['question'],
                    'similarity_score': best_ratio,
                    'match_type': 'fuzzy',
                    'confidence': self._calculate_confidence(best_ratio),
                    'qa_id': best_qa['id']
                }
            
            return None
            
        except Exception as e:
            logger.error(f"Error in fuzzy matching: {e}")
            return None
    
    def _keyword_match_question(self, user_question: str) -> Optional[Dict[str, Any]]:
        """Use keyword-based matching as final fallback"""
        try:
            user_keywords = set(self._extract_keywords(user_question))
            if not user_keywords:
                return None
            
            best_score = 0.0
            best_qa = None
            
            for qa in self.qa_database:
                qa_keywords = set(qa.get('keywords', []))
                if qa_keywords:
                    # Calculate keyword overlap
                    intersection = user_keywords.intersection(qa_keywords)
                    union = user_keywords.union(qa_keywords)
                    
                    if union:
                        jaccard_score = len(intersection) / len(union)
                        if jaccard_score > best_score:
                            best_score = jaccard_score
                            best_qa = qa
            
            if best_score >= 0.3:  # Minimum keyword overlap threshold
                logger.info(f"Keyword match found with score: {best_score:.3f}")
                return {
                    'answer': best_qa['answer'],
                    'matched_question': best_qa['question'],
                    'similarity_score': best_score,
                    'match_type': 'keyword',
                    'confidence': self._calculate_confidence(best_score * 0.8),  # Lower confidence for keyword matching
                    'qa_id': best_qa['id']
                }
            
            return None
            
        except Exception as e:
            logger.error(f"Error in keyword matching: {e}")
            return None
    
    def _calculate_confidence(self, similarity_score: float) -> str:
        """Calculate confidence level based on similarity score"""
        if similarity_score >= 0.9:
            return "very_high"
        elif similarity_score >= 0.8:
            return "high"
        elif similarity_score >= 0.7:
            return "medium"
        elif similarity_score >= 0.6:
            return "low"
        else:
            return "very_low"
    
    async def _save_qa_database(self):
        """Save Q&A database to file"""
        try:
            os.makedirs(os.path.dirname(self.qa_database_file), exist_ok=True)
            with open(self.qa_database_file, 'w', encoding='utf-8') as f:
                json.dump(self.qa_database, f, indent=2, ensure_ascii=False)
            logger.info(f"Saved {len(self.qa_database)} Q&A pairs to database")
        except Exception as e:
            logger.error(f"Error saving Q&A database: {e}")
    
    def get_database_stats(self) -> Dict[str, Any]:
        """Get statistics about the Q&A database"""
        return {
            'total_qa_pairs': len(self.qa_database),
            'embedding_count': len(self.question_embeddings),
            'similarity_threshold': self.similarity_threshold,
            'fuzzy_match_threshold': self.fuzzy_match_threshold,
            'model_name': self.model_name,
            'is_initialized': self.is_initialized
        }
    
    async def update_thresholds(self, similarity_threshold: float = None, fuzzy_threshold: float = None):
        """Update similarity thresholds for matching"""
        if similarity_threshold is not None:
            self.similarity_threshold = max(0.0, min(1.0, similarity_threshold))
        if fuzzy_threshold is not None:
            self.fuzzy_match_threshold = max(0.0, min(1.0, fuzzy_threshold))
        
        logger.info(f"Updated thresholds - Semantic: {self.similarity_threshold}, Fuzzy: {self.fuzzy_match_threshold}")

# Global instance
semantic_engine = SemanticTrainingEngine()