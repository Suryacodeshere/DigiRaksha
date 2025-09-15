"""
Comprehensive Knowledge Base for UPI/Payment Security and Fraud Detection
Includes RBI Guidelines, Payment Regulations, Security Measures, and Fraud Prevention
"""

import re
from typing import List, Dict, Any, Optional
from datetime import datetime

class ComprehensiveKnowledgeBase:
    """
    Extensive knowledge base covering all aspects of payment security and fraud detection
    """
    
    def __init__(self):
        self.knowledge_base = {
            "rbi_guidelines": {
                "upi_guidelines": {
                    "overview": """
The Reserve Bank of India (RBI) has established comprehensive guidelines for UPI (Unified Payments Interface) transactions to ensure security and consumer protection:

**Key RBI UPI Regulations:**
• Master Directions on Digital Payment Security Controls, 2021
• Guidelines on Regulation of Payment Aggregators and Gateways, 2020
• Framework for Regulatory Sandbox for FinTech Sector
• Customer Protection Guidelines for Digital Payments
• Data Protection and Privacy Guidelines

**Transaction Limits (as per RBI):**
• Per transaction limit: ₹1,00,000 for P2P (Person to Person)
• Daily limit: ₹1,00,000 for most banks
• Merchant transactions: Up to ₹2,00,000 per transaction
• Recurring payments: Up to ₹15,000 per transaction
• These limits may vary by bank and can be customized by users
                    """,
                    "security_requirements": """
**RBI Mandated Security Controls:**

1. **Multi-Factor Authentication (MFA)**
   • Mandatory for all payment transactions above ₹5,000
   • Combination of something you know (PIN), have (phone), or are (biometric)

2. **Device Binding**
   • UPI apps must be registered to specific devices
   • Additional verification required for new device registration

3. **Transaction Monitoring**
   • Real-time fraud monitoring systems mandatory
   • Suspicious transaction pattern detection
   • Immediate alerts for unusual activities

4. **Data Protection**
   • Payment data encryption (minimum 256-bit)
   • Tokenization of sensitive payment information
   • PCI-DSS compliance for all entities
   • Data localization requirements

5. **Customer Authentication**
   • Strong customer authentication protocols
   • Biometric authentication where available
   • Dynamic authentication methods
                    """,
                    "fraud_prevention_measures": """
**RBI Guidelines for Fraud Prevention:**

1. **Customer Due Diligence (CDD)**
   • Know Your Customer (KYC) verification mandatory
   • Risk-based customer profiling
   • Regular review of customer risk profiles

2. **Transaction Limits and Controls**
   • Daily/monthly transaction limits
   • Velocity checks (number of transactions per time period)
   • Amount-based risk scoring

3. **Suspicious Activity Monitoring**
   • 24x7 transaction monitoring systems
   • Machine learning-based fraud detection
   • Real-time risk scoring of transactions

4. **Incident Response**
   • Immediate blocking of suspicious accounts
   • Customer notification within 24 hours
   • Coordination with law enforcement agencies
                    """
                },
                "consumer_protection": """
**RBI Consumer Protection Guidelines for Digital Payments:**

1. **Customer Grievance Redressal**
   • Dedicated customer service channels
   • Maximum response time: 7 working days
   • Escalation matrix for unresolved complaints
   • Ombudsman scheme for digital payments

2. **Liability Framework**
   • Zero liability for unauthorized transactions due to bank/system failures
   • Limited liability (₹10,000 max) for customer negligence
   • Full liability protection with proper reporting

3. **Disclosure Requirements**
   • Clear terms and conditions
   • Transparent fee structure
   • Risk warnings and safety tips
   • Privacy policy disclosure

4. **Customer Education**
   • Mandatory awareness programs
   • Regular safety communications
   • Digital literacy initiatives
                """,
                "compliance_requirements": """
**RBI Compliance Requirements for Payment Service Providers:**

1. **Licensing and Authorization**
   • RBI authorization required for all payment services
   • Specific licenses for different payment activities
   • Regular compliance audits

2. **Capital and Networth Requirements**
   • Minimum capital requirements based on service type
   • Maintenance of statutory reserves
   • Financial health monitoring

3. **Reporting Obligations**
   • Monthly transaction reports to RBI
   • Fraud and security incident reporting
   • Customer complaint statistics
   • System availability reports

4. **Data Governance**
   • Data Protection Officer appointment mandatory
   • Data breach notification within 6 hours
   • Regular data security assessments
                """
            },
            "fraud_types": {
                "common_upi_frauds": """
**Comprehensive List of UPI/Payment Frauds:**

1. **SIM Swap Fraud**
   • Fraudsters obtain duplicate SIM to intercept OTPs
   • Social engineering to get operator assistance
   • Prevention: Use app-based authentication when possible

2. **Phishing and Vishing**
   • Fake websites mimicking genuine payment platforms
   • Phone calls impersonating bank officials
   • Email/SMS with malicious links
   • Prevention: Never share credentials via phone/email

3. **QR Code Fraud**
   • Malicious QR codes with incorrect payment details
   • QR codes placed over genuine merchant codes
   • Prevention: Always verify merchant details before payment

4. **UPI ID Spoofing**
   • Creating UPI IDs similar to legitimate businesses
   • Using trusted names with slight variations
   • Prevention: Verify UPI ID through official channels

5. **Social Engineering**
   • Impersonation of authority figures
   • Creating urgency for immediate payments
   • Exploitation of trust relationships
   • Prevention: Always verify independently

6. **Technical Manipulation**
   • App tampering and fake payment apps
   • Man-in-the-middle attacks
   • Malware installation
   • Prevention: Download apps only from official stores

7. **Refund Fraud**
   • False promises of refunds requiring upfront payment
   • Fake refund notifications
   • Prevention: Refunds never require additional payments

8. **Investment and Trading Frauds**
   • Fake investment platforms requiring UPI transfers
   • Ponzi schemes using digital payments
   • Prevention: Verify investment platforms with regulatory authorities
                """,
                "emerging_fraud_patterns": """
**Latest Fraud Trends (2024-25):**

1. **AI-Powered Voice Cloning**
   • Synthetic voice calls impersonating family members
   • Deep fake audio requesting emergency funds

2. **Cryptocurrency Scams**
   • Fake crypto trading platforms
   • UPI payments for non-existent cryptocurrencies

3. **Digital Arrest Scams**
   • Impersonation of law enforcement
   • Video calls showing fake arrest scenarios
   • Demands for immediate payments to avoid arrest

4. **Romance Scams**
   • Online relationship building over months
   • Gradual requests for financial assistance
   • Cross-border money transfer requests

5. **Job and Lottery Frauds**
   • Fake job offers requiring security deposits
   • Lottery winning notifications requiring processing fees

6. **Rental and Property Frauds**
   • Advance payment for fake property rentals
   • Token amounts for property bookings
                """
            },
            "security_measures": {
                "personal_security": """
**Comprehensive Personal Security Guidelines:**

1. **Device Security**
   • Use screen lock (PIN, pattern, biometric)
   • Keep apps updated to latest versions
   • Don't use public WiFi for payments
   • Install apps only from official app stores
   • Enable automatic app updates
   • Regular device security scans

2. **Account Security**
   • Use strong, unique UPI PINs
   • Enable all available security features
   • Regular review of transaction history
   • Set up transaction alerts
   • Use multiple payment methods for diversification
   • Regular password/PIN changes

3. **Transaction Security**
   • Always verify recipient details
   • Double-check transaction amounts
   • Use secure networks for payments
   • Never share OTP or PIN with anyone
   • Screenshot important transactions
   • Immediately report unauthorized transactions

4. **Information Security**
   • Never share banking credentials
   • Be cautious of phishing attempts
   • Verify caller identity independently
   • Don't click suspicious links
   • Keep personal information private on social media
                """,
                "merchant_security": """
**Security Guidelines for Merchants:**

1. **Setup Security**
   • Use verified payment gateway providers
   • Implement SSL certificates for online payments
   • Regular security audits and assessments
   • Compliance with PCI-DSS standards

2. **Transaction Processing**
   • Implement fraud detection systems
   • Set up real-time transaction monitoring
   • Use dynamic QR codes where possible
   • Maintain transaction logs securely

3. **Customer Data Protection**
   • Minimal data collection principle
   • Secure storage of customer information
   • Regular data backup and recovery procedures
   • Compliance with data protection laws

4. **Staff Training**
   • Regular security awareness training
   • Clear procedures for handling suspicious activities
   • Incident response protocols
   • Customer verification procedures
                """
            },
            "regulatory_framework": {
                "payment_acts_regulations": """
**Key Payment Laws and Regulations in India:**

1. **Payment and Settlement Systems Act, 2007**
   • Primary legislation governing payment systems
   • Gives RBI regulatory authority over payments
   • Defines penalties for unauthorized payment systems

2. **Information Technology Act, 2000**
   • Covers digital transactions and cybercrime
   • Electronic signature validity
   • Penalties for cybercrime and data breaches

3. **Prevention of Money Laundering Act, 2002**
   • KYC and AML requirements for financial institutions
   • Suspicious transaction reporting obligations
   • Customer due diligence requirements

4. **Reserve Bank of India Act, 1934**
   • Gives RBI power to regulate payment systems
   • Authority to issue directions to payment system operators
   • Supervision and inspection powers

5. **Banking Regulation Act, 1949**
   • Governs banks providing payment services
   • Capital adequacy and risk management requirements
   • Customer protection provisions
                """,
                "international_standards": """
**International Payment Security Standards:**

1. **PCI-DSS (Payment Card Industry Data Security Standard)**
   • Mandatory for all entities handling payment data
   • Regular security assessments required
   • Network security and data protection requirements

2. **ISO 27001 - Information Security Management**
   • International standard for information security
   • Risk management framework
   • Continuous improvement approach

3. **FATF Guidelines**
   • Financial Action Task Force recommendations
   • Anti-money laundering standards
   • Counter-terrorism financing measures

4. **Basel III Framework**
   • International banking regulations
   • Capital adequacy requirements
   • Risk management standards
                """
            },
            "incident_response": {
                "fraud_reporting": """
**Step-by-Step Fraud Reporting Process:**

1. **Immediate Actions (Within 1 Hour)**
   • Block the affected payment method immediately
   • Take screenshots of fraudulent transactions
   • Note down all relevant details (time, amount, recipient)
   • Contact your bank's fraud helpline immediately

2. **Bank Reporting (Within 3 Days)**
   • File formal complaint with your bank
   • Submit written complaint with all evidence
   • Obtain complaint reference number
   • Follow up on complaint status regularly

3. **Police Complaint (Within 7 Days for significant amounts)**
   • File FIR with local cybercrime police station
   • Provide all transaction evidence
   • Get police complaint number
   • Cooperate with investigation process

4. **Regulatory Complaint (If bank response unsatisfactory)**
   • File complaint with Banking Ombudsman
   • Contact RBI Consumer Education and Protection Cell
   • Use online grievance portals (RBI Sachet, etc.)

5. **Documentation Required:**
   • Transaction receipts/screenshots
   • Bank statements
   • Communication records (SMS, email, call logs)
   • Identity proof and address proof
   • Detailed incident description
                """,
                "emergency_contacts": """
**Important Emergency Contact Numbers:**

**National Emergency Numbers:**
• Cybercrime Helpline: 1930
• Banking Fraud Helpline: 1800-425-3800
• RBI Complaint Hotline: 14440
• Consumer Helpline: 1915

**Online Portals:**
• National Cybercrime Reporting Portal: cybercrime.gov.in
• RBI Complaints Portal: cms.rbi.org.in
• Banking Ombudsman: rbi.org.in/cms/ombudsman

**Major Bank Fraud Helplines:**
• SBI: 1800-11-2211, 1800-425-3800
• HDFC: 1800-266-4332
• ICICI: 1860-120-7777
• Axis Bank: 1860-419-5555
• PNB: 1800-180-2222
• Bank of Baroda: 1800-258-4455

**UPI App Emergency Numbers:**
• PhonePe: 080-68727374
• Paytm: 0120-4456456
• Google Pay: 1-855-720-6978
• Amazon Pay: 1800-419-7355
                """
            }
        }
    
    def search_knowledge_base(self, query: str, category: Optional[str] = None) -> List[Dict[str, Any]]:
        """
        Search the knowledge base for relevant information
        """
        query_lower = query.lower()
        results = []
        
        # Define search categories based on query keywords
        search_mapping = {
            'rbi': ['rbi_guidelines'],
            'guidelines': ['rbi_guidelines'],
            'regulation': ['regulatory_framework', 'rbi_guidelines'],
            'law': ['regulatory_framework'],
            'compliance': ['regulatory_framework', 'rbi_guidelines'],
            'fraud': ['fraud_types', 'incident_response'],
            'scam': ['fraud_types'],
            'security': ['security_measures'],
            'reporting': ['incident_response'],
            'emergency': ['incident_response'],
            'contact': ['incident_response'],
            'helpline': ['incident_response'],
            'merchant': ['security_measures'],
            'consumer': ['rbi_guidelines'],
            'protection': ['rbi_guidelines', 'security_measures']
        }
        
        # Determine relevant categories based on query
        relevant_categories = set()
        for keyword, categories in search_mapping.items():
            if keyword in query_lower:
                relevant_categories.update(categories)
        
        # If no specific categories found, search all
        if not relevant_categories:
            relevant_categories = set(self.knowledge_base.keys())
        
        # Search within relevant categories
        for category_key in relevant_categories:
            if category_key in self.knowledge_base:
                category_data = self.knowledge_base[category_key]
                self._search_category(query_lower, category_key, category_data, results)
        
        return results[:5]  # Return top 5 most relevant results
    
    def _search_category(self, query: str, category_name: str, category_data: Dict, results: List):
        """
        Search within a specific category
        """
        if isinstance(category_data, dict):
            for key, value in category_data.items():
                if isinstance(value, str):
                    # Calculate relevance score
                    relevance_score = self._calculate_relevance(query, value)
                    if relevance_score > 0.1:  # Threshold for relevance
                        results.append({
                            'category': category_name,
                            'section': key,
                            'content': value,
                            'relevance_score': relevance_score
                        })
                elif isinstance(value, dict):
                    self._search_category(query, category_name, value, results)
    
    def _calculate_relevance(self, query: str, text: str) -> float:
        """
        Calculate relevance score between query and text
        """
        query_words = set(query.lower().split())
        text_words = set(text.lower().split())
        
        # Calculate word overlap
        overlap = len(query_words.intersection(text_words))
        total_query_words = len(query_words)
        
        if total_query_words == 0:
            return 0.0
        
        base_score = overlap / total_query_words
        
        # Boost score for exact phrase matches
        if query in text.lower():
            base_score += 0.5
        
        # Boost score for key financial terms
        financial_terms = ['rbi', 'upi', 'payment', 'fraud', 'security', 'bank', 'transaction']
        for term in financial_terms:
            if term in query and term in text.lower():
                base_score += 0.1
        
        return min(base_score, 1.0)
    
    def get_specific_info(self, category: str, section: str = None) -> Optional[str]:
        """
        Get specific information from knowledge base
        """
        try:
            if category in self.knowledge_base:
                if section and section in self.knowledge_base[category]:
                    return self.knowledge_base[category][section]
                else:
                    # Return all information in category
                    result = ""
                    for key, value in self.knowledge_base[category].items():
                        if isinstance(value, str):
                            result += f"\n\n**{key.upper()}:**\n{value}"
                        elif isinstance(value, dict):
                            result += f"\n\n**{key.upper()}:**"
                            for sub_key, sub_value in value.items():
                                result += f"\n\n{sub_key.title()}:\n{sub_value}"
                    return result
        except Exception as e:
            return None
        return None
    
    def get_emergency_info(self) -> str:
        """
        Get emergency contact information
        """
        return self.knowledge_base['incident_response']['emergency_contacts']
    
    def get_fraud_types(self) -> str:
        """
        Get comprehensive fraud types information
        """
        common_frauds = self.knowledge_base['fraud_types']['common_upi_frauds']
        emerging_frauds = self.knowledge_base['fraud_types']['emerging_fraud_patterns']
        return f"{common_frauds}\n\n{emerging_frauds}"
    
    def get_rbi_guidelines(self, specific_area: str = None) -> str:
        """
        Get RBI guidelines information
        """
        if specific_area:
            return self.get_specific_info('rbi_guidelines', specific_area)
        else:
            return self.get_specific_info('rbi_guidelines')
    
    def get_security_measures(self, user_type: str = 'personal') -> str:
        """
        Get security measures based on user type
        """
        if user_type.lower() == 'merchant':
            return self.knowledge_base['security_measures']['merchant_security']
        else:
            return self.knowledge_base['security_measures']['personal_security']

# Global instance
knowledge_base = ComprehensiveKnowledgeBase()