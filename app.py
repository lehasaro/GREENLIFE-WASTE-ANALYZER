import os
import sqlite3
import numpy as np
from flask import Flask, render_template, request, jsonify
from tensorflow.keras.models import load_model
from PIL import Image

app = Flask(__name__)

UPLOAD_FOLDER = 'static/uploads'
os.makedirs(UPLOAD_FOLDER, exist_ok=True)
app.config['UPLOAD_FOLDER'] = UPLOAD_FOLDER

MODEL_PATH = 'model/waste_model.h5'
CLASSES = ["Biodegradable", "Recyclable", "Hazardous"]

# Load model safely
if os.path.exists(MODEL_PATH):
    model = load_model(MODEL_PATH)
    print("✅ Model loaded")
else:
    model = None
    print("⚠️ Model not found, using dummy prediction")

def init_db():
    conn = sqlite3.connect('database.db')
    conn.execute("""
        CREATE TABLE IF NOT EXISTS history (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            type TEXT,
            result TEXT,
            co2 REAL
        )
    """)
    conn.close()

@app.route('/')
def index():
    return render_template('index.html')

@app.route('/analyze', methods=['POST'])
def analyze():
    if 'image' not in request.files:
        return jsonify({'error': 'No image uploaded'}), 400

    file = request.files['image']
    filepath = os.path.join(app.config['UPLOAD_FOLDER'], file.filename)
    file.save(filepath)

    if model:
        img = Image.open(filepath).convert("RGB").resize((128, 128))
        img_array = np.array(img) / 255.0
        img_array = np.expand_dims(img_array, axis=0)
        prediction = model.predict(img_array)
        result = CLASSES[np.argmax(prediction)]
    else:
        result = "Recyclable"

    disposal_places = {
        "Biodegradable": "Nearby Compost Yard / Green Bin",
        "Recyclable": "Municipal Recycling Center",
        "Hazardous": "Authorized Hazardous Waste Facility"
    }

    co2_map = {
        "Biodegradable": 0.2,
        "Recyclable": 0.5,
        "Hazardous": 0.1
    }

    conn = sqlite3.connect('database.db')
    conn.execute(
        "INSERT INTO history (type, result, co2) VALUES (?, ?, ?)",
        ("Waste", result, co2_map[result])
    )
    conn.commit()
    conn.close()

    return jsonify({
        "result": result,
        "advice": disposal_places[result],
        "co2": co2_map[result]
    })

if __name__ == "__main__":
    init_db()
    app.run(debug=True)
