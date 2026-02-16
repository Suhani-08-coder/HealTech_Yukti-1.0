import os
import random
import smtplib
from email.mime.text import MIMEText
from flask import Flask, request, jsonify,render_template
from flask_cors import CORS 
from dotenv import load_dotenv
from pymongo import MongoClient
import google.generativeai as genai
from datetime import datetime
from bson import ObjectId


load_dotenv()

app = Flask(__name__)
CORS(app)

#ENV
MONGO_URI = os.getenv("MONGO_URI")
MAIL_SENDER = os.getenv("MAIL_SENDER")
MAIL_PASSWORD = os.getenv("MAIL_PASSWORD")
API_KEY = os.getenv("GEMINI_API_KEY")

#API
if API_KEY:
    genai.configure(api_key=API_KEY)
else:
    print("WARNING: GEMINI_API_KEY missing")

#MONGO
if not MONGO_URI:
    raise Exception("MONGO_URI missing in .env")

client = MongoClient(MONGO_URI)
db = client["mindease"]
users_collection = db["users"]
journals_collection = db["journals"]
chats_collection=db["chats"]

otp_store = {}


#EMAIL
def send_real_email(to_email, otp_code):
    if not MAIL_SENDER or not MAIL_PASSWORD:
        return False

    html_content = f"""
    <h2>MindEase Sanctuary</h2>
    <p>Your OTP Code:</p>
    <h1>{otp_code}</h1>
    <p>Valid for 10 minutes.</p>
    """

    msg = MIMEText(html_content, 'html')
    msg['Subject'] = "MindEase Login Code"
    msg['From'] = MAIL_SENDER
    msg['To'] = to_email

    try:
        with smtplib.SMTP_SSL('smtp.gmail.com', 465) as server:
            server.login(MAIL_SENDER, MAIL_PASSWORD)
            server.sendmail(MAIL_SENDER, to_email, msg.as_string())
        return True
    except Exception as e:
        print(f"Email Error: {e}")
        return False



@app.route('/')
def home():
    return render_template("index.html")


@app.route('/api/send-otp', methods=['POST'])
def send_otp():
    data = request.json
    email = data.get('email')

    if not email:
        return jsonify({"error": "Email required"}), 400

    otp = str(random.randint(100000, 999999))
    otp_store[email] = otp

    success = send_real_email(email, otp)

    if success:
        return jsonify({"message": f"OTP sent to {email}"})
    else:
        print("DEBUG OTP:", otp)
        return jsonify({"message": "Email failed. Check console for OTP."})

@app.route('/api/verify-otp', methods=['POST'])
def verify_otp():
    data = request.json
    email = data.get('email')
    otp = data.get('otp')
    new_user_data = data.get('userData')

    if email in otp_store and otp_store[email] == otp:
        del otp_store[email]

       
        if new_user_data:

            existing_user = users_collection.find_one({"email": email})

            if existing_user:
                return jsonify({"error": "User already exists. Please login."}), 400

            users_collection.insert_one({
                "name": new_user_data['name'],
                "age": new_user_data['age'],
                "gender": new_user_data['gender'],
                "email": email
            })
            
            return jsonify({"message": "Account Created", "user": new_user_data})

       
        user = users_collection.find_one({"email": email}, {"_id": 0})

        if user:
            return jsonify({"message": "Welcome back!", "user": user})
        else:
            return jsonify({"error": "User not found"}), 404

    return jsonify({"error": "Invalid OTP"}), 400

#CHAT
@app.route('/api/chat', methods=['POST'])
def chat():
    if not API_KEY:
        return jsonify({"error": "API Key Missing"}), 500

    try:
        data = request.json
        user_message = data.get('message', '').strip()
        
        if not user_message:
            return jsonify({"error": "Message empty"}), 400

       
        DANGER_KEYWORDS = ["marne", "suicide", "end my life", "kill myself", "harm", "marna", "zindagi khatam"]
        if any(kw in user_message.lower() for kw in DANGER_KEYWORDS):
            return jsonify({
                "action": "safety_alert",
                "reply": "I'm so sorry you're feeling this way. You are not alone. Please reach out to someone who can support you. I am playing some music to help you feel better right now.",
                "hotlines": [{"name": "Aasra", "number": "9820466726", "link": "tel:9820466726"}]
            })

      
        persona = (
            "You are 'MindEase', a friendly and empathetic wellness companion. "
            "You can talk about anything from a user's day to deep emotional thoughts. "
            "STRICT RULES: "
            "1. If the user talks in Hinglish, you MUST respond in natural, friendly Hinglish. "
            "2. If the user talks in English, respond in English. "
            "3. Be human-like: Ask follow-up questions like 'Aur batao aapka din kaisa raha?' if appropriate. "
            "4. Even if it is a normal chat, maintain a calm and positive vibe. "
            "5. Keep responses concise but engaging (not more than 3 sentences)."
        )

        model = genai.GenerativeModel("gemini-flash-lite-latest", system_instruction=persona)
        response = model.generate_content(user_message)

        return jsonify({"reply": response.text})

    except Exception as e:
        print(f"Error: {e}")
        return jsonify({"error": str(e)}), 500
    
#QUIZZ
@app.route('/api/analyze-quiz', methods=['POST'])
def analyze_quiz():
    if not API_KEY:
        return jsonify({"error": "API Key Missing"}), 500

    try:
        data = request.json
        score = data.get('score', 0)

        prompt = f"Analyze quiz score: {score}/50. Give gentle 2-sentence advice."

        model = genai.GenerativeModel("gemini-flash-latest")
        response = model.generate_content(prompt)

        return jsonify({"reply": response.text})

    except Exception as e:
        return jsonify({"error": str(e)}), 500
    
def classify_text_sentiment(text):
    text = text.lower()

    positive_words = ["khush", "prasann", "santusht", "shaant", "sukoon", "ummeed", "utsahit", "garv", "pyaar", "accha", "shukriya", "dhanyavaad", "hausla", "raahat", "muskaan",
    "happy", "good", "great", "peace", "relaxed","calm", "fine", "better", "enjoy", "smile","thankful", "grateful", "excited"]

    negative_words = [ "dukhi", "udas", "pareshaan", "thaka", "gussa","akela", "toota", "nirash", "dar", "chinta",
    "stress", "dard", "bojh", "pareshani", "tension","sad", "depressed", "angry", "lonely", "broken",
     "hopeless", "worried", "anxious", "tired", "hurt", "cry", "pain", "upset"]

    pos_count = sum(word in text for word in positive_words)
    neg_count = sum(word in text for word in negative_words)

    if pos_count > neg_count:
        return "positive"
    elif neg_count > pos_count:
        return "negative"
    else:
        return "neutral"

def classify_mood_sentiment(mood):
    if mood in ["radiant", "peaceful"]:
        return "positive"
    elif mood == "cloudy":
        return "neutral"
    else:
        return "negative"
    
def final_sentiment(mood_sentiment, text_sentiment):
    if text_sentiment == "negative":
        return "negative"
    elif text_sentiment == "neutral":
        return "neutral"
    else:
        return mood_sentiment
    
#journal
@app.route('/api/save-journal', methods=['POST'])
def save_journal():
    data = request.json
    email = data.get("email")
    mood = data.get("mood")
    thought = data.get("thought")

    if not email or not thought:
        return jsonify({"error": "Missing data"}), 400
    
    mood_sentiment=classify_mood_sentiment(mood)
    text_sentiment=classify_text_sentiment(thought)
    sentiment=final_sentiment(mood_sentiment,text_sentiment)

    journal = {
        "email": email,
        "mood": mood,
        "sentiment":sentiment,
        "thought": thought,
        "created_at": datetime.utcnow()
    }

    journals_collection.insert_one(journal)
    return jsonify({"message": "Journal saved successfully"})


@app.route("/api/journals/<email>", methods=["GET"])
def get_journals(email):
    journals = journals_collection.find(
        {"email": email}
    ).sort("created_at", -1).limit(3)

    result = []
    for j in journals:
        result.append({
            "id": str(j["_id"]),
            "thought": j["thought"],
            "mood": j["mood"],
            "sentiment":j["sentiment"],
            "date": j["created_at"].strftime("%d %b %Y")
        })

    return jsonify(result)

@app.route("/api/journal/<id>", methods=["DELETE"])
def delete_journal(id):
    journals_collection.delete_one({"_id": ObjectId(id)})
    return jsonify({"message": "Journal deleted"})

@app.route('/api/save-chat', methods=['POST'])
def save_chat():
    data = request.json
    email = data.get("email")
    message = data.get("message")
    reply = data.get("reply")

    chats_collection.insert_one({
        "email": email,
        "message": message,
        "reply": reply,
        "created_at": datetime.utcnow()
    })

    return jsonify({"message": "Chat saved"})

#game
@app.route('/bubble-wrap')
def bubble_wrap():
    return render_template('BubbleWrap.html')

#
@app.route('/api/user/stats/<email>', methods=['GET'])
def get_user_stats(email):
    user = users_collection.find_one({"email": email})
    if not user:
        return jsonify({"error": "User not found"}), 404

    
    journals = list(journals_collection.find({"email": email}).sort("created_at", -1).limit(7))
    
    mood_map = {"Happy": 90, "Calm": 70, "Neutral": 50, "Sad": 30, "Anxious": 20}
    history = [mood_map.get(j.get("mood"), 50) for j in journals][::-1]

    if not history:
        history = [50, 60, 55, 70]

   
    passive_mood = "Neutral"
    reasoning = "Not enough data yet. Start journaling!"
    confidence = "50%"

    if journals:
        latest_thought = journals[0].get("thought", "")
        hour = journals[0].get("created_at").hour 
        
        
        if len(latest_thought.split()) > 5:
            if hour >= 23 or hour <= 4:
                passive_mood = "Tense"
                reasoning = "Late-night usage pattern + deep reflection detected."
                confidence = "85%"
            else:
                passive_mood = journals[0].get("mood", "Calm")
                reasoning = f"Based on your recent thought: '{latest_thought[:30]}...'"
                confidence = "75%"
    

    return jsonify({
        "currentStreak": user.get("streak", 0),
        "moodHistory": history,
        "name": user.get("name", "Explorer"),
        "detection": {
            "passiveMood": passive_mood,
            "confidence": f"{confidence} Sure",
            "reasoning": reasoning
        }
    })
@app.route("/api/user/checkin", methods=["POST"])
def user_checkin():
    data = request.json
    email = data.get("email")

    if not email:
        return jsonify({"error": "Email required"}), 400

    return jsonify({"status": "checked in"})
    

if __name__ == '__main__':
    app.run(debug=True, port=5000)
    