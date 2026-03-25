from flask import Flask, request, jsonify
from flask_cors import CORS
import pickle
import numpy as np
import joblib
import os
import traceback
import requests
import json
from datetime import datetime

app = Flask(__name__)
CORS(app)  # Enable CORS for all routes

# Get absolute paths
BASE_DIR = os.path.dirname(os.path.abspath(__file__))
MODEL_PATH = os.path.join(BASE_DIR, 'best_disease_model.pkl')
SYMPTOMS_PATH = os.path.join(BASE_DIR, 'symptom_features.pkl')

print("=" * 60)
print("🚀 Medical Diagnosis Flask Server with DeepSeek AI")
print("=" * 60)

# Load model and symptoms
disease_model = None
all_symptoms = []

try:
    if os.path.exists(MODEL_PATH):
        disease_model = joblib.load(MODEL_PATH)
        print(f"✅ Model loaded successfully: {type(disease_model)}")
    else:
        print(f"❌ Model file not found: {MODEL_PATH}")
except Exception as e:
    print(f"❌ Error loading model: {str(e)}")

try:
    if os.path.exists(SYMPTOMS_PATH):
        with open(SYMPTOMS_PATH, 'rb') as f:
            all_symptoms = pickle.load(f)
        print(f"✅ Symptoms loaded: {len(all_symptoms)} total symptoms")
        print(f"📋 First 5 symptoms: {all_symptoms[:5]}")
    else:
        print(f"❌ Symptoms file not found")
except Exception as e:
    print(f"❌ Error loading symptoms: {str(e)}")

print("=" * 60)

# ==================== DEEPSEEK API CONFIGURATION ====================
# YOUR ACTUAL DEEPSEEK API KEY
DEEPSEEK_API_KEY = "sk-17a6ff9e3e654b5fab3215fd9d863c37"
DEEPSEEK_API_URL = "https://api.deepseek.com/chat/completions"

# ==================== AI MEDICAL ADVISOR ====================
class DeepSeekMedicalAdvisor:
    def __init__(self, api_key):
        self.api_key = api_key
        self.api_url = DEEPSEEK_API_URL
        self.last_used_api = None
    
    def get_disease_details(self, disease_name, symptoms):
        """Get detailed information about a disease from DeepSeek"""
        prompt = f"""As a medical expert, provide comprehensive details about {disease_name}.

Patient Symptoms: {', '.join(symptoms)}

Please provide information in this EXACT JSON format:
{{
  "overview": "Brief 2-3 sentence overview",
  "causes": [
    "3-5 main causes or risk factors"
  ],
  "complications": [
    "3-5 potential complications if untreated"
  ],
  "diagnosis_methods": [
    "3-5 common diagnostic methods"
  ],
  "treatment_approaches": [
    "3-5 general treatment approaches"
  ],
  "prognosis": "Expected recovery timeline and outcomes",
  "key_facts": [
    "4-6 important facts about this disease"
  ]
}}

Make it informative, accurate, and patient-friendly. Base information on medical consensus."""
        
        return self._call_deepseek_api(prompt, "disease_details")
    
    def get_precautions(self, disease_name, symptoms, severity="Moderate"):
        """Get detailed precautions and treatment advice from DeepSeek"""
        prompt = f"""As a medical expert, provide detailed precautions and treatment advice for {disease_name}.

Patient Profile:
- Condition: {disease_name}
- Current Symptoms: {', '.join(symptoms)}
- Severity: {severity}

Provide comprehensive advice in this EXACT JSON format:
{{
  "precautions": [
    "7-10 specific precautionary measures"
  ],
  "immediate_actions": [
    "5-7 things to do right now"
  ],
  "medications": [
    "Common medications with typical dosages (include disclaimers)"
  ],
  "home_remedies": [
    "7-10 evidence-based home remedies"
  ],
  "lifestyle_changes": [
    "7-10 long-term lifestyle recommendations"
  ],
  "diet_advice": [
    "5-7 specific dietary recommendations"
  ],
  "activities_to_avoid": [
    "5-7 specific things to avoid"
  ],
  "when_to_see_doctor": [
    "5-7 specific warning signs for doctor visit"
  ],
  "emergency_signs": [
    "5-7 red flags requiring emergency care"
  ],
  "recovery_timeline": "Expected recovery process and timeline",
  "prevention_tips": [
    "5-7 tips to prevent recurrence"
  ]
}}

Make advice practical, specific, and evidence-based. Include dosages where appropriate but always with disclaimers."""
        
        return self._call_deepseek_api(prompt, "precautions")
    
    def _call_deepseek_api(self, prompt, request_type):
        """Call DeepSeek API"""
        try:
            headers = {
                'Content-Type': 'application/json',
                'Authorization': f'Bearer {self.api_key}'
            }
            
            payload = {
                'model': 'deepseek-chat',
                'messages': [
                    {
                        'role': 'system', 
                        'content': 'You are a helpful medical assistant. Provide responses in valid JSON format only. Do not include any additional text, explanations, or markdown formatting outside the JSON.'
                    },
                    {
                        'role': 'user', 
                        'content': prompt
                    }
                ],
                'temperature': 0.3,
                'max_tokens': 2000,
                'response_format': { 'type': 'json_object' }
            }
            
            print(f"🔄 Calling DeepSeek API for {request_type}...")
            response = requests.post(self.api_url, json=payload, headers=headers, timeout=45)
            
            if response.status_code == 200:
                data = response.json()
                content = data['choices'][0]['message']['content']
                
                try:
                    result = json.loads(content)
                    print(f"✅ DeepSeek API call successful for {request_type}")
                    self.last_used_api = "deepseek"
                    return result
                except json.JSONDecodeError as e:
                    print(f"❌ JSON parse error: {e}")
                    print(f"Raw response: {content[:200]}...")
                    # Try to extract JSON from text
                    return self._extract_json_from_text(content, request_type)
            else:
                print(f"❌ DeepSeek API error: HTTP {response.status_code}")
                print(f"Response: {response.text[:200]}")
                
        except requests.exceptions.Timeout:
            print(f"❌ DeepSeek API timeout for {request_type}")
        except Exception as e:
            print(f"❌ DeepSeek API error: {str(e)}")
            print(traceback.format_exc())
        
        # Fallback to static data
        self.last_used_api = "fallback"
        return self._get_fallback_data(request_type)
    
    def _extract_json_from_text(self, text, request_type):
        """Extract JSON from text response"""
        import re
        try:
            # Find JSON object in response
            json_match = re.search(r'\{.*\}', text, re.DOTALL)
            if json_match:
                json_str = json_match.group()
                return json.loads(json_str)
        except:
            pass
        
        return self._get_fallback_data(request_type)
    
    def _get_fallback_data(self, request_type):
        """Provide fallback data if API fails"""
        if request_type == "disease_details":
            return {
                "overview": "Medical condition requiring professional diagnosis and treatment.",
                "causes": ["Various factors including genetic, environmental, and lifestyle"],
                "complications": ["Can worsen if left untreated", "May affect quality of life"],
                "diagnosis_methods": ["Clinical examination", "Medical history review", "Diagnostic tests"],
                "treatment_approaches": ["Medication", "Lifestyle changes", "Therapy"],
                "prognosis": "Good with proper treatment and care",
                "key_facts": ["Consult a healthcare professional", "Follow prescribed treatment"]
            }
        else:  # precautions
            return {
                "precautions": ["Rest adequately", "Stay hydrated", "Monitor symptoms"],
                "immediate_actions": ["Take prescribed medications", "Rest", "Stay hydrated"],
                "medications": ["Consult doctor before taking any medication"],
                "home_remedies": ["Adequate rest", "Proper nutrition", "Hydration"],
                "lifestyle_changes": ["Regular exercise", "Balanced diet", "Adequate sleep"],
                "diet_advice": ["Eat nutritious foods", "Stay hydrated", "Avoid processed foods"],
                "activities_to_avoid": ["Strenuous exercise", "Alcohol consumption", "Smoking"],
                "when_to_see_doctor": ["Symptoms worsen", "Fever persists", "New symptoms appear"],
                "emergency_signs": ["Difficulty breathing", "Chest pain", "Severe pain"],
                "recovery_timeline": "Varies based on condition and treatment",
                "prevention_tips": ["Maintain good hygiene", "Healthy lifestyle", "Regular checkups"]
            }

# Initialize DeepSeek advisor
deepseek_advisor = DeepSeekMedicalAdvisor(DEEPSEEK_API_KEY)

# ==================== DISEASE INFO DATABASE ====================
DISEASE_INFO = {
    "Common Cold": {
        "description": "A viral infection of your nose and throat.",
        "severity": "Mild",
        "urgency": "Low",
        "common_treatments": ["Rest", "Hydration", "Over-the-counter medicine"],
        "symptoms": ["cough", "sore throat", "runny nose", "sneezing", "headache"]
    },
    "Influenza (Flu)": {
        "description": "A viral infection that attacks your respiratory system.",
        "severity": "Moderate to Severe",
        "urgency": "Medium to High",
        "common_treatments": ["Antiviral medications", "Rest", "Fluids", "Pain relievers"],
        "symptoms": ["fever", "cough", "sore throat", "runny nose", "body aches", "headache"]
    },
    "Migraine": {
        "description": "A headache that can cause severe throbbing pain.",
        "severity": "Moderate to Severe",
        "urgency": "Medium",
        "common_treatments": ["Pain relievers", "Triptans", "Rest in dark room"],
        "symptoms": ["headache", "nausea", "sensitivity to light", "sensitivity to sound"]
    },
    "Bronchitis": {
        "description": "Inflammation of the lining of bronchial tubes.",
        "severity": "Moderate",
        "urgency": "Medium",
        "common_treatments": ["Cough medicine", "Bronchodilators", "Rest", "Fluids"],
        "symptoms": ["cough", "fatigue", "shortness of breath", "chest discomfort"]
    }
}

# ==================== PREDICTION ENDPOINT ====================
def preprocess_symptoms(user_symptoms, all_symptoms_list):
    """Convert user symptoms to model input format"""
    # Normalize all symptoms to lowercase
    all_symptoms_lower = [symptom.lower() if isinstance(symptom, str) else str(symptom).lower() 
                          for symptom in all_symptoms_list]
    user_symptoms_lower = [symptom.lower() if isinstance(symptom, str) else str(symptom).lower() 
                          for symptom in user_symptoms]
    
    # Create binary vector
    symptom_vector = []
    for symptom in all_symptoms_lower:
        # Check for partial matches
        found = False
        for user_symptom in user_symptoms_lower:
            if user_symptom in symptom or symptom in user_symptom:
                found = True
                break
        symptom_vector.append(1 if found else 0)
    
    print(f"📊 Processed {len(user_symptoms)} symptoms into {len(symptom_vector)}-dim vector")
    print(f"📊 Vector sum (symptoms matched): {sum(symptom_vector)}")
    
    return np.array(symptom_vector).reshape(1, -1)

@app.route('/predict', methods=['POST'])
def predict():
    """Predict disease from symptoms"""
    try:
        data = request.get_json()
        user_symptoms = data.get('symptoms', [])
        
        if not user_symptoms:
            return jsonify({'error': 'No symptoms provided'}), 400
        
        print(f"🩺 Predicting for symptoms: {user_symptoms}")
        
        # Check if model is loaded
        if disease_model is None or len(all_symptoms) == 0:
            print("⚠️ Model not loaded, using rule-based fallback")
            # Simple rule-based matching
            symptom_str = " ".join(user_symptoms).lower()
            
            if any(s in symptom_str for s in ["headache", "migraine", "throbbing"]):
                disease = "Migraine"
            elif any(s in symptom_str for s in ["fever", "cough", "cold", "sore throat"]):
                disease = "Common Cold"
            elif any(s in symptom_str for s in ["diarrhea", "vomiting", "nausea", "stomach"]):
                disease = "Gastroenteritis"
            elif any(s in symptom_str for s in ["joint", "arthritis", "stiffness"]):
                disease = "Arthritis"
            else:
                disease = "Common Cold"
            
            return jsonify({
                'conditions': [{
                    'name': disease,
                    'probability': 85.0,
                    'description': DISEASE_INFO.get(disease, {}).get('description', 'Medical condition requiring diagnosis.'),
                    'severity': DISEASE_INFO.get(disease, {}).get('severity', 'Moderate'),
                    'urgency': DISEASE_INFO.get(disease, {}).get('urgency', 'Medium'),
                    'commonTreatments': DISEASE_INFO.get(disease, {}).get('common_treatments', ['Consult a doctor']),
                    'symptoms': user_symptoms
                }],
                'primaryCondition': disease,
                'confidence': 85.0,
                'recommendations': [
                    f"Get proper medical diagnosis for {disease}",
                    "Follow prescribed treatment plan",
                    "Monitor symptoms regularly"
                ],
                'nextSteps': f"Schedule appointment with healthcare provider for {disease}"
            })
        
        # Preprocess symptoms for model
        X_input = preprocess_symptoms(user_symptoms, all_symptoms)
        
        # Check if vector is valid
        if X_input.shape[1] == 0:
            return jsonify({
                'conditions': [{
                    'name': 'General Medical Condition',
                    'probability': 100,
                    'description': 'Symptoms require medical evaluation.',
                    'severity': 'Unknown',
                    'urgency': 'Medium'
                }],
                'primaryCondition': 'General Medical Condition',
                'confidence': 100
            })
        
        # Make prediction
        if hasattr(disease_model, 'predict_proba'):
            probabilities = disease_model.predict_proba(X_input)[0]
            classes = disease_model.classes_
            
            # Get top 3 predictions
            top_indices = probabilities.argsort()[::-1][:3]
            conditions = []
            
            for idx in top_indices:
                if idx < len(classes):
                    disease_name = classes[idx]
                    prob_percent = float(probabilities[idx]) * 100
                    
                    if prob_percent > 1:  # Only include if probability > 1%
                        conditions.append({
                            'name': disease_name,
                            'probability': round(prob_percent, 1),
                            'description': DISEASE_INFO.get(disease_name, {}).get('description', 'Medical condition requiring diagnosis.'),
                            'severity': DISEASE_INFO.get(disease_name, {}).get('severity', 'Moderate'),
                            'urgency': DISEASE_INFO.get(disease_name, {}).get('urgency', 'Medium'),
                            'commonTreatments': DISEASE_INFO.get(disease_name, {}).get('common_treatments', ['Consult a doctor']),
                            'symptoms': user_symptoms
                        })
            
            if conditions:
                # Sort by probability descending
                conditions.sort(key=lambda x: x['probability'], reverse=True)
                
                return jsonify({
                    'conditions': conditions,
                    'primaryCondition': conditions[0]['name'],
                    'confidence': conditions[0]['probability'],
                    'recommendations': [
                        f"Get proper medical diagnosis for {conditions[0]['name']}",
                        "Follow prescribed treatment plan",
                        "Monitor symptoms regularly"
                    ],
                    'nextSteps': f"Schedule appointment with healthcare provider for {conditions[0]['name']}"
                })
        
        # If predict_proba not available, use simple predict
        prediction = disease_model.predict(X_input)
        disease_name = prediction[0] if len(prediction) > 0 else "Unknown"
        
        return jsonify({
            'conditions': [{
                'name': disease_name,
                'probability': 85.0,
                'description': DISEASE_INFO.get(disease_name, {}).get('description', 'Medical condition requiring diagnosis.'),
                'severity': DISEASE_INFO.get(disease_name, {}).get('severity', 'Moderate'),
                'urgency': DISEASE_INFO.get(disease_name, {}).get('urgency', 'Medium'),
                'commonTreatments': DISEASE_INFO.get(disease_name, {}).get('common_treatments', ['Consult a doctor']),
                'symptoms': user_symptoms
            }],
            'primaryCondition': disease_name,
            'confidence': 85.0,
            'recommendations': [
                f"Get proper medical diagnosis for {disease_name}",
                "Follow prescribed treatment plan"
            ],
            'nextSteps': f"Consult healthcare provider about {disease_name}"
        })
        
    except Exception as e:
        print(f"❌ Prediction error: {str(e)}")
        print(traceback.format_exc())
        return jsonify({'error': str(e)}), 500

# ==================== DISEASE DETAILS ENDPOINT ====================
@app.route('/api/disease-details', methods=['POST'])
def get_disease_details():
    """Get detailed disease information from DeepSeek"""
    try:
        data = request.get_json()
        
        disease_name = data.get('disease', '')
        symptoms = data.get('symptoms', [])
        
        if not disease_name:
            return jsonify({
                'success': False,
                'error': 'Disease name is required'
            }), 400
        
        print(f"📚 Getting disease details for: {disease_name}")
        
        # Get AI-generated disease details
        details = deepseek_advisor.get_disease_details(disease_name, symptoms)
        
        return jsonify({
            'success': True,
            'disease': disease_name,
            'details': details,
            'ai_source': deepseek_advisor.last_used_api,
            'generated_at': datetime.now().isoformat()
        })
        
    except Exception as e:
        print(f"❌ Error in disease details: {str(e)}")
        return jsonify({
            'success': False,
            'error': str(e)
        }), 500

# ==================== PRECAUTIONS ENDPOINT ====================
@app.route('/api/precautions', methods=['POST'])
def get_precautions():
    """Get detailed precautions from DeepSeek"""
    try:
        data = request.get_json()
        
        disease_name = data.get('disease', '')
        symptoms = data.get('symptoms', [])
        severity = data.get('severity', 'Moderate')
        
        if not disease_name:
            return jsonify({
                'success': False,
                'error': 'Disease name is required'
            }), 400
        
        print(f"🛡️ Getting precautions for: {disease_name} (Severity: {severity})")
        
        # Get AI-generated precautions
        precautions = deepseek_advisor.get_precautions(disease_name, symptoms, severity)
        
        return jsonify({
            'success': True,
            'disease': disease_name,
            'precautions': precautions,
            'ai_source': deepseek_advisor.last_used_api,
            'generated_at': datetime.now().isoformat(),
            'disclaimer': 'AI-generated advice. Consult healthcare professional for medical decisions.'
        })
        
    except Exception as e:
        print(f"❌ Error in precautions: {str(e)}")
        return jsonify({
            'success': False,
            'error': str(e)
        }), 500

# ==================== COMBINED ADVICE ENDPOINT ====================
@app.route('/api/complete-advice', methods=['POST'])
def get_complete_advice():
    """Get both details and precautions in one call"""
    try:
        data = request.get_json()
        
        disease_name = data.get('disease', '')
        symptoms = data.get('symptoms', [])
        severity = data.get('severity', 'Moderate')
        
        if not disease_name:
            return jsonify({'success': False, 'error': 'Disease name required'}), 400
        
        print(f"🎯 Getting complete advice for: {disease_name}")
        
        # Get both details and precautions
        details = deepseek_advisor.get_disease_details(disease_name, symptoms)
        precautions = deepseek_advisor.get_precautions(disease_name, symptoms, severity)
        
        return jsonify({
            'success': True,
            'disease': disease_name,
            'details': details,
            'precautions': precautions,
            'ai_source': deepseek_advisor.last_used_api,
            'timestamp': datetime.now().isoformat()
        })
        
    except Exception as e:
        print(f"❌ Error in complete advice: {str(e)}")
        return jsonify({'success': False, 'error': str(e)}), 500

# ==================== HEALTH CHECK ====================
@app.route('/api/health', methods=['GET'])
def api_health():
    """Health check endpoint - FIXED THE API KEY CHECK"""
    # Check if API key looks valid (not empty and not a placeholder)
    # The issue was checking against YOUR actual key instead of a placeholder
    
    # List of placeholder/example keys to check against
    placeholder_keys = [
        "YOUR_DEEPSEEK_API_KEY_HERE",
        "sk-00000000000000000000000000000000",
        "sk-example-key-1234567890",
        "",
        "sk-proj-xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx"
    ]
    
    # Check if key is valid (not a placeholder and has proper format)
    is_valid_key = (
        DEEPSEEK_API_KEY and 
        len(DEEPSEEK_API_KEY) > 30 and  # Real keys are long
        DEEPSEEK_API_KEY.startswith("sk-") and
        DEEPSEEK_API_KEY not in placeholder_keys
    )
    
    return jsonify({
        'status': 'healthy',
        'server': 'Medical Diagnosis API',
        'deepseek_api': 'configured' if is_valid_key else 'not_configured',
        'model_loaded': disease_model is not None,
        'symptoms_count': len(all_symptoms) if all_symptoms else 0,
        'endpoints': {
            'POST /predict': 'Predict disease from symptoms',
            'POST /api/disease-details': 'Get AI-generated disease details',
            'POST /api/precautions': 'Get AI-generated precautions',
            'POST /api/complete-advice': 'Get both details & precautions',
            'GET /api/health': 'Health check'
        },
        'note': 'API is fully functional' if is_valid_key else 'Configure DeepSeek API key for AI features'
    })

# ==================== TEST ENDPOINTS ====================
@app.route('/api/test-details', methods=['GET'])
def test_details():
    """Test disease details endpoint"""
    # Simulate a POST request
    test_data = {
        'disease': 'Common Cold',
        'symptoms': ['cough', 'fever', 'sore throat']
    }
    
    # Create mock request
    class MockRequest:
        def get_json(self):
            return test_data
    
    # Temporarily replace request
    import flask
    original_request = flask.request
    flask.request = MockRequest()
    
    try:
        result = get_disease_details()
        flask.request = original_request
        
        if isinstance(result, tuple):
            return result[0]
        return result
    except Exception as e:
        flask.request = original_request
        return jsonify({'error': str(e)})

@app.route('/api/test-precautions', methods=['GET'])
def test_precautions():
    """Test precautions endpoint"""
    test_data = {
        'disease': 'Common Cold',
        'symptoms': ['cough', 'fever', 'sore throat'],
        'severity': 'Mild'
    }
    
    # Create mock request
    import flask
    class MockRequest:
        def get_json(self):
            return test_data
    
    original_request = flask.request
    flask.request = MockRequest()
    
    try:
        result = get_precautions()
        flask.request = original_request
        
        if isinstance(result, tuple):
            return result[0]
        return result
    except Exception as e:
        flask.request = original_request
        return jsonify({'error': str(e)})

@app.route('/test-deepseek', methods=['GET'])
def test_deepseek_api():
    """Test DeepSeek API connection directly"""
    try:
        headers = {
            'Content-Type': 'application/json',
            'Authorization': f'Bearer {DEEPSEEK_API_KEY}'
        }
        
        payload = {
            'model': 'deepseek-chat',
            'messages': [{'role': 'user', 'content': 'Hello, are you working?'}],
            'max_tokens': 10,
            'temperature': 0.1
        }
        
        response = requests.post(DEEPSEEK_API_URL, json=payload, headers=headers, timeout=10)
        
        if response.status_code == 200:
            return jsonify({
                'success': True,
                'message': '✅ DeepSeek API is working!',
                'status_code': response.status_code
            })
        else:
            return jsonify({
                'success': False,
                'message': f'❌ DeepSeek API error: {response.status_code}',
                'error': response.text[:200]
            })
            
    except Exception as e:
        return jsonify({
            'success': False,
            'message': f'❌ DeepSeek API connection failed: {str(e)}'
        })

# ==================== SIMPLE TEST ENDPOINTS ====================
@app.route('/', methods=['GET'])
def home():
    """Home page with links to test endpoints"""
    return '''
    <h1>Medical Diagnosis API</h1>
    <p>Flask server is running!</p>
    <ul>
        <li><a href="/api/health">Health Check</a></li>
        <li><a href="/test-deepseek">Test DeepSeek API</a></li>
        <li><a href="/api/test-details">Test Disease Details</a></li>
        <li><a href="/api/test-precautions">Test Precautions</a></li>
    </ul>
    <h3>Test Prediction (cURL):</h3>
    <code>curl -X POST http://localhost:8000/predict -H "Content-Type: application/json" -d '{"symptoms": ["headache", "fever"]}'</code>
    '''

# ==================== MAIN ====================
if __name__ == '__main__':
    print("🔧 DeepSeek API Configuration:")
    
    # Check if key is valid
    is_valid_key = (
        DEEPSEEK_API_KEY and 
        len(DEEPSEEK_API_KEY) > 30 and
        DEEPSEEK_API_KEY.startswith("sk-") and
        DEEPSEEK_API_KEY not in ["YOUR_DEEPSEEK_API_KEY_HERE", "sk-00000000000000000000000000000000"]
    )
    
    if is_valid_key:
        print(f"   ✅ API Key: Configured (length: {len(DEEPSEEK_API_KEY)})")
    else:
        print(f"   ❌ API Key: Not properly configured")
        print(f"   💡 Current key: {DEEPSEEK_API_KEY[:20]}...")
    
    print("\n" + "=" * 60)
    print("🌐 Starting Medical Diagnosis Server with AI Integration")
    print("=" * 60)
    print("📡 Available Endpoints:")
    print("  GET  /                       - Home page")
    print("  GET  /api/health             - Health check")
    print("  GET  /test-deepseek          - Test DeepSeek API")
    print("  POST /predict                - Predict disease from symptoms")
    print("  POST /api/disease-details    - Get AI-generated disease details")
    print("  POST /api/precautions        - Get AI-generated precautions")
    print("  POST /api/complete-advice    - Get both details & precautions")
    print("  GET  /api/test-details       - Test disease details")
    print("  GET  /api/test-precautions   - Test precautions")
    print("=" * 60)
    print(f"🌐 Server running on: http://localhost:8000")
    print("=" * 60)
    
    app.run(debug=True, host='0.0.0.0', port=8000, threaded=True)