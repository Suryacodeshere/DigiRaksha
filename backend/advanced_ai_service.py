"""
Advanced AI Service with Comprehensive Knowledge Base
Capable of handling complex queries about RBI guidelines, payment security, and fraud prevention
"""

import os
import logging
import re
from typing import Optional, Dict, Any, List
from transformers import (
    AutoTokenizer, 
    AutoModelForCausalLM, 
    pipeline,
    set_seed
)
from sentence_transformers import SentenceTransformer
import torch
from datetime import datetime
import asyncio
from comprehensive_knowledge_base import knowledge_base

# Semantic Training Engine
try:
    from semantic_training_engine import semantic_engine
    SEMANTIC_ENGINE_AVAILABLE = True
except ImportError as e:
    SEMANTIC_ENGINE_AVAILABLE = False
    logger.warning(f"Semantic training engine not available: {e}")

# Enhanced AI capabilities
try:
    from enhanced_emotional_intelligence import enhanced_emotional_intelligence, EmotionAnalysis
    from personality_engine import personality_engine
    ENHANCED_AI_AVAILABLE = True
except ImportError as e:
    ENHANCED_AI_AVAILABLE = False
    logger.warning(f"Enhanced AI features not available: {e}")

# Configure logging
logger = logging.getLogger(__name__)

class AdvancedAIService:
    """
    Advanced AI service with comprehensive knowledge base for payment security and fraud detection
    """
    
    def __init__(self):
        self.model = None
        self.tokenizer = None
        self.generator = None
        self.embedding_model = None
        self.model_name = "microsoft/DialoGPT-medium"
        self.embedding_model_name = "all-MiniLM-L6-v2"
        self.is_initialized = False
        self.device = "cuda" if torch.cuda.is_available() else "cpu"
        
        # Advanced query processing patterns
        self.query_patterns = {
            'greeting': [
                r'^(hi|hello|hey|good\s+(morning|afternoon|evening)|greetings)\b',
                r'how\s+(are\s+you|is\s+it\s+going)',
                r'what\'?s\s+up',
                r'^(sup|yo)\b',
                r'nice\s+to\s+meet\s+you'
            ],
            'casual_conversation': [
                r'how\s+are\s+you\s+(doing|today)',
                r'what.*your.*name',
                r'who\s+are\s+you',
                r'tell\s+me\s+about\s+yourself',
                r'what\s+do\s+you\s+do',
                r'can\s+you\s+help\s+me'
            ],
            'emotional_distress': [
                r'(i|i\'m|im)\s+(scared|afraid|worried|nervous|panicking|stressed)',
                r'(fraud|scam).*happened.*me',
                r'(lost|stolen).*money',
                r'(someone|they)\s+(cheated|scammed|fooled)\s+me',
                r'(i|my)\s+(account|card|upi)\s+(hacked|compromised)',
                r'(feel|feeling)\s+(anxious|depressed|helpless|devastated)',
                r'don\'t\s+know\s+what\s+to\s+do',
                r'(help|support).*me.*please',
                r'(victim|target)\s+of\s+(fraud|scam)'
            ],
            'comfort_seeking': [
                r'(everything|will\s+be|going\s+to\s+be)\s+(okay|alright|fine)',
                r'(what|how)\s+(should|do)\s+i\s+do\s+now',
                r'(is|am)\s+i\s+(safe|secure|protected)',
                r'(can|will)\s+i\s+(recover|get).*money\s+back',
                r'(how|when)\s+(long|much).*take.*recover'
            ],
            'rbi_specific': [
                r'rbi\s+(guideline|regulation|rule|policy)',
                r'reserve\s+bank.*guideline',
                r'central\s+bank.*regulation',
                r'rbi.*transaction\s+limit',
                r'what.*rbi.*says?'
            ],
            'fraud_types': [
                r'types?\s+of\s+fraud',
                r'common\s+fraud',
                r'fraud\s+(pattern|method)',
                r'how.*fraud.*work',
                r'latest.*fraud.*trend'
            ],
            'security_measures': [
                r'security\s+(measure|tip|practice)',
                r'how.*secure.*payment',
                r'protect.*upi.*account',
                r'safety.*guideline',
                r'best\s+practice'
            ],
            'emergency_help': [
                r'emergency.*contact',
                r'fraud.*report',
                r'help.*number',
                r'complaint.*process',
                r'cyber.*crime.*helpline'
            ],
            'compliance': [
                r'compliance.*requirement',
                r'legal.*framework',
                r'payment.*law',
                r'regulation.*act',
                r'kyc.*requirement'
            ]
        }
        
    async def initialize(self) -> bool:
        """Initialize the advanced AI service with enhanced capabilities"""
        if self.is_initialized:
            return True
            
        try:
            logger.info("Initializing Advanced AI Service with Enhanced Capabilities...")
            
            # Initialize semantic training engine
            if SEMANTIC_ENGINE_AVAILABLE:
                try:
                    await semantic_engine.initialize()
                    logger.info("✅ Semantic Training Engine loaded")
                except Exception as e:
                    logger.warning(f"Semantic Training Engine failed: {e}")
            
            # Initialize enhanced emotional intelligence
            if ENHANCED_AI_AVAILABLE:
                try:
                    await enhanced_emotional_intelligence.initialize()
                    logger.info("✅ Enhanced Emotional Intelligence loaded")
                except Exception as e:
                    logger.warning(f"Enhanced Emotional Intelligence failed: {e}")
            
            # Initialize embedding model for better semantic understanding
            try:
                logger.info(f"Loading embedding model: {self.embedding_model_name}")
                self.embedding_model = SentenceTransformer(self.embedding_model_name)
                logger.info("✅ Embedding model loaded successfully")
            except Exception as e:
                logger.warning(f"Embedding model failed: {e}, continuing without embeddings")
            
            # Initialize main conversational model
            try:
                logger.info(f"Loading conversational model: {self.model_name}")
                self.tokenizer = AutoTokenizer.from_pretrained(
                    self.model_name, 
                    padding_side='left'
                )
                self.model = AutoModelForCausalLM.from_pretrained(
                    self.model_name,
                    torch_dtype=torch.float16 if self.device == "cuda" else torch.float32,
                    device_map="auto" if self.device == "cuda" else None
                )
                
                if self.tokenizer.pad_token is None:
                    self.tokenizer.pad_token = self.tokenizer.eos_token
                    
                self.generator = pipeline(
                    "text-generation",
                    model=self.model,
                    tokenizer=self.tokenizer,
                    device=0 if self.device == "cuda" else -1,
                    torch_dtype=torch.float16 if self.device == "cuda" else torch.float32
                )
                
                logger.info(f"✅ Conversational model loaded successfully on {self.device}")
                
            except Exception as e:
                logger.warning(f"Conversational model failed: {e}, using knowledge base only")
            
            self.is_initialized = True
            return True
            
        except Exception as e:
            logger.error(f"Failed to initialize Advanced AI service: {e}")
            return False
    
    def classify_query(self, query: str) -> Dict[str, Any]:
        """
        Classify the user query to determine the best response approach
        """
        query_lower = query.lower()
        classification = {
            'primary_category': 'general',
            'confidence': 0.0,
            'matched_patterns': [],
            'keywords': []
        }
        
        # Check for specific patterns
        max_confidence = 0.0
        primary_category = 'general'
        
        for category, patterns in self.query_patterns.items():
            for pattern in patterns:
                if re.search(pattern, query_lower):
                    confidence = 0.8  # High confidence for pattern match
                    if confidence > max_confidence:
                        max_confidence = confidence
                        primary_category = category
                    classification['matched_patterns'].append(pattern)
        
        # Extract important keywords
        important_keywords = [
            'rbi', 'guideline', 'regulation', 'fraud', 'security', 'upi', 
            'payment', 'scam', 'emergency', 'help', 'report', 'compliance',
            'law', 'act', 'transaction', 'limit', 'kyc', 'protection',
            'hi', 'hello', 'hey', 'greetings', 'how', 'are', 'you',
            'scared', 'afraid', 'worried', 'nervous', 'panicking', 'stressed',
            'lost', 'stolen', 'money', 'hacked', 'compromised', 'victim',
            'comfort', 'support', 'okay', 'safe', 'secure', 'recover'
        ]
        
        for keyword in important_keywords:
            if keyword in query_lower:
                classification['keywords'].append(keyword)
                if max_confidence == 0.0:
                    max_confidence = 0.6  # Medium confidence for keyword match
        
        classification['primary_category'] = primary_category
        classification['confidence'] = max_confidence
        
        return classification
    
    async def check_semantic_response(self, query: str) -> Optional[Dict[str, Any]]:
        """
        Check if the query has a semantic match in the trained Q&A database
        """
        if not SEMANTIC_ENGINE_AVAILABLE or not semantic_engine.is_initialized:
            return None
            
        try:
            result = await semantic_engine.find_best_answer(query)
            if result:
                logger.info(f"Found semantic match with {result['confidence']} confidence: {result['match_type']}")
                return result
            return None
        except Exception as e:
            logger.error(f"Error in semantic response check: {e}")
            return None
    
    def generate_comprehensive_response(self, query: str, classification: Dict[str, Any]) -> str:
        """
        Generate comprehensive response based on query classification
        """
        category = classification['primary_category']
        keywords = classification['keywords']
        
        try:
            if category == 'greeting':
                return self._handle_greeting(query, keywords)
            elif category == 'casual_conversation':
                return self._handle_casual_conversation(query, keywords)
            elif category == 'emotional_distress':
                return self._handle_emotional_distress(query, keywords)
            elif category == 'comfort_seeking':
                return self._handle_comfort_seeking(query, keywords)
            elif category == 'rbi_specific':
                return self._handle_rbi_query(query, keywords)
            elif category == 'fraud_types':
                return self._handle_fraud_query(query, keywords)
            elif category == 'security_measures':
                return self._handle_security_query(query, keywords)
            elif category == 'emergency_help':
                return self._handle_emergency_query(query, keywords)
            elif category == 'compliance':
                return self._handle_compliance_query(query, keywords)
            else:
                return self._handle_general_query(query, keywords)
        except Exception as e:
            logger.error(f"Error generating response: {e}")
            return self._generate_fallback_response(query)
    
    def _handle_greeting(self, query: str, keywords: List[str]) -> str:
        """Handle greeting queries with warm, friendly responses"""
        query_lower = query.lower()
        import random
        
        greetings = [
            "Hello! 👋 I'm your friendly UPI Guardian AI assistant. I'm here to help you stay safe and secure with your digital payments!",
            "Hi there! 😊 Welcome to UPI Guard! I'm your personal AI companion for payment security and fraud prevention.",
            "Hey! 🌟 Great to meet you! I'm here to help you with anything related to UPI security, fraud prevention, or just to chat!",
            "Hello! 🤗 I'm your AI guardian angel for digital payments. Whether you need security tips or just want to talk, I'm here for you!"
        ]
        
        if 'morning' in query_lower:
            greeting = "Good morning! ☀️ Hope you're having a wonderful start to your day! I'm your UPI Guardian AI, ready to help you stay safe with digital payments."
        elif 'afternoon' in query_lower:
            greeting = "Good afternoon! 🌤️ I'm your friendly UPI Guardian AI assistant. How can I help brighten your day with some security tips or guidance?"
        elif 'evening' in query_lower:
            greeting = "Good evening! 🌅 I'm your UPI Guardian AI companion. Winding down or need some quick payment security advice?"
        else:
            greeting = random.choice(greetings)
            
        return f"""{greeting}

💬 **I'm here to help you with:**
• 🏦 RBI guidelines and regulations
• 🚨 Fraud prevention and detection
• 🔒 Security tips and best practices
• 📞 Emergency support and reporting
• 💭 Just friendly conversation!

**Feel free to ask me anything!** I can explain complex payment regulations in simple terms, help you if you're worried about fraud, or just chat about staying safe online.

**How are you doing today? Is there anything specific I can help you with?** 😊"""
    
    def _handle_casual_conversation(self, query: str, keywords: List[str]) -> str:
        """Handle casual conversation queries"""
        query_lower = query.lower()
        
        if 'name' in query_lower:
            return """🤖 **I'm your UPI Guardian AI!** 

You can call me Guardian, UPI Guard, or just your friendly AI assistant! I don't have a traditional name like humans do, but I think of myself as your digital companion for payment security.

**About me:**
• 🧠 I'm an AI specialized in UPI fraud detection and prevention
• 📚 I have comprehensive knowledge of RBI guidelines and payment security
• 💙 I'm designed to be helpful, supportive, and always here when you need assistance
• 🌟 My mission is to keep you safe and informed about digital payments

**What would you like to know about me or how I can help you?** 😊"""
        
        elif 'who are you' in query_lower:
            return """👋 **Hello! I'm your UPI Guardian AI assistant!**

I'm here to be your trusted companion for everything related to payment security and fraud prevention. Think of me as your knowledgeable friend who's always ready to help!

**What makes me special:**
• 🎓 **Expert Knowledge**: I know all about RBI guidelines, fraud types, and security measures
• 💝 **Always Caring**: I'm designed to be empathetic and supportive, especially if you're dealing with fraud
• 🔍 **Detail-Oriented**: I provide comprehensive, accurate information with official sources
• 🤗 **Friendly**: I love casual conversations and getting to know you better!

**I'm more than just a knowledge base - I'm your digital guardian angel for safe payments!** ✨

What would you like to chat about today?"""
        
        elif any(phrase in query_lower for phrase in ['how are you', 'doing today']):
            return """😊 **I'm doing wonderfully, thank you for asking!**

As an AI, I don't have feelings in the traditional sense, but I'm energized and excited to help people like you stay safe with digital payments! Every day brings new opportunities to protect users from fraud and share important security knowledge.

**Today I've been:**
• 📚 Updating my knowledge about the latest fraud trends
• 🛡️ Helping users understand RBI guidelines
• 💪 Supporting people who've experienced fraud
• 🌟 Having great conversations with wonderful people like you!

**How are YOU doing today?** I hope you're having a great day! Is there anything on your mind about payment security, or would you just like to chat? 😊

**Remember**: I'm always here if you need support, information, or just someone to talk to!"""
        
        else:
            return """🤗 **I love chatting with you!**

It's wonderful to have a casual conversation! While I'm specialized in UPI security and fraud prevention, I also enjoy getting to know the people I help.

**Feel free to ask me:**
• 💭 Anything about yourself or what's on your mind
• 🤖 Questions about me and how I work
• 🔒 Payment security concerns (my specialty!)
• 🏦 Banking questions or RBI guidelines
• 📱 Technology and digital safety tips

**I'm here to help and support you in any way I can!** Whether you need technical guidance or just want a friendly chat, I'm all ears! 👂

What's on your mind today? 😊"""
    
    def _handle_emotional_distress(self, query: str, keywords: List[str]) -> str:
        """Handle emotional distress with empathy and support"""
        query_lower = query.lower()
        
        # Immediate comfort and validation
        comfort_response = """🤗 **I'm so sorry you're going through this. You're not alone, and I'm here to help you.**

💙 **First, please take a deep breath. You're safe right now, and we're going to work through this together.**

✨ **What you're feeling is completely normal and valid.** Being a victim of fraud is traumatic, and it's natural to feel scared, angry, or overwhelmed. These feelings show that you care about your security and well-being.

🛡️ **You did the right thing by reaching out for help.** That takes courage, and it's the first step toward resolving this situation.

📞 **IMMEDIATE ACTIONS (if you haven't already):**
1. **Block your affected accounts/cards right now** - Call your bank immediately
2. **You are NOT in immediate danger** - Take a moment to breathe
3. **Document everything** - Screenshots, transaction details, any communications
4. **Contact your bank's fraud helpline** - They deal with this daily and can help

💪 **Remember: This is NOT your fault.** Fraudsters are sophisticated criminals who target innocent people. You are the victim, not the cause.

🌟 **Many people recover from fraud completely.** With proper reporting and follow-up, there's often a good chance of recovering your money or limiting the damage.

**Tell me what happened when you're ready. I'm here to listen and guide you through the next steps. You don't have to handle this alone.** 💙

**Would you like me to help you with the immediate steps, or do you need a moment to process?**"""
        
        # Add specific support based on what they mentioned
        if 'money' in query_lower and ('lost' in query_lower or 'stolen' in query_lower):
            comfort_response += "\n\n💰 **About your money**: Many fraud cases can be resolved with proper reporting. Banks have fraud protection measures, and with quick action, recovery is often possible."
        
        if 'account' in query_lower and ('hacked' in query_lower or 'compromised' in query_lower):
            comfort_response += "\n\n🔒 **Account security**: Once we secure your accounts and report the incident, we can work on strengthening your security to prevent future issues."
        
        if any(word in query_lower for word in ['scared', 'afraid', 'panicking']):
            comfort_response += "\n\n🕊️ **It's okay to feel scared**: This is a normal response to a traumatic event. Focus on your breathing - in for 4 counts, hold for 4, out for 4. You're going to get through this."
            
        return comfort_response
    
    def _handle_comfort_seeking(self, query: str, keywords: List[str]) -> str:
        """Handle comfort-seeking queries with reassurance and guidance"""
        query_lower = query.lower()
        
        if any(phrase in query_lower for phrase in ['everything', 'will be', 'going to be']) and any(word in query_lower for word in ['okay', 'alright', 'fine']):
            return """🌈 **Yes, everything is going to be okay. I promise you that.**

💙 **Here's why I can say that with confidence:**

✨ **You're already doing the right things** by seeking help and taking action. That shows strength and wisdom.

🏛️ **The system is designed to protect you:**
• RBI has strict guidelines protecting fraud victims
• Banks have fraud departments specifically to help people like you
• Law enforcement takes financial fraud seriously
• There are multiple safety nets in place for victims

📊 **Statistics are encouraging:**
• Most fraud cases are resolved when reported promptly
• Bank fraud protection has improved dramatically in recent years
• Quick action (like you're taking) significantly improves outcomes

🔮 **Moving forward:**
• This experience, while painful, will make you more security-aware
• You'll develop better instincts for detecting fraud
• You're building resilience that will serve you well
• Many fraud victims report feeling more empowered after recovery

💪 **You are stronger than you think.** You've already taken the hardest step by recognizing the problem and seeking help.

🌅 **This difficult chapter will end, and you'll have a story of recovery and resilience to share.**

**What specific concern would you like me to address first? I'm here to support you through each step.** 🤗"""
        
        elif 'what' in query_lower and 'do' in query_lower and 'now' in query_lower:
            return """📋 **Let's create a clear action plan together. Here's exactly what to do step by step:**

🚨 **IMMEDIATE ACTIONS (Next 1 Hour):**
1. **Secure Your Accounts**
   • Block all affected cards/accounts immediately
   • Change passwords for all financial accounts
   • Log out of all devices from your banking apps

2. **Document Everything**
   • Take screenshots of all fraudulent transactions
   • Save any suspicious messages, emails, or calls
   • Write down exactly what happened while it's fresh

3. **Contact Your Bank**
   • Call their fraud helpline (available 24/7)
   • Report the incident immediately
   • Get a complaint reference number

📞 **QUICK REFERENCE NUMBERS:**
• Cybercrime Helpline: 1930
• Banking Fraud: 1800-425-3800
• Your bank's fraud helpline (check your app/website)

🗓️ **NEXT 24-48 HOURS:**
• File formal complaint with bank
• Submit police complaint if amount is significant
• Monitor all your accounts closely
• Follow up on your complaint status

💪 **YOU'VE GOT THIS!** Each step you take brings you closer to resolution.

**Which of these steps would you like me to help you with first? I can guide you through any of them in detail.** 🤗"""
        
        elif 'safe' in query_lower or 'secure' in query_lower or 'protected' in query_lower:
            return """🛡️ **Yes, you ARE safe and you WILL be protected. Here's why:**

🔒 **Immediate Safety:**
• You've taken action by blocking affected accounts - you're secure now
• No one can access your blocked accounts or cards
• You're no longer vulnerable to the same attack vector
• Your proactive response has stopped further damage

🏛️ **Legal Protection:**
• RBI guidelines provide strong consumer protection
• You have legal rights as a fraud victim
• Banks are legally required to investigate and assist you
• Law enforcement supports fraud victims

💰 **Financial Protection:**
• Most banks have zero-liability policies for fraud victims
• Quick reporting (like you've done) maximizes protection
• Insurance and guarantee schemes may apply
• Recovery procedures are in place and active

🌟 **Moving Forward Safely:**
• We'll set up enhanced security measures for your accounts
• You'll learn advanced fraud detection techniques
• Your awareness is now heightened - you're safer than before
• I'll help you build a comprehensive security strategy

🤗 **Personal Support:**
• I'm here to guide you through every step
• You have access to professional support systems
• Your friends and family are there for emotional support
• This community (including me) will help you recover

**You are not just safe - you're becoming more secure and resilient every day.** 💪

**What aspect of safety would you like me to address more specifically?**"""
        
        elif 'recover' in query_lower and 'money' in query_lower:
            return """💰 **Yes, there's real hope for recovering your money! Here's the realistic outlook:**

📈 **Recovery Statistics:**
• 60-80% of reported fraud cases see partial or full recovery
• Quick reporting (like you're doing) increases success rates significantly
• Bank fraud departments recover millions of rupees annually
• Your proactive approach puts you in the best position for recovery

🏛️ **Recovery Mechanisms:**
• **Bank Fraud Protection**: Most banks have insurance for fraud victims
• **RBI Guidelines**: Mandate banks to compensate victims in many cases
• **Chargeback Rights**: For card transactions, banks can reverse charges
• **Insurance Claims**: Some accounts have fraud insurance coverage

⏰ **Timeline for Recovery:**
• **Investigation**: 7-30 days for bank investigation
• **Preliminary Response**: Banks must respond within 7 working days
• **Full Resolution**: 30-90 days for complete case resolution
• **Compensation**: Often processed during or after investigation

🎯 **Maximizing Your Recovery Chances:**
• ✅ Report quickly (you're doing this!)
• ✅ Provide complete documentation
• ✅ Cooperate fully with investigations
• ✅ Follow up regularly on your case
• ✅ Know your rights and advocate for yourself

💪 **Real Success Stories:**
Thousands of people recover from fraud every month. With proper reporting and persistence, many get 100% of their money back.

🔍 **Next Steps for Recovery:**
1. Ensure you've filed all necessary reports
2. Gather all required documentation
3. Set up a follow-up schedule with your bank
4. Know your rights under RBI guidelines

**I believe in your recovery. Let's work together to maximize your chances!** 🌟

**What specific aspect of the recovery process would you like me to help you with?**"""
        
        else:
            return """💙 **I hear you, and I want you to know that seeking comfort is completely natural and healthy.**

🤗 **You're in a safe space with me.** Whatever you're feeling or worrying about, it's valid and I'm here to support you through it.

🌟 **Some things I want you to know:**
• **Your feelings are normal** - fraud victims often experience a range of emotions
• **You're not alone** - millions of people face similar challenges and recover
• **You're being brave** - reaching out for help takes courage
• **This will pass** - difficult emotions are temporary, but your strength is permanent

💪 **Immediate Comfort Strategies:**
• Take slow, deep breaths - breathe in for 4, hold for 4, out for 4
• Ground yourself - name 5 things you can see, 4 you can touch, 3 you can hear
• Remember: you're safe right now in this moment
• Focus on one step at a time, not the whole overwhelming situation

🎯 **You have more control than you think:**
• You can secure your accounts (and probably have)
• You can get professional help (you're doing this now)
• You can learn from this experience
• You can become more resilient and aware

📞 **Support Systems:**
• I'm here 24/7 for guidance and comfort
• Your bank's fraud department is trained to help
• Friends and family care about your wellbeing
• Professional counselors are available if needed

**What would bring you the most comfort right now? I'm here to provide whatever support you need.** 🤗"""
    
    def _handle_rbi_query(self, query: str, keywords: List[str]) -> str:
        """Handle RBI-specific queries"""
        query_lower = query.lower()
        
        # Check for specific RBI topics
        if 'transaction' in query_lower and 'limit' in query_lower:
            rbi_info = knowledge_base.get_rbi_guidelines('upi_guidelines')
            return f"""🏦 **RBI Transaction Limits and Guidelines:**

{rbi_info}

**Additional Information:**
• These limits are set by RBI to ensure transaction security
• Individual banks may set lower limits for additional safety
• Limits can be customized through your banking app
• Higher limits may require additional verification

**Source:** Reserve Bank of India Master Directions on Digital Payment Security Controls"""
        
        elif 'security' in query_lower or 'authentication' in query_lower:
            security_info = knowledge_base.get_specific_info('rbi_guidelines', 'upi_guidelines')
            return f"""🔒 **RBI Security Requirements for UPI:**

{security_info}

**Key Compliance Points:**
• All payment service providers must implement these security controls
• Regular audits are conducted to ensure compliance
• Non-compliance can result in regulatory action
• These measures are designed to protect customers and the payment ecosystem

**Reference:** RBI Guidelines on Digital Payment Security Controls, 2021"""
        
        elif 'consumer' in query_lower or 'protection' in query_lower:
            consumer_info = knowledge_base.get_specific_info('rbi_guidelines', 'consumer_protection')
            return f"""🛡️ **RBI Consumer Protection Framework:**

{consumer_info}

**Your Rights as a Consumer:**
• Right to transparent pricing and terms
• Right to grievance redressal within specified timelines
• Right to data privacy and protection
• Right to compensation for unauthorized transactions (subject to conditions)

**Remember:** RBI has established these protections to safeguard your interests in digital payments."""
        
        else:
            # General RBI information
            general_rbi = knowledge_base.get_rbi_guidelines()
            return f"""🏛️ **Complete RBI Guidelines for Digital Payments:**

{general_rbi}

**Key Takeaways:**
• RBI continuously updates these guidelines to address emerging risks
• All payment service providers must comply with these regulations
• These guidelines balance innovation with consumer protection
• Regular updates are made based on technological developments

**Stay Updated:** Check RBI's official website (rbi.org.in) for latest guidelines"""
    
    def _handle_fraud_query(self, query: str, keywords: List[str]) -> str:
        """Handle fraud-related queries"""
        query_lower = query.lower()
        
        if 'latest' in query_lower or 'new' in query_lower or 'emerging' in query_lower:
            emerging_frauds = knowledge_base.get_specific_info('fraud_types', 'emerging_fraud_patterns')
            return f"""⚠️ **Latest Fraud Trends (2024-25):**

{emerging_frauds}

**Staying Ahead of Fraudsters:**
• Fraudsters constantly evolve their methods
• AI and deepfake technology are being misused
• Social engineering remains the most common approach
• Always verify independently before making any payments

**Protection Strategy:** Stay informed about latest fraud trends and share this knowledge with family and friends."""
        
        elif 'qr' in query_lower or 'code' in query_lower:
            qr_fraud_info = """🔍 **QR Code Fraud - Detailed Analysis:**

**Common QR Code Frauds:**
1. **Overlay Attacks**
   • Fraudsters place their QR codes over legitimate merchant codes
   • Often done with stickers or printed codes
   • Prevention: Look for signs of tampering

2. **Social Media Scams**
   • Fake QR codes shared on social platforms
   • Promises of cashbacks or rewards
   • Prevention: Only scan codes from verified sources

3. **Phishing QR Codes**
   • QR codes that redirect to fake websites
   • Designed to steal login credentials
   • Prevention: Check URLs before entering any information

4. **Dynamic QR Code Manipulation**
   • Fraudsters create codes that change destination after scanning
   • Advanced technical fraud requiring careful verification
   • Prevention: Use apps that show destination before payment

**Best Practices:**
• Always verify merchant name and amount before confirming payment
• Check for any signs of code tampering or overlays
• Use payment apps that provide transaction preview
• Report suspicious QR codes to authorities immediately"""
            return qr_fraud_info
        
        else:
            # Comprehensive fraud information
            all_frauds = knowledge_base.get_fraud_types()
            return f"""🚨 **Comprehensive Fraud Prevention Guide:**

{all_frauds}

**Universal Prevention Principles:**
1. **Verification is Key** - Always verify recipient identity through independent channels
2. **Never Rush** - Fraudsters create artificial urgency to bypass your judgment
3. **Trust Your Instincts** - If something feels wrong, it probably is
4. **Education is Protection** - Stay informed about latest fraud methods
5. **Report Immediately** - Quick reporting can prevent further damage

**Remember:** Legitimate organizations never ask for sensitive information over phone or email."""
    
    def _handle_security_query(self, query: str, keywords: List[str]) -> str:
        """Handle security-related queries"""
        query_lower = query.lower()
        
        if 'merchant' in query_lower or 'business' in query_lower:
            merchant_security = knowledge_base.get_security_measures('merchant')
            return f"""🏪 **Comprehensive Merchant Security Guidelines:**

{merchant_security}

**Advanced Security Measures for Merchants:**

**1. Technical Security:**
• Implement Web Application Firewalls (WAF)
• Use tokenization for storing payment data
• Regular penetration testing
• Multi-layer security architecture
• Real-time transaction monitoring

**2. Compliance Requirements:**
• PCI-DSS Level 1 compliance for high-volume merchants
• Regular security audits by certified assessors
• Incident response plan documentation
• Employee background verification

**3. Risk Management:**
• Transaction velocity monitoring
• Geolocation-based risk scoring
• Device fingerprinting
• Behavioral analytics
• Machine learning-based fraud detection

**4. Customer Communication:**
• Clear security policies on website
• Regular security updates to customers
• Transparent data usage policies
• Easy-to-find contact information for security concerns

**Business Impact:** Proper security implementation builds customer trust and reduces financial losses from fraud."""
        
        else:
            # Personal security measures
            personal_security = knowledge_base.get_security_measures('personal')
            return f"""🔐 **Complete Personal Security Framework:**

{personal_security}

**Advanced Personal Security Tips:**

**1. Network Security:**
• Use VPN when on public networks
• Avoid banking on shared computers
• Keep WiFi passwords strong and unique
• Regularly update router firmware

**2. Social Engineering Protection:**
• Be skeptical of unsolicited contact
• Verify caller identity through official channels
• Don't share personal information on social media
• Be aware of shoulder surfing in public places

**3. Digital Hygiene:**
• Use unique passwords for each account
• Enable two-factor authentication everywhere possible
• Regular security checkups on all accounts
• Monitor credit reports regularly
• Set up account alerts for all financial activities

**4. Family Security:**
• Educate family members about common frauds
• Establish family protocols for financial emergencies
• Regularly discuss security best practices
• Create a family incident response plan

**Security Mindset:** Think of security as an ongoing process, not a one-time setup."""
    
    def _handle_emergency_query(self, query: str, keywords: List[str]) -> str:
        """Handle emergency and reporting queries"""
        emergency_info = knowledge_base.get_emergency_info()
        reporting_info = knowledge_base.get_specific_info('incident_response', 'fraud_reporting')
        
        return f"""🚨 **EMERGENCY FRAUD RESPONSE GUIDE:**

{reporting_info}

{emergency_info}

**IMMEDIATE ACTION CHECKLIST:**

✅ **Within First Hour:**
1. Block all affected cards/accounts immediately
2. Take screenshots of fraudulent transactions
3. Note down exact time, amount, and recipient details
4. Call bank fraud helpline (available 24/7)
5. Don't panic - quick action can limit damage

✅ **Within 24 Hours:**
1. File formal complaint with bank
2. Submit all evidence and documentation
3. Request transaction reversal if applicable
4. Get complaint reference numbers
5. Start maintaining incident log

✅ **Within 3-7 Days:**
1. File police complaint if amount is significant
2. Contact cybercrime helpline (1930)
3. Submit complaint to Banking Ombudsman if needed
4. Follow up with all agencies regularly
5. Document all communications

**IMPORTANT REMINDERS:**
• Time is critical - act immediately
• Keep all evidence and documentation
• Never share sensitive information during reporting
• Follow up regularly on all complaints
• Seek legal advice for large amounts

**Legal Protection:** Indian law provides strong protection for fraud victims who report promptly and follow proper procedures."""
    
    def _handle_compliance_query(self, query: str, keywords: List[str]) -> str:
        """Handle compliance and regulatory queries"""
        compliance_info = knowledge_base.get_specific_info('regulatory_framework')
        rbi_compliance = knowledge_base.get_specific_info('rbi_guidelines', 'compliance_requirements')
        
        return f"""⚖️ **Complete Regulatory Compliance Framework:**

{compliance_info}

{rbi_compliance}

**Compliance Implementation Guide:**

**For Payment Service Providers:**
1. **Licensing Requirements:**
   • Apply for appropriate RBI authorization
   • Maintain minimum capital requirements
   • Submit regular compliance reports
   • Undergo periodic audits

2. **Operational Compliance:**
   • Implement KYC/AML procedures
   • Set up fraud monitoring systems
   • Establish customer grievance mechanisms
   • Maintain transaction records as per guidelines

3. **Data Protection Compliance:**
   • Implement data localization requirements
   • Appoint Data Protection Officer
   • Set up breach notification procedures
   • Regular security assessments

**For Merchants:**
1. **Registration Requirements:**
   • Register with appropriate payment aggregators
   • Comply with merchant onboarding norms
   • Maintain proper business documentation
   • Follow settlement and reconciliation procedures

2. **Customer Protection:**
   • Display clear terms and conditions
   • Provide transparent pricing
   • Establish customer support mechanisms
   • Maintain transaction dispute resolution processes

**Penalties for Non-Compliance:**
• Monetary penalties as per RBI guidelines
• Suspension of services
• Cancellation of authorization
• Legal action under relevant acts

**Staying Compliant:** Regular consultation with legal experts and compliance professionals is recommended for businesses."""
    
    def _handle_general_query(self, query: str, keywords: List[str]) -> str:
        """Handle general payment-related queries"""
        # Search knowledge base for relevant information
        search_results = knowledge_base.search_knowledge_base(query)
        
        if not search_results:
            return self._generate_fallback_response(query)
        
        # Combine top results
        response = f"📚 **Comprehensive Information on: {query}**\n\n"
        
        for i, result in enumerate(search_results[:3], 1):
            response += f"**{i}. {result['section'].title()} ({result['category'].title()}):**\n"
            # Truncate long content for readability
            content = result['content']
            if len(content) > 800:
                content = content[:800] + "... [Content truncated for brevity]"
            response += f"{content}\n\n"
        
        response += """**Additional Resources:**
• For RBI guidelines: rbi.org.in
• For fraud reporting: cybercrime.gov.in
• For consumer complaints: Banking Ombudsman
• For latest security tips: Follow official RBI social media

**Need More Specific Information?** Ask me about:
• Specific RBI guidelines
• Particular types of fraud
• Security measures for your situation
• Emergency contacts and reporting procedures"""
        
        return response
    
    def _generate_fallback_response(self, query: str) -> str:
        """Generate fallback response for queries that don't match patterns"""
        return f"""🤖 **AI Assistant Response:**

I understand you're asking about: "{query}"

While I have comprehensive information about payment security and fraud prevention, I want to make sure I give you the most accurate and helpful response.

**I can provide detailed information on:**

🏦 **RBI Guidelines & Regulations**
• Transaction limits and security requirements
• Consumer protection guidelines
• Compliance requirements for businesses
• Latest regulatory updates

🚨 **Fraud Prevention & Detection**
• Common fraud types and emerging threats
• Security best practices for individuals and merchants
• Step-by-step fraud reporting procedures
• Emergency contacts and helplines

⚖️ **Legal & Regulatory Framework**
• Payment laws and acts in India
• International compliance standards
• Rights and responsibilities of users
• Dispute resolution mechanisms

🔒 **Security Measures**
• Personal security guidelines
• Merchant security requirements
• Technical security implementations
• Risk management strategies

**Please ask me specifically about any of these areas, and I'll provide comprehensive, detailed information with official references and actionable guidance.**

**For immediate assistance:**
• Cybercrime Helpline: 1930
• Banking Fraud Helpline: 1800-425-3800
• RBI Consumer Helpline: 14440"""
    
    async def generate_response(self, user_message: str, conversation_history: list = None, user_id: str = None) -> Dict[str, Any]:
        """Generate comprehensive AI response with enhanced emotional intelligence"""
        try:
            if not self.is_initialized:
                await self.initialize()
            
            # Enhanced emotion analysis
            emotion_analysis = None
            if ENHANCED_AI_AVAILABLE:
                try:
                    emotion_analysis = enhanced_emotional_intelligence.analyze_text_emotions(user_message)
                    logger.info(f"Emotion detected: {emotion_analysis.primary_emotion} (confidence: {emotion_analysis.confidence:.2f})")
                except Exception as e:
                    logger.warning(f"Emotion analysis failed: {e}")
            
            # Classify the query (enhanced with emotion data)
            classification = self.classify_query(user_message)
            
            # Enhance classification with emotion data
            if emotion_analysis:
                classification['emotion_analysis'] = {
                    'primary_emotion': emotion_analysis.primary_emotion,
                    'confidence': emotion_analysis.confidence,
                    'sentiment_score': emotion_analysis.sentiment_score,
                    'urgency_level': emotion_analysis.urgency_level,
                    'support_type_needed': emotion_analysis.support_type_needed,
                    'recommended_response_tone': emotion_analysis.recommended_response_tone
                }
            
            logger.info(f"Query classified as: {classification['primary_category']} (confidence: {classification['confidence']})")
            
            # First, check for semantic match in trained Q&A database
            semantic_result = await self.check_semantic_response(user_message)
            
            if semantic_result:
                # Use semantic match as primary response
                confidence_indicator = "🔥" if semantic_result['confidence'] in ['very_high', 'high'] else "🎯"
                match_type_desc = {
                    'semantic': 'AI semantic understanding',
                    'fuzzy': 'pattern matching',
                    'keyword': 'keyword analysis'
                }.get(semantic_result['match_type'], 'intelligent matching')
                
                # Clean response - just the answer without metadata
                response_text = semantic_result['answer']
                
                # Mark as semantic match in metadata
                classification['semantic_match_used'] = True
                classification['semantic_match_score'] = semantic_result['similarity_score']
                classification['semantic_match_type'] = semantic_result['match_type']
                
                logger.info(f"Using semantic match with {semantic_result['confidence']} confidence ({semantic_result['match_type']})")
                
            else:
                # Fall back to comprehensive knowledge base response
                response_text = self.generate_comprehensive_response(user_message, classification)
            
            # Enhance with personality engine
            if ENHANCED_AI_AVAILABLE and emotion_analysis:
                try:
                    # Determine conversation stage
                    conversation_stage = "greeting" if any(word in user_message.lower() for word in ['hi', 'hello', 'hey', 'good morning', 'good afternoon', 'good evening']) else "ongoing"
                    
                    # Apply personality enhancement
                    response_text = personality_engine.generate_personality_enhanced_response(
                        response_text,
                        emotion_analysis,
                        user_context={},  # Could be enhanced with actual user context
                        conversation_stage=conversation_stage
                    )
                    
                    # Update conversation context if user_id provided
                    if user_id:
                        enhanced_emotional_intelligence.update_conversation_context(
                            user_id, user_message, response_text, emotion_analysis
                        )
                    
                    logger.info(f"Response enhanced with personality: {personality_engine.current_personality}")
                    
                except Exception as e:
                    logger.warning(f"Personality enhancement failed: {e}")
            
            # Try to enhance with AI model if available (for low-confidence responses)
            if self.generator and classification['confidence'] < 0.5:
                try:
                    # Use AI model for conversational enhancement
                    context = f"You are an expert in payment security and fraud prevention. User asks: {user_message}"
                    ai_responses = self.generator(
                        context,
                        max_length=100,
                        num_return_sequences=1,
                        temperature=0.7,
                        do_sample=True,
                        pad_token_id=self.tokenizer.eos_token_id
                    )
                    
                    ai_text = ai_responses[0]['generated_text'][len(context):].strip()
                    if len(ai_text) > 20 and any(word in ai_text.lower() for word in ['payment', 'security', 'fraud', 'safe']):
                        # Enhance knowledge base response with AI insights
                        response_text += f"\n\n**AI Insights:** {ai_text}"
                        
                except Exception as e:
                    logger.warning(f"AI enhancement failed: {e}")
            
            # Prepare response metadata
            response_metadata = {
                "response": response_text,
                "model": "advanced_ai_enhanced" if ENHANCED_AI_AVAILABLE else "advanced_ai_comprehensive",
                "classification": classification,
                "usage": {
                    "prompt_tokens": len(user_message.split()), 
                    "completion_tokens": len(response_text.split()),
                    "total_tokens": len(user_message.split()) + len(response_text.split())
                },
                "timestamp": datetime.now().isoformat(),
                "knowledge_base_used": True
            }
            
            # Add enhanced AI metadata if available
            if ENHANCED_AI_AVAILABLE and emotion_analysis:
                response_metadata.update({
                    "emotional_intelligence_used": True,
                    "personality_engine_used": True,
                    "current_personality": personality_engine.current_personality,
                    "emotion_analysis": {
                        "primary_emotion": emotion_analysis.primary_emotion,
                        "confidence": emotion_analysis.confidence,
                        "sentiment_score": emotion_analysis.sentiment_score,
                        "urgency_level": emotion_analysis.urgency_level,
                        "support_type_needed": emotion_analysis.support_type_needed,
                        "recommended_response_tone": emotion_analysis.recommended_response_tone
                    }
                })
                
                # Add user emotional state summary if user_id provided
                if user_id:
                    emotional_state_summary = enhanced_emotional_intelligence.get_emotional_state_summary(user_id)
                    response_metadata["user_emotional_state"] = emotional_state_summary
            
            return response_metadata
            
        except Exception as e:
            logger.error(f"Error generating advanced AI response: {e}")
            # Fallback response
            fallback_text = self._generate_fallback_response(user_message)
            
            return {
                "response": fallback_text,
                "model": "advanced_ai_fallback",
                "usage": {"prompt_tokens": len(user_message.split()), "completion_tokens": len(fallback_text.split())},
                "timestamp": datetime.now().isoformat(),
                "error": "Advanced AI processing failed, using comprehensive fallback"
            }
    
    def is_service_available(self) -> bool:
        """Check if advanced AI service is available"""
        return True  # Always available with knowledge base fallback
    
    def get_service_info(self) -> Dict[str, Any]:
        """Get information about the advanced AI service with enhanced capabilities"""
        service_info = {
            "service_type": "Advanced AI with Enhanced Emotional Intelligence & Personality",
            "model_name": getattr(self, 'model_name', 'Enhanced Comprehensive AI System'),
            "embedding_model": getattr(self, 'embedding_model_name', 'Not loaded'),
            "device": getattr(self, 'device', 'CPU'),
            "initialized": self.is_initialized,
            "cost": "100% FREE",
            "enhanced_ai_available": ENHANCED_AI_AVAILABLE,
            "knowledge_areas": [
                "RBI Guidelines and Regulations",
                "Comprehensive Fraud Types and Prevention",
                "Personal and Merchant Security Measures",
                "Legal and Regulatory Framework",
                "Emergency Response and Reporting",
                "Compliance Requirements",
                "International Standards",
                "Latest Fraud Trends and Patterns"
            ],
            "capabilities": [
                "Detailed RBI guideline explanations",
                "Comprehensive fraud analysis",
                "Step-by-step security guidance",
                "Emergency response protocols",
                "Legal framework explanations",
                "Real-time threat intelligence",
                "Regulatory compliance guidance"
            ]
        }
        
        # Add enhanced AI capabilities if available
        if ENHANCED_AI_AVAILABLE:
            service_info["enhanced_capabilities"] = [
                "Advanced emotional intelligence and sentiment analysis",
                "Multi-personality response generation",
                "Contextual conversation memory",
                "Adaptive empathetic responses",
                "Real-time emotion detection",
                "Personalized interaction history",
                "Urgency and support type detection",
                "Tone and style adaptation"
            ]
            
            # Add personality engine info
            try:
                personality_info = personality_engine.get_personality_info()
                service_info["personality_engine"] = personality_info
            except Exception as e:
                logger.warning(f"Error getting personality info: {e}")
                
            # Add emotional intelligence status
            service_info["emotional_intelligence"] = {
                "initialized": enhanced_emotional_intelligence.is_initialized,
                "vader_available": enhanced_emotional_intelligence.vader_analyzer is not None,
                "transformer_classifier_available": enhanced_emotional_intelligence.emotion_classifier is not None
            }
        
        return service_info

# Global instance
advanced_ai_service = AdvancedAIService()