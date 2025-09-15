"""
Enhanced Emotional Intelligence Module
Advanced sentiment analysis and emotion detection for better user understanding
"""

import re
import logging
import asyncio
from typing import Dict, List, Any, Optional, Tuple
from datetime import datetime
from dataclasses import dataclass

# Sentiment analysis libraries
try:
    from vaderSentiment.vaderSentiment import SentimentIntensityAnalyzer
    from textblob import TextBlob
    SENTIMENT_AVAILABLE = True
except ImportError:
    SENTIMENT_AVAILABLE = False
    logging.warning("Sentiment analysis libraries not available. Install vaderSentiment and textblob.")

# Transformers for advanced emotion detection
try:
    from transformers import pipeline, AutoTokenizer, AutoModelForSequenceClassification
    TRANSFORMERS_AVAILABLE = True
except ImportError:
    TRANSFORMERS_AVAILABLE = False
    logging.warning("Transformers not available. Advanced emotion detection will be limited.")

logger = logging.getLogger(__name__)

@dataclass
class EmotionAnalysis:
    """Data class for emotion analysis results"""
    primary_emotion: str
    confidence: float
    secondary_emotions: Dict[str, float]
    sentiment_score: float
    emotional_intensity: float
    urgency_level: str
    support_type_needed: str
    recommended_response_tone: str

@dataclass
class ConversationContext:
    """Data class for conversation context"""
    user_id: Optional[str]
    conversation_history: List[Dict[str, Any]]
    emotional_state_history: List[EmotionAnalysis]
    user_preferences: Dict[str, Any]
    last_interaction: Optional[datetime]
    total_interactions: int

class EnhancedEmotionalIntelligence:
    """
    Advanced emotional intelligence system with sentiment analysis,
    emotion detection, and contextual understanding
    """
    
    def __init__(self):
        self.is_initialized = False
        self.vader_analyzer = None
        self.emotion_classifier = None
        self.conversation_contexts = {}  # Store user conversation contexts
        
        # Emotion patterns and indicators
        self.emotion_patterns = {
            'fear': {
                'keywords': ['scared', 'afraid', 'terrified', 'frightened', 'panic', 'worried', 'nervous'],
                'phrases': [r'i\s*am\s*scared', r'so\s*afraid', r'really\s*worried', r'panicking'],
                'intensity_indicators': ['very', 'so', 'extremely', 'really', 'completely']
            },
            'anger': {
                'keywords': ['angry', 'furious', 'mad', 'frustrated', 'irritated', 'annoyed'],
                'phrases': [r'so\s*angry', r'really\s*mad', r'frustrated\s*with'],
                'intensity_indicators': ['very', 'so', 'extremely', 'really', 'absolutely']
            },
            'sadness': {
                'keywords': ['sad', 'depressed', 'devastated', 'heartbroken', 'disappointed', 'upset'],
                'phrases': [r'feel\s*sad', r'so\s*disappointed', r'really\s*upset'],
                'intensity_indicators': ['very', 'so', 'extremely', 'deeply', 'completely']
            },
            'anxiety': {
                'keywords': ['anxious', 'stressed', 'overwhelmed', 'confused', 'helpless'],
                'phrases': [r'feeling\s*anxious', r'so\s*stressed', r'completely\s*lost'],
                'intensity_indicators': ['very', 'so', 'extremely', 'really', 'totally']
            },
            'hope': {
                'keywords': ['hope', 'optimistic', 'positive', 'confident', 'better'],
                'phrases': [r'hope\s*everything', r'feeling\s*better', r'more\s*confident'],
                'intensity_indicators': ['very', 'much', 'really', 'quite', 'fairly']
            },
            'gratitude': {
                'keywords': ['thank', 'grateful', 'appreciate', 'helped', 'wonderful'],
                'phrases': [r'thank\s*you', r'really\s*appreciate', r'so\s*helpful'],
                'intensity_indicators': ['very', 'so', 'really', 'truly', 'deeply']
            }
        }
        
        # Urgency indicators
        self.urgency_patterns = {
            'high': [
                r'emergency', r'urgent', r'immediately', r'right\s*now', r'asap',
                r'can\'t\s*wait', r'happening\s*now', r'need\s*help\s*now',
                r'losing\s*money', r'account\s*hacked', r'fraud\s*happening'
            ],
            'medium': [
                r'soon', r'quickly', r'worried', r'concerned', r'need\s*help',
                r'what\s*should\s*i\s*do', r'advice', r'guidance'
            ],
            'low': [
                r'sometime', r'eventually', r'when\s*possible', r'curious',
                r'wondering', r'interested'
            ]
        }
        
        # Support type indicators
        self.support_indicators = {
            'emotional': [
                r'scared', r'afraid', r'worried', r'sad', r'upset', r'devastated',
                r'feeling', r'emotion', r'comfort', r'support', r'help\s*me\s*feel'
            ],
            'informational': [
                r'what\s*is', r'how\s*to', r'explain', r'understand', r'learn',
                r'information', r'details', r'guidelines', r'rules'
            ],
            'procedural': [
                r'what\s*should\s*i\s*do', r'steps', r'process', r'how\s*do\s*i',
                r'procedure', r'action', r'next', r'report', r'file'
            ]
        }
    
    async def initialize(self) -> bool:
        """Initialize the emotional intelligence system"""
        if self.is_initialized:
            return True
        
        try:
            logger.info("Initializing Enhanced Emotional Intelligence System...")
            
            # Initialize VADER sentiment analyzer
            if SENTIMENT_AVAILABLE:
                self.vader_analyzer = SentimentIntensityAnalyzer()
                logger.info("✅ VADER sentiment analyzer loaded")
            
            # Initialize transformer-based emotion classifier
            if TRANSFORMERS_AVAILABLE:
                try:
                    # Load emotion classification model
                    model_name = "j-hartmann/emotion-english-distilroberta-base"
                    self.emotion_classifier = pipeline(
                        "text-classification", 
                        model=model_name,
                        tokenizer=model_name
                    )
                    logger.info("✅ Advanced emotion classifier loaded")
                except Exception as e:
                    logger.warning(f"Advanced emotion classifier failed to load: {e}")
            
            self.is_initialized = True
            logger.info("🧠 Enhanced Emotional Intelligence System ready!")
            return True
            
        except Exception as e:
            logger.error(f"Failed to initialize Emotional Intelligence System: {e}")
            return False
    
    def analyze_text_emotions(self, text: str) -> EmotionAnalysis:
        """
        Comprehensive emotion analysis of text
        """
        try:
            text_lower = text.lower()
            
            # Basic pattern-based emotion detection
            detected_emotions = {}
            primary_emotion = 'neutral'
            max_confidence = 0.0
            
            # Pattern-based emotion detection
            for emotion, patterns in self.emotion_patterns.items():
                confidence = 0.0
                
                # Check keywords
                for keyword in patterns['keywords']:
                    if keyword in text_lower:
                        confidence += 0.3
                
                # Check phrases
                for phrase_pattern in patterns['phrases']:
                    if re.search(phrase_pattern, text_lower):
                        confidence += 0.4
                
                # Check intensity indicators
                for intensity in patterns['intensity_indicators']:
                    if intensity in text_lower:
                        confidence += 0.2
                
                if confidence > 0:
                    detected_emotions[emotion] = min(confidence, 1.0)
                    if confidence > max_confidence:
                        max_confidence = confidence
                        primary_emotion = emotion
            
            # Advanced transformer-based emotion detection (if available)
            if self.emotion_classifier and TRANSFORMERS_AVAILABLE:
                try:
                    emotion_results = self.emotion_classifier(text)
                    if emotion_results:
                        top_emotion = emotion_results[0]
                        transformer_emotion = top_emotion['label'].lower()
                        transformer_confidence = top_emotion['score']
                        
                        # Map transformer emotions to our emotion system
                        emotion_mapping = {
                            'joy': 'hope',
                            'fear': 'fear',
                            'anger': 'anger',
                            'sadness': 'sadness',
                            'disgust': 'anger',
                            'surprise': 'anxiety'
                        }
                        
                        mapped_emotion = emotion_mapping.get(transformer_emotion, transformer_emotion)
                        
                        # Combine with pattern-based detection
                        if mapped_emotion in detected_emotions:
                            detected_emotions[mapped_emotion] = max(
                                detected_emotions[mapped_emotion],
                                transformer_confidence
                            )
                        else:
                            detected_emotions[mapped_emotion] = transformer_confidence
                        
                        # Update primary emotion if transformer confidence is higher
                        if transformer_confidence > max_confidence:
                            primary_emotion = mapped_emotion
                            max_confidence = transformer_confidence
                
                except Exception as e:
                    logger.warning(f"Transformer emotion detection failed: {e}")
            
            # Sentiment analysis
            sentiment_score = 0.0
            if self.vader_analyzer and SENTIMENT_AVAILABLE:
                try:
                    sentiment_scores = self.vader_analyzer.polarity_scores(text)
                    sentiment_score = sentiment_scores['compound']
                except Exception as e:
                    logger.warning(f"VADER sentiment analysis failed: {e}")
            
            # Alternative sentiment with TextBlob
            if sentiment_score == 0.0 and SENTIMENT_AVAILABLE:
                try:
                    blob = TextBlob(text)
                    sentiment_score = blob.sentiment.polarity
                except Exception as e:
                    logger.warning(f"TextBlob sentiment analysis failed: {e}")
            
            # Determine urgency level
            urgency_level = self._determine_urgency(text_lower)
            
            # Determine support type needed
            support_type = self._determine_support_type(text_lower)
            
            # Calculate emotional intensity
            emotional_intensity = max_confidence
            
            # Determine recommended response tone
            response_tone = self._determine_response_tone(
                primary_emotion, sentiment_score, urgency_level
            )
            
            return EmotionAnalysis(
                primary_emotion=primary_emotion,
                confidence=max_confidence,
                secondary_emotions=detected_emotions,
                sentiment_score=sentiment_score,
                emotional_intensity=emotional_intensity,
                urgency_level=urgency_level,
                support_type_needed=support_type,
                recommended_response_tone=response_tone
            )
            
        except Exception as e:
            logger.error(f"Error in emotion analysis: {e}")
            return EmotionAnalysis(
                primary_emotion='neutral',
                confidence=0.0,
                secondary_emotions={},
                sentiment_score=0.0,
                emotional_intensity=0.0,
                urgency_level='low',
                support_type_needed='informational',
                recommended_response_tone='neutral'
            )
    
    def _determine_urgency(self, text: str) -> str:
        """Determine urgency level from text"""
        for urgency, patterns in self.urgency_patterns.items():
            for pattern in patterns:
                if re.search(pattern, text):
                    return urgency
        return 'low'
    
    def _determine_support_type(self, text: str) -> str:
        """Determine type of support needed"""
        scores = {}
        for support_type, patterns in self.support_indicators.items():
            score = 0
            for pattern in patterns:
                if re.search(pattern, text):
                    score += 1
            if score > 0:
                scores[support_type] = score
        
        if scores:
            return max(scores, key=scores.get)
        return 'informational'
    
    def _determine_response_tone(self, emotion: str, sentiment: float, urgency: str) -> str:
        """Determine appropriate response tone"""
        if emotion in ['fear', 'anxiety', 'sadness'] and urgency == 'high':
            return 'emergency_supportive'
        elif emotion in ['fear', 'anxiety', 'sadness']:
            return 'empathetic'
        elif emotion in ['anger', 'frustration']:
            return 'calming'
        elif emotion in ['hope', 'gratitude']:
            return 'encouraging'
        elif sentiment > 0.3:
            return 'positive'
        elif sentiment < -0.3:
            return 'supportive'
        else:
            return 'neutral'
    
    def get_conversation_context(self, user_id: str) -> ConversationContext:
        """Get or create conversation context for user"""
        if user_id not in self.conversation_contexts:
            self.conversation_contexts[user_id] = ConversationContext(
                user_id=user_id,
                conversation_history=[],
                emotional_state_history=[],
                user_preferences={},
                last_interaction=None,
                total_interactions=0
            )
        return self.conversation_contexts[user_id]
    
    def update_conversation_context(
        self, 
        user_id: str, 
        user_message: str, 
        ai_response: str, 
        emotion_analysis: EmotionAnalysis
    ):
        """Update conversation context with new interaction"""
        context = self.get_conversation_context(user_id)
        
        # Add to conversation history
        context.conversation_history.append({
            'timestamp': datetime.now(),
            'user_message': user_message,
            'ai_response': ai_response,
            'emotion_analysis': emotion_analysis
        })
        
        # Add to emotional state history
        context.emotional_state_history.append(emotion_analysis)
        
        # Update interaction metadata
        context.last_interaction = datetime.now()
        context.total_interactions += 1
        
        # Keep only last 20 interactions to manage memory
        if len(context.conversation_history) > 20:
            context.conversation_history = context.conversation_history[-20:]
        if len(context.emotional_state_history) > 20:
            context.emotional_state_history = context.emotional_state_history[-20:]
    
    def get_emotional_state_summary(self, user_id: str) -> Dict[str, Any]:
        """Get summary of user's emotional state over recent interactions"""
        context = self.get_conversation_context(user_id)
        
        if not context.emotional_state_history:
            return {'status': 'no_history', 'recommendations': []}
        
        recent_emotions = context.emotional_state_history[-5:]  # Last 5 interactions
        
        # Analyze emotion trends
        emotion_counts = {}
        total_intensity = 0
        urgency_levels = []
        
        for emotion_analysis in recent_emotions:
            primary_emotion = emotion_analysis.primary_emotion
            emotion_counts[primary_emotion] = emotion_counts.get(primary_emotion, 0) + 1
            total_intensity += emotion_analysis.emotional_intensity
            urgency_levels.append(emotion_analysis.urgency_level)
        
        dominant_emotion = max(emotion_counts, key=emotion_counts.get) if emotion_counts else 'neutral'
        average_intensity = total_intensity / len(recent_emotions) if recent_emotions else 0
        
        # Determine if user needs additional support
        needs_extra_support = False
        if dominant_emotion in ['fear', 'anxiety', 'sadness'] and average_intensity > 0.6:
            needs_extra_support = True
        
        # Check for improvement or deterioration
        emotion_trend = 'stable'
        if len(recent_emotions) >= 3:
            recent_intensity = sum(e.emotional_intensity for e in recent_emotions[-2:]) / 2
            earlier_intensity = sum(e.emotional_intensity for e in recent_emotions[-4:-2]) / 2
            
            if recent_intensity > earlier_intensity + 0.2:
                emotion_trend = 'worsening'
            elif recent_intensity < earlier_intensity - 0.2:
                emotion_trend = 'improving'
        
        return {
            'status': 'analyzed',
            'dominant_emotion': dominant_emotion,
            'average_intensity': average_intensity,
            'emotion_trend': emotion_trend,
            'needs_extra_support': needs_extra_support,
            'total_interactions': context.total_interactions,
            'recommendations': self._generate_emotional_recommendations(
                dominant_emotion, average_intensity, emotion_trend, needs_extra_support
            )
        }
    
    def _generate_emotional_recommendations(
        self, 
        dominant_emotion: str, 
        intensity: float, 
        trend: str, 
        needs_support: bool
    ) -> List[str]:
        """Generate recommendations based on emotional analysis"""
        recommendations = []
        
        if needs_support:
            recommendations.append("Provide extra emotional support and reassurance")
            recommendations.append("Use calming and empathetic language")
            recommendations.append("Offer specific, actionable steps to reduce anxiety")
        
        if dominant_emotion == 'fear':
            recommendations.extend([
                "Focus on safety and security information",
                "Provide clear, step-by-step guidance",
                "Emphasize protective measures and support systems"
            ])
        elif dominant_emotion == 'anger':
            recommendations.extend([
                "Acknowledge the user's frustration",
                "Provide channels for proper complaint resolution",
                "Focus on constructive solutions"
            ])
        elif dominant_emotion == 'sadness':
            recommendations.extend([
                "Offer hope and recovery stories",
                "Provide timeline for resolution",
                "Connect with support resources"
            ])
        
        if trend == 'worsening':
            recommendations.append("Consider escalating to human support if available")
        elif trend == 'improving':
            recommendations.append("Acknowledge progress and encourage continued engagement")
        
        return recommendations

# Global instance
enhanced_emotional_intelligence = EnhancedEmotionalIntelligence()