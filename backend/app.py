from flask import Flask, request, jsonify
from flask_cors import CORS
import joblib
import numpy as np
import os
from datetime import datetime
import logging
from dotenv import load_dotenv
from openai import OpenAI
from advanced_ai_service import advanced_ai_service
from custom_responses import get_custom_response, enhance_backend_response
import asyncio

# Load environment variables
load_dotenv()

app = Flask(__name__)
CORS(app)  # Enable CORS for all routes

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Initialize OpenAI client (optional)
openai_client = None
try:
    api_key = os.getenv('OPENAI_API_KEY')
    if api_key:
        openai_client = OpenAI(api_key=api_key)
        logger.info("OpenAI client initialized successfully")
    else:
        logger.info("OpenAI API key not found. Using free AI service instead.")
except Exception as e:
    logger.warning(f"OpenAI client initialization failed: {str(e)}. Using free AI service.")

# Initialize Advanced AI Service
logger.info("Initializing Advanced AI Service with Comprehensive Knowledge Base...")
try:
    # Run async initialization in sync context
    loop = asyncio.new_event_loop()
    asyncio.set_event_loop(loop)
    loop.run_until_complete(advanced_ai_service.initialize())
    logger.info("✅ Advanced AI Service with Comprehensive Knowledge Base ready!")
except Exception as e:
    logger.warning(f"Advanced AI Service initialization: {e} (will use comprehensive fallback)")

# Global model variable
model = None

def load_model():
    """Load the XGBoost fraud detection model"""
    global model
    model_path = r"C:\Users\ayush\OneDrive\Desktop\xgb_fraud_model.joblib"
    
    try:
        if os.path.exists(model_path):
            model = joblib.load(model_path)
            logger.info("XGBoost fraud model loaded successfully")
            return True
        else:
            logger.error(f"Model file not found at: {model_path}")
            return False
    except Exception as e:
        logger.error(f"Error loading model: {str(e)}")
        return False

def extract_features_from_upi(upi_id):
    """
    Extract features from UPI ID for fraud prediction.
    This is a simplified feature extraction - adjust based on your model's requirements.
    """
    try:
        # Basic features that might be relevant for fraud detection
        features = {}
        
        # UPI ID length
        features['upi_id_length'] = len(upi_id)
        
        # Domain extraction
        if '@' in upi_id:
            username, domain = upi_id.split('@', 1)
            features['username_length'] = len(username)
            features['domain_length'] = len(domain)
            
            # Common legitimate domains (you can expand this list)
            legitimate_domains = ['paytm', 'phonepe', 'gpay', 'amazonpay', 'ybl', 'okaxis', 'okicici', 'okhdfcbank']
            features['is_legitimate_domain'] = 1 if domain.lower() in legitimate_domains else 0
            
            # Check for suspicious patterns
            features['has_numbers_in_username'] = 1 if any(c.isdigit() for c in username) else 0
            features['has_special_chars'] = 1 if any(c in username for c in ['.', '-', '_']) else 0
            
        else:
            # Invalid UPI format
            features['username_length'] = 0
            features['domain_length'] = 0
            features['is_legitimate_domain'] = 0
            features['has_numbers_in_username'] = 0
            features['has_special_chars'] = 0
        
        # Time-based features (current hour as proxy for transaction time)
        current_hour = datetime.now().hour
        features['transaction_hour'] = current_hour
        features['is_night_time'] = 1 if (current_hour >= 22 or current_hour <= 6) else 0
        features['is_business_hours'] = 1 if (9 <= current_hour <= 17) else 0
        
        return features
    
    except Exception as e:
        logger.error(f"Error extracting features: {str(e)}")
        return None

def prepare_model_input(features):
    """
    Convert extracted features to model input format.
    Adjust this based on your model's expected input format.
    """
    try:
        # Convert features dict to array in the order expected by your model
        # You may need to adjust this based on how your model was trained
        feature_array = [
            features.get('upi_id_length', 0),
            features.get('username_length', 0),
            features.get('domain_length', 0),
            features.get('is_legitimate_domain', 0),
            features.get('has_numbers_in_username', 0),
            features.get('has_special_chars', 0),
            features.get('transaction_hour', 12),
            features.get('is_night_time', 0),
            features.get('is_business_hours', 1)
        ]
        
        return np.array(feature_array).reshape(1, -1)
    
    except Exception as e:
        logger.error(f"Error preparing model input: {str(e)}")
        return None

@app.route('/chat', methods=['POST'])
def chat_with_gpt():
    """
    Enhanced AI Chat with emotional intelligence and personality
    Expected input: {
        "message": "user message",
        "conversation_history": [{"role": "user", "content": "..."}] (optional),
        "user_id": "unique_user_identifier" (optional),
        "personality": "compassionate_guardian|knowledgeable_mentor|friendly_companion" (optional)
    }
    """
    try:
        # Get request data first
        data = request.get_json()
        if not data or 'message' not in data:
            return jsonify({'error': 'Message is required'}), 400
        
        user_message = data['message'].strip().lower()
        if not user_message:
            return jsonify({'error': 'Message cannot be empty'}), 400
        
        # Extract additional parameters
        user_id = data.get('user_id', None)
        personality = data.get('personality', None)
        conversation_history = data.get('conversation_history', [])
        
        # Set personality if specified
        if personality:
            try:
                # Import personality engine if available
                from personality_engine import personality_engine
                personality_engine.set_personality(personality)
                logger.info(f"Personality set to: {personality}")
            except ImportError:
                logger.warning("Personality engine not available")
            except Exception as e:
                logger.warning(f"Failed to set personality: {e}")
        
        # Check for custom responses first
        custom_response = get_custom_response(data['message'].strip())
        if custom_response:
            response_data = {
                'response': custom_response,
                'model': 'Custom Response System',
                'usage': {
                    'prompt_tokens': len(data['message'].split()), 
                    'completion_tokens': len(custom_response.split()),
                    'total_tokens': len(data['message'].split()) + len(custom_response.split())
                },
                'timestamp': datetime.now().isoformat(),
                'service': 'Custom Responses (User-Specified)'
            }
            return jsonify(response_data)
            
        # Use enhanced AI service first, fallback to OpenAI if needed
        try:
            # Run async function in sync context
            loop = asyncio.new_event_loop()
            asyncio.set_event_loop(loop)
            
            # Get original message (not lowercased)
            original_message = data['message'].strip()
            
            ai_response = loop.run_until_complete(
                advanced_ai_service.generate_response(
                    original_message, 
                    conversation_history=conversation_history,
                    user_id=user_id
                )
            )
            
            # Enhance with custom responses if applicable
            enhanced_response = enhance_backend_response(original_message, ai_response['response'])
            ai_response['response'] = enhanced_response
            
            # Prepare response with enhanced AI metadata
            response_data = {
                'response': ai_response['response'],
                'model': ai_response['model'], 
                'usage': ai_response['usage'],
                'timestamp': ai_response['timestamp'],
                'service': 'Enhanced AI (100% Free!)' if ai_response.get('emotional_intelligence_used', False) else 'Free AI (100% Free!)'
            }
            
            # Add enhanced AI metadata if available
            if ai_response.get('emotional_intelligence_used', False):
                response_data['enhanced_features'] = {
                    'emotional_intelligence': ai_response.get('emotional_intelligence_used', False),
                    'personality_engine': ai_response.get('personality_engine_used', False),
                    'current_personality': ai_response.get('current_personality'),
                    'emotion_analysis': ai_response.get('emotion_analysis'),
                    'user_emotional_state': ai_response.get('user_emotional_state')
                }
            
            return jsonify(response_data)
            
        except Exception as free_ai_error:
            logger.error(f"Free AI service error: {str(free_ai_error)}")
            
            # Fallback to OpenAI if available
            if openai_client is None:
                return jsonify({
                    'error': 'AI service temporarily unavailable',
                    'fallback': 'Please try again or contact support'
                }), 503
        
    except Exception as e:
        logger.error(f"Error in chat endpoint: {str(e)}")
        return jsonify({'error': 'Internal server error'}), 500

@app.route('/health', methods=['GET'])
def health_check():
    """Health check endpoint"""
    # Get advanced AI service info
    ai_service_info = advanced_ai_service.get_service_info()
    
    return jsonify({
        'status': 'healthy',
        'model_loaded': model is not None,
        'chatgpt_available': openai_client is not None,
        'advanced_ai_available': advanced_ai_service.is_service_available(),
        'ai_service_info': ai_service_info,
        'timestamp': datetime.now().isoformat()
    })

@app.route('/predict-fraud', methods=['POST'])
def predict_fraud():
    """
    Predict fraud probability for a UPI ID
    Expected input: {"upi_id": "example@paytm"}
    """
    try:
        # Get request data
        data = request.get_json()
        if not data or 'upi_id' not in data:
            return jsonify({'error': 'UPI ID is required'}), 400
        
        upi_id = data['upi_id'].strip()
        if not upi_id:
            return jsonify({'error': 'UPI ID cannot be empty'}), 400
        
        # Check if model is loaded
        if model is None:
            return jsonify({'error': 'Model not loaded'}), 500
        
        # Extract features
        features = extract_features_from_upi(upi_id)
        if features is None:
            return jsonify({'error': 'Error extracting features'}), 500
        
        # Prepare model input
        model_input = prepare_model_input(features)
        if model_input is None:
            return jsonify({'error': 'Error preparing model input'}), 500
        
        # Make prediction
        try:
            # Get fraud probability
            fraud_probability = model.predict_proba(model_input)[0]
            
            # Assuming binary classification: [legitimate_prob, fraud_prob]
            if len(fraud_probability) >= 2:
                fraud_prob = float(fraud_probability[1])
            else:
                fraud_prob = float(fraud_probability[0])
            
            # Calculate safety score (inverse of fraud probability)
            safety_score = max(0, min(100, int((1 - fraud_prob) * 100)))
            
            # Determine risk level
            if fraud_prob <= 0.3:
                risk_level = 'safe'
            elif fraud_prob <= 0.7:
                risk_level = 'moderate'
            else:
                risk_level = 'danger'
            
            response = {
                'upi_id': upi_id,
                'fraud_probability': fraud_prob,
                'safety_score': safety_score,
                'risk_level': risk_level,
                'features_used': features,
                'model_prediction': 'fraud' if fraud_prob > 0.5 else 'legitimate',
                'confidence': max(fraud_prob, 1 - fraud_prob),
                'timestamp': datetime.now().isoformat()
            }
            
            logger.info(f"Prediction made for UPI: {upi_id}, Risk: {risk_level}, Safety: {safety_score}")
            return jsonify(response)
            
        except Exception as e:
            logger.error(f"Error during model prediction: {str(e)}")
            return jsonify({'error': 'Model prediction failed'}), 500
    
    except Exception as e:
        logger.error(f"Error in predict_fraud endpoint: {str(e)}")
        return jsonify({'error': 'Internal server error'}), 500

@app.route('/model-info', methods=['GET'])
def model_info():
    """Get information about the loaded model"""
    if model is None:
        return jsonify({'error': 'Model not loaded'}), 500
    
    try:
        info = {
            'model_type': type(model).__name__,
            'model_loaded': True,
            'feature_count': 9,  # Based on our feature extraction
            'features': [
                'upi_id_length',
                'username_length',
                'domain_length',
                'is_legitimate_domain',
                'has_numbers_in_username',
                'has_special_chars',
                'transaction_hour',
                'is_night_time',
                'is_business_hours'
            ]
        }
        return jsonify(info)
    except Exception as e:
        logger.error(f"Error getting model info: {str(e)}")
        return jsonify({'error': 'Error retrieving model info'}), 500

if __name__ == '__main__':
    # Try to load the model on startup, but don't fail if it's not available
    load_model_success = load_model()
    if load_model_success:
        logger.info("XGBoost fraud model loaded successfully")
    else:
        logger.warning("XGBoost fraud model not loaded - fraud prediction will be unavailable")
    
    # Start the server regardless of model status (ChatGPT can still work)
    logger.info("Starting Flask server on port 5000...")
    app.run(debug=True, host='0.0.0.0', port=5000)
