"""
Custom responses for the chatbot as specified by user requirements
"""

CUSTOM_RESPONSES = {
    # Exact responses as requested by user
    "payment_request_safety": {
        "triggers": [
            "how can i check if a payment request is safe",
            "payment request safe",
            "verify payment request",
            "check payment request",
            "is payment request safe"
        ],
        "response": """You should always verify the source before making any payment. Double-check the sender's details, confirm through official channels, and never trust links or QR codes sent by unknown people. If the request feels urgent or suspicious, it's best to stop and verify first."""
    },
    
    "fraud_warning_signs": {
        "triggers": [
            "what are the warning signs of digital payment fraud",
            "warning signs of fraud",
            "fraud warning signs",
            "signs of fraud",
            "how to detect fraud"
        ],
        "response": """Some common warning signs include:

Unexpected requests for money from strangers or even known contacts.

Urgent messages pressuring you to pay immediately.

Suspicious links, QR codes, or phone numbers.

Requests to share your OTP, PIN, or CVV.

If you notice any of these, do not proceed."""
    },
    
    "scam_response": {
        "triggers": [
            "what should i do if i think i've been scammed",
            "been scammed",
            "think i've been scammed",
            "if scammed",
            "scam happened"
        ],
        "response": """If you suspect a scam:

Stop the transaction immediately (if possible).

Contact your bank or payment app's customer support.

Report the fraud to the cybercrime helpline (1930 in India) or local authorities.

Change your passwords and secure your accounts."""
    },
    
    "emergency_helplines": {
        "triggers": [
            "can you share emergency helpline numbers",
            "emergency helpline",
            "helpline numbers",
            "emergency numbers",
            "contact numbers"
        ],
        "response": """Yes, here are some important helpline numbers (India):

Cybercrime Helpline: 1930

National Cybercrime Reporting Portal: www.cybercrime.gov.in

Police: 100

(If outside India, check your local emergency services numbers.)"""
    },
    
    "security_tips": {
        "triggers": [
            "what are the best digital payment safety tips",
            "digital payment safety tips",
            "payment security tips",
            "safety tips",
            "security tips"
        ],
        "response": """Never share OTP, PIN, CVV, or passwords with anyone.

Always use secure, official apps.

Avoid clicking on unknown links or scanning random QR codes.

Enable two-factor authentication.

Regularly check your bank/payment statements for unusual activity."""
    },
    
    "transaction_security": {
        "triggers": [
            "how do i know if my transaction is secure",
            "transaction secure",
            "secure transaction",
            "transaction safety",
            "is transaction safe"
        ],
        "response": """A transaction is usually secure if:

It's done through official apps/websites with HTTPS encryption.

You receive confirmation messages or emails from your bank/payment provider.

The recipient's details match what you expect.

You haven't shared sensitive details (like OTP) with anyone during the process."""
    },
    
    # Additional training data
    "fake_app_detection": {
        "triggers": [
            "how can i spot a fake payment app",
            "fake payment app",
            "detect fake app",
            "identify fake payment app",
            "how to spot fake apps",
            "fake app signs",
            "payment app safety",
            "genuine payment app"
        ],
        "response": """Only download apps from official app stores (Google Play, App Store). Check the developer name, reviews, and permissions. Fake apps often have spelling mistakes or very few downloads."""
    },
    
    "saving_card_details": {
        "triggers": [
            "is it safe to save my card details online",
            "save card details",
            "storing card information",
            "keep card details online",
            "safe to store card info",
            "save payment details",
            "auto save card"
        ],
        "response": """It is safer not to. If you must, use trusted platforms with encryption and always enable two-factor authentication. Delete saved details after use if possible."""
    },
    
    "otp_shared_accidentally": {
        "triggers": [
            "what should i do if i accidentally shared my otp",
            "shared otp by mistake",
            "gave otp to someone",
            "accidentally shared otp",
            "told someone my otp",
            "otp compromise",
            "otp leaked"
        ],
        "response": """Call your bank or payment app immediately to block transactions. Change your PIN and password right away."""
    },
    
    "money_theft_without_otp": {
        "triggers": [
            "can hackers steal money without otp",
            "steal money without otp",
            "otp security",
            "how secure is otp",
            "money stolen without otp",
            "otp protection",
            "bypass otp security"
        ],
        "response": """OTP is a strong layer of security. But if your card or PIN is stolen, some transactions may still happen (such as offline or international ones). Always report a lost card immediately."""
    },
    
    "transaction_limits": {
        "triggers": [
            "how can i set transaction limits for safety",
            "set transaction limit",
            "daily transaction limit",
            "payment limit setting",
            "limit upi transactions",
            "reduce transaction limit",
            "transaction safety limit"
        ],
        "response": """Most banks and UPI apps allow you to set daily or per-transaction limits in settings. Lowering the limit reduces loss risk in case of fraud."""
    },
    
    "fraudster_tricks": {
        "triggers": [
            "how do fraudsters trick people into sending money",
            "fraudster tricks",
            "scammer tactics",
            "fraud methods",
            "how scammers cheat",
            "common fraud tricks",
            "social engineering",
            "fake officials"
        ],
        "response": """They may pretend to be bank officials, send fake job or lottery offers, or request money urgently. Some also use fake customer care numbers or phishing links."""
    },
    
    "qr_code_scams": {
        "triggers": [
            "what are common qr code scams",
            "qr code scam",
            "fake qr codes",
            "qr code fraud",
            "malicious qr codes",
            "qr scam types",
            "qr code tricks"
        ],
        "response": """Fraudsters may send QR codes saying you will "receive" money, but scanning actually makes you pay them. Remember: scanning a QR code is for paying, not receiving money."""
    },
    
    "fake_payment_links": {
        "triggers": [
            "how do i check if a payment link is real or fake",
            "fake payment link",
            "verify payment link",
            "suspicious links",
            "phishing links",
            "fake payment url",
            "check link safety"
        ],
        "response": """Check if the link starts with https:// and belongs to the official domain. Avoid shortened or strange links. When in doubt, do not click."""
    },
    
    "screen_sharing_danger": {
        "triggers": [
            "why should i avoid screen sharing during payments",
            "screen sharing danger",
            "screen share safety",
            "remote access scam",
            "screen sharing fraud",
            "avoid screen sharing"
        ],
        "response": """Screen sharing allows scammers to see your OTP, PIN, or passwords. Never allow it during banking or payment."""
    },
    
    "fake_refund_requests": {
        "triggers": [
            "what should i do if i receive a suspicious payment refund request",
            "fake refund",
            "suspicious refund",
            "refund scam",
            "false refund request",
            "fake money return"
        ],
        "response": """Do not accept it. Scammers may trick you into sending money instead of receiving a refund. Verify directly with your bank or payment app."""
    },
    
    "money_recovery_after_fraud": {
        "triggers": [
            "can i get my money back after being scammed online",
            "money recovery after fraud",
            "get money back from scam",
            "refund after fraud",
            "money return after scam",
            "recover stolen money"
        ],
        "response": """Sometimes yes, if you report quickly. Banks can try to freeze or reverse the transaction. But recovery is not guaranteed."""
    },
    
    "fraud_case_resolution_time": {
        "triggers": [
            "how long does it take for banks to resolve fraud cases",
            "bank fraud resolution time",
            "fraud investigation timeline",
            "fraud case investigation duration"
        ],
        "response": """Usually 7 to 90 days, depending on the case and investigation. Reporting immediately increases your chances."""
    },
    
    "first_contact_after_fraud": {
        "triggers": [
            "who should i contact first after a payment fraud",
            "first contact fraud",
            "fraud reporting order",
            "who to call first fraud",
            "immediate fraud contact",
            "fraud first step"
        ],
        "response": """First call your bank or payment app to block transactions. Then report to the cybercrime helpline (1930 in India) or local authorities."""
    },
    
    "cybercrime_complaint_online": {
        "triggers": [
            "how do i file a cybercrime complaint online",
            "file cybercrime complaint",
            "online fraud complaint",
            "cybercrime reporting",
            "report online fraud",
            "cybercrime portal"
        ],
        "response": """In India, visit cybercrime.gov.in. Fill in details with evidence such as screenshots and transaction IDs. Other countries have similar national cybercrime portals."""
    },
    
    "police_trace_fraudsters": {
        "triggers": [
            "can police trace online payment fraudsters",
            "trace fraudsters",
            "catch online scammers",
            "police track fraudsters",
            "find payment scammers",
            "fraudster tracking"
        ],
        "response": """Yes, with transaction IDs, phone numbers, and digital footprints, police or cyber cells can track fraudsters. Success depends on how fast you report."""
    }
}

def get_custom_response(message):
    """
    Check if the message matches any custom response triggers
    Returns the custom response if found, None otherwise
    """
    message_lower = message.lower().strip()
    
    # Remove extra punctuation and normalize
    import re
    message_clean = re.sub(r'[^\w\s]', ' ', message_lower)
    message_clean = ' '.join(message_clean.split())  # normalize whitespace
    
    for category, data in CUSTOM_RESPONSES.items():
        for trigger in data["triggers"]:
            # Clean trigger too for better matching
            trigger_clean = re.sub(r'[^\w\s]', ' ', trigger)
            trigger_clean = ' '.join(trigger_clean.split())
            
            # Check for exact phrase match or high similarity
            if trigger_clean in message_clean or message_clean in trigger_clean:
                return data["response"]
            
            # Check for keyword overlap (80% match)
            trigger_words = set(trigger_clean.split())
            message_words = set(message_clean.split())
            
            if len(trigger_words) > 0:
                overlap = len(trigger_words.intersection(message_words))
                similarity = overlap / len(trigger_words)
                
                # If similarity is high enough, return the response
                if similarity >= 0.7 and len(trigger_words) >= 3:
                    return data["response"]
    
    return None

def enhance_backend_response(message, backend_response):
    """
    Check if we should override the backend response with a custom one
    """
    custom_response = get_custom_response(message)
    
    if custom_response:
        return custom_response
    
    # Return the backend response as-is if no custom match
    return backend_response