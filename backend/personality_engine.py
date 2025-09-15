"""
Personality-Driven Response Generation Engine
Creates consistent, human-like personality traits for more relatable AI interactions
"""

import re
import random
import logging
from typing import Dict, List, Any, Optional
from datetime import datetime
from dataclasses import dataclass
from enhanced_emotional_intelligence import EmotionAnalysis

logger = logging.getLogger(__name__)

@dataclass
class PersonalityProfile:
    """AI personality profile configuration"""
    name: str
    core_traits: Dict[str, float]  # 0.0 to 1.0 scale
    communication_style: str
    empathy_level: float
    humor_usage: float
    formality_level: float
    supportiveness: float
    optimism: float
    detail_orientation: float

@dataclass
class ResponseContext:
    """Context for generating personalized responses"""
    emotion_analysis: EmotionAnalysis
    user_history: Dict[str, Any]
    conversation_stage: str
    interaction_count: int

class PersonalityEngine:
    """
    Generates responses with consistent personality traits
    """
    
    def __init__(self):
        self.personality_profiles = self._initialize_personalities()
        self.current_personality = "compassionate_guardian"  # Default personality
        self.response_templates = self._initialize_response_templates()
        self.personality_modifiers = self._initialize_personality_modifiers()
    
    def _initialize_personalities(self) -> Dict[str, PersonalityProfile]:
        """Initialize different personality profiles"""
        return {
            "compassionate_guardian": PersonalityProfile(
                name="Compassionate Guardian",
                core_traits={
                    "empathy": 0.95,
                    "patience": 0.90,
                    "warmth": 0.90,
                    "reliability": 0.95,
                    "wisdom": 0.85
                },
                communication_style="nurturing",
                empathy_level=0.95,
                humor_usage=0.30,
                formality_level=0.40,
                supportiveness=0.95,
                optimism=0.80,
                detail_orientation=0.85
            ),
            "knowledgeable_mentor": PersonalityProfile(
                name="Knowledgeable Mentor",
                core_traits={
                    "intelligence": 0.95,
                    "wisdom": 0.90,
                    "patience": 0.85,
                    "thoroughness": 0.90,
                    "guidance": 0.95
                },
                communication_style="educational",
                empathy_level=0.80,
                humor_usage=0.20,
                formality_level=0.60,
                supportiveness=0.85,
                optimism=0.75,
                detail_orientation=0.95
            ),
            "friendly_companion": PersonalityProfile(
                name="Friendly Companion",
                core_traits={
                    "friendliness": 0.95,
                    "approachability": 0.90,
                    "humor": 0.80,
                    "relatability": 0.95,
                    "enthusiasm": 0.85
                },
                communication_style="casual",
                empathy_level=0.85,
                humor_usage=0.70,
                formality_level=0.20,
                supportiveness=0.80,
                optimism=0.90,
                detail_orientation=0.70
            )
        }
    
    def _initialize_response_templates(self) -> Dict[str, Dict[str, List[str]]]:
        """Initialize response templates for different personality types and situations"""
        return {
            "compassionate_guardian": {
                "greeting": [
                    "Hello there, dear! 🤗 I'm so glad you've reached out to me today.",
                    "Hi sweetheart! 💙 I'm here to support you through whatever you're facing.",
                    "Welcome, my friend! 🌟 You're in a safe space with me now."
                ],
                "empathy_high": [
                    "Oh honey, I can truly feel how difficult this is for you right now. 💙",
                    "My heart goes out to you - what you're experiencing is so understandably overwhelming.",
                    "Dear one, please know that your feelings are completely valid and I'm here to help you through this."
                ],
                "encouragement": [
                    "You're being so incredibly brave by reaching out for help - that takes real strength. 💪",
                    "I want you to know that you're not walking through this alone - I'm right here with you.",
                    "You have more resilience within you than you realize, and together we'll get through this."
                ],
                "reassurance": [
                    "Let me assure you - you're safe now, and we're going to take this one step at a time.",
                    "Take a deep breath with me. You're protected, and I'm here to guide you forward.",
                    "Everything is going to work out, dear. I've seen so many people overcome similar challenges."
                ]
            },
            "knowledgeable_mentor": {
                "greeting": [
                    "Good day! I'm pleased to assist you with your inquiry today.",
                    "Hello! I'm here to provide you with comprehensive guidance and information.",
                    "Welcome! Let's work together to address your concerns with thorough, reliable information."
                ],
                "information_delivery": [
                    "Based on comprehensive analysis and current regulations, here's what you need to know:",
                    "Let me provide you with detailed, accurate information that will help you understand the situation:",
                    "Drawing from extensive knowledge of payment security protocols, I can guide you through this:"
                ],
                "instruction_giving": [
                    "I recommend following this systematic approach to resolve your situation:",
                    "Here's a structured plan that will effectively address your concerns:",
                    "The most effective course of action involves these carefully ordered steps:"
                ],
                "expertise_sharing": [
                    "From my extensive knowledge of financial security protocols:",
                    "Based on current RBI guidelines and best practices:",
                    "According to established cybersecurity principles:"
                ]
            },
            "friendly_companion": {
                "greeting": [
                    "Hey there! 😊 So good to see you! What's happening in your world today?",
                    "Hi friend! 🌟 I'm excited to chat with you and help however I can!",
                    "Hello! 👋 Ready to tackle whatever's on your mind together?"
                ],
                "casual_support": [
                    "Oof, that sounds really tough! But hey, we've totally got this together! 💪",
                    "Yikes! That's definitely stressful, but don't worry - I'm here and we'll figure it out!",
                    "Oh wow, what a situation! But honestly, you came to the right place for help. 😊"
                ],
                "encouragement": [
                    "You're doing amazing by taking action - seriously, good for you! 🌟",
                    "I'm honestly impressed by how you're handling this - you've got great instincts!",
                    "You know what? I have a really good feeling about how this is going to work out! ✨"
                ],
                "problem_solving": [
                    "Okay, let's put our heads together and solve this thing! 🧠",
                    "Alright, challenge accepted! Let's break this down and make it manageable.",
                    "Time to get strategic! I've got some great ideas for how we can handle this."
                ]
            }
        }
    
    def _initialize_personality_modifiers(self) -> Dict[str, Dict[str, Any]]:
        """Initialize personality modifiers for different emotional states"""
        return {
            "fear": {
                "tone_adjustments": {
                    "compassionate_guardian": ["extra_gentle", "very_reassuring", "protective"],
                    "knowledgeable_mentor": ["authoritative_calming", "step_by_step", "confidence_building"],
                    "friendly_companion": ["supportive_buddy", "optimistic", "problem_solving"]
                },
                "language_patterns": {
                    "reassurance_frequency": 1.5,  # Increase reassuring language
                    "complexity_reduction": 0.8,   # Simplify language
                    "emotional_validation": 1.3    # Increase emotional validation
                }
            },
            "anger": {
                "tone_adjustments": {
                    "compassionate_guardian": ["validating", "calming", "understanding"],
                    "knowledgeable_mentor": ["solution_focused", "systematic", "empowering"],
                    "friendly_companion": ["acknowledging", "action_oriented", "channeling_energy"]
                },
                "language_patterns": {
                    "validation_frequency": 1.4,
                    "solution_focus": 1.3,
                    "calming_language": 1.2
                }
            },
            "sadness": {
                "tone_adjustments": {
                    "compassionate_guardian": ["deeply_empathetic", "hopeful", "nurturing"],
                    "knowledgeable_mentor": ["hope_focused", "recovery_oriented", "factual_optimism"],
                    "friendly_companion": ["companionate", "uplifting", "future_focused"]
                },
                "language_patterns": {
                    "hope_injection": 1.4,
                    "companionship_emphasis": 1.3,
                    "recovery_focus": 1.2
                }
            },
            "anxiety": {
                "tone_adjustments": {
                    "compassionate_guardian": ["grounding", "step_by_step", "presence"],
                    "knowledgeable_mentor": ["clear_structure", "logical_progression", "certainty"],
                    "friendly_companion": ["normalizing", "confidence_building", "collaborative"]
                },
                "language_patterns": {
                    "structure_emphasis": 1.3,
                    "certainty_language": 1.4,
                    "grounding_techniques": 1.2
                }
            }
        }
    
    def set_personality(self, personality_name: str):
        """Set the active personality profile"""
        if personality_name in self.personality_profiles:
            self.current_personality = personality_name
            logger.info(f"Personality set to: {personality_name}")
        else:
            logger.warning(f"Unknown personality: {personality_name}")
    
    def get_current_personality(self) -> PersonalityProfile:
        """Get the current personality profile"""
        return self.personality_profiles[self.current_personality]
    
    def generate_personality_enhanced_response(
        self,
        base_response: str,
        emotion_analysis: EmotionAnalysis,
        user_context: Dict[str, Any] = None,
        conversation_stage: str = "ongoing"
    ) -> str:
        """
        Enhance a base response with personality traits
        """
        try:
            personality = self.get_current_personality()
            
            # Apply personality-based modifications
            enhanced_response = self._apply_personality_style(
                base_response, personality, emotion_analysis
            )
            
            # Add personality-specific elements
            enhanced_response = self._add_personality_elements(
                enhanced_response, personality, emotion_analysis, conversation_stage
            )
            
            # Apply emotional modifiers
            enhanced_response = self._apply_emotional_modifiers(
                enhanced_response, emotion_analysis, personality
            )
            
            return enhanced_response
            
        except Exception as e:
            logger.error(f"Error in personality enhancement: {e}")
            return base_response  # Fallback to original response
    
    def _apply_personality_style(
        self,
        response: str,
        personality: PersonalityProfile,
        emotion_analysis: EmotionAnalysis
    ) -> str:
        """Apply personality-specific styling to response"""
        
        # Adjust formality level
        if personality.formality_level < 0.3:
            response = self._make_more_casual(response)
        elif personality.formality_level > 0.7:
            response = self._make_more_formal(response)
        
        # Adjust warmth and empathy
        if personality.empathy_level > 0.8 and emotion_analysis.primary_emotion in ['fear', 'sadness', 'anxiety']:
            response = self._add_warmth_markers(response)
        
        # Adjust detail orientation
        if personality.detail_orientation > 0.8:
            response = self._enhance_detail_structure(response)
        
        return response
    
    def _add_personality_elements(
        self,
        response: str,
        personality: PersonalityProfile,
        emotion_analysis: EmotionAnalysis,
        conversation_stage: str
    ) -> str:
        """Add personality-specific elements"""
        
        # Add appropriate opening based on personality and stage
        if conversation_stage == "greeting":
            templates = self.response_templates[self.current_personality].get("greeting", [])
            if templates:
                personality_opening = random.choice(templates)
                response = f"{personality_opening}\n\n{response}"
        
        # Add personality-specific encouragement
        if emotion_analysis.primary_emotion in ['fear', 'anxiety', 'sadness'] and personality.supportiveness > 0.8:
            encouragement_templates = self.response_templates[self.current_personality].get("encouragement", [])
            if encouragement_templates:
                encouragement = random.choice(encouragement_templates)
                response = f"{response}\n\n{encouragement}"
        
        # Add humor if personality allows and situation is appropriate
        if personality.humor_usage > 0.5 and emotion_analysis.sentiment_score > -0.2 and emotion_analysis.urgency_level != 'high':
            response = self._add_appropriate_humor(response, emotion_analysis)
        
        return response
    
    def _apply_emotional_modifiers(
        self,
        response: str,
        emotion_analysis: EmotionAnalysis,
        personality: PersonalityProfile
    ) -> str:
        """Apply emotional state-specific modifications"""
        
        primary_emotion = emotion_analysis.primary_emotion
        
        if primary_emotion in self.personality_modifiers:
            modifiers = self.personality_modifiers[primary_emotion]
            
            # Apply tone adjustments
            tone_adjustments = modifiers["tone_adjustments"].get(self.current_personality, [])
            for adjustment in tone_adjustments:
                response = self._apply_tone_adjustment(response, adjustment, emotion_analysis)
            
            # Apply language pattern modifications
            language_patterns = modifiers["language_patterns"]
            response = self._apply_language_patterns(response, language_patterns)
        
        return response
    
    def _make_more_casual(self, text: str) -> str:
        """Make text more casual"""
        casual_replacements = {
            r'\bYou\b': 'You',
            r'\bI am\b': "I'm",
            r'\bdo not\b': "don't",
            r'\bcannot\b': "can't",
            r'\bwill not\b': "won't",
            r'\bshould not\b': "shouldn't",
            r'\bwould not\b': "wouldn't",
            r'\bit is\b': "it's",
            r'\bthat is\b': "that's"
        }
        
        result = text
        for formal, casual in casual_replacements.items():
            result = re.sub(formal, casual, result, flags=re.IGNORECASE)
        
        return result
    
    def _make_more_formal(self, text: str) -> str:
        """Make text more formal"""
        formal_replacements = {
            r"\bdon't\b": "do not",
            r"\bcan't\b": "cannot",
            r"\bwon't\b": "will not",
            r"\bshouldn't\b": "should not",
            r"\bwouldn't\b": "would not",
            r"\bit's\b": "it is",
            r"\bthat's\b": "that is"
        }
        
        result = text
        for casual, formal in formal_replacements.items():
            result = re.sub(casual, formal, result, flags=re.IGNORECASE)
        
        return result
    
    def _add_warmth_markers(self, text: str) -> str:
        """Add warmth markers to text"""
        warmth_markers = [
            ("I understand", "I truly understand"),
            ("This is difficult", "This must be so difficult for you"),
            ("You should", "You might consider"),
            ("Here's what to do", "Here's what I'd gently suggest"),
            ("The process", "This process")
        ]
        
        result = text
        for cold, warm in warmth_markers:
            result = result.replace(cold, warm)
        
        return result
    
    def _enhance_detail_structure(self, text: str) -> str:
        """Enhance the structure and detail of text"""
        # Add more structured formatting
        if ":" in text and not text.count("**") > 4:  # If not already heavily formatted
            lines = text.split('\n')
            enhanced_lines = []
            for line in lines:
                if ':' in line and not line.strip().startswith('•'):
                    enhanced_lines.append(f"**{line}**")
                else:
                    enhanced_lines.append(line)
            text = '\n'.join(enhanced_lines)
        
        return text
    
    def _add_appropriate_humor(self, text: str, emotion_analysis: EmotionAnalysis) -> str:
        """Add appropriate humor based on context"""
        # Only add light humor for neutral or positive emotions
        if emotion_analysis.primary_emotion in ['neutral', 'hope', 'gratitude']:
            humor_additions = [
                "\n\n(And remember, even the best security experts sometimes forget their own passwords! 😅)",
                "\n\nPS: You're definitely not alone in dealing with these tech challenges - I see questions like this all the time!",
                "\n\n💡 Pro tip: Consider yourself now part of the 'I've-learned-about-payment-security-the-hard-way' club! 😊"
            ]
            
            if random.random() < 0.3:  # 30% chance to add humor
                text += random.choice(humor_additions)
        
        return text
    
    def _apply_tone_adjustment(self, text: str, adjustment: str, emotion_analysis: EmotionAnalysis) -> str:
        """Apply specific tone adjustments"""
        if adjustment == "extra_gentle":
            text = text.replace("You need to", "When you're ready, you might")
            text = text.replace("You must", "I'd gently recommend that you")
            text = text.replace("immediately", "when you feel comfortable doing so")
        
        elif adjustment == "very_reassuring":
            reassuring_additions = [
                "You're absolutely safe now.",
                "This is completely manageable.",
                "You're taking exactly the right steps."
            ]
            text = f"{random.choice(reassuring_additions)} {text}"
        
        elif adjustment == "step_by_step":
            if "1." in text or "•" in text:
                # Already structured, enhance with clarity markers
                text = "Let me break this down into clear, manageable steps:\n\n" + text
        
        return text
    
    def _apply_language_patterns(self, text: str, patterns: Dict[str, float]) -> str:
        """Apply language pattern modifications"""
        # This is a simplified implementation
        # In a full implementation, this would use NLP to modify language patterns
        
        if patterns.get("reassurance_frequency", 1.0) > 1.2:
            reassurance_words = ["rest assured", "don't worry", "everything will be fine"]
            # Could add more sophisticated reassurance injection here
        
        if patterns.get("complexity_reduction", 1.0) < 0.9:
            # Simplify complex sentences
            text = re.sub(r'\b(however|nevertheless|furthermore|consequently)\b', 'but', text, flags=re.IGNORECASE)
        
        return text
    
    def get_personality_info(self) -> Dict[str, Any]:
        """Get information about current personality"""
        personality = self.get_current_personality()
        return {
            "name": personality.name,
            "current_personality": self.current_personality,
            "core_traits": personality.core_traits,
            "communication_style": personality.communication_style,
            "empathy_level": personality.empathy_level,
            "humor_usage": personality.humor_usage,
            "formality_level": personality.formality_level,
            "available_personalities": list(self.personality_profiles.keys())
        }
    
    def adapt_personality_to_user(self, user_feedback: Dict[str, Any]):
        """Adapt personality based on user feedback and preferences"""
        # This could be enhanced with user preference learning
        if "too_formal" in user_feedback:
            current = self.personality_profiles[self.current_personality]
            current.formality_level = max(0.1, current.formality_level - 0.2)
        
        if "more_humor" in user_feedback:
            current = self.personality_profiles[self.current_personality]
            current.humor_usage = min(1.0, current.humor_usage + 0.2)

# Global instance
personality_engine = PersonalityEngine()