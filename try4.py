import cv2
import numpy as np
import pandas as pd
import joblib
import serial
import time
import os
import sys
import warnings
import random

# --- USER IMPORTS (From your robust setup) ---
try:
    import npk7
    from utils import check_parameters
    from parameters import thresholds, fertilizers
except ImportError as e:
    print(f" Critical Setup Error: Missing helper file: {e}")
    sys.exit(1)

# --- TFLITE (For Vision) ---
try:
    import tflite_runtime.interpreter as tflite
except ImportError:
    try:
        import tensorflow.lite as tflite
    except ImportError:
        tflite = None
        print("⚠️ Warning: TensorFlow Lite not found. Vision features disabled.")

# --- CONFIGURATION ---
BASE_PATH = "/home/mittie/Desktop/MITTIE"
MODEL_PATH = os.path.join(BASE_PATH, "models")

# Crop Model Files
CROP_MODEL_FILE = os.path.join(MODEL_PATH, 'random_forest.pkl')
SCALER_FILE = os.path.join(MODEL_PATH, 'scaler.pkl')
TARGETS_FILE = os.path.join(MODEL_PATH, 'targets.pkl')
DATA_FILE = os.path.join(BASE_PATH, "data/Crop_recommendation.csv")

# Vision Model Files
VISION_MODEL_PATH = os.path.join(MODEL_PATH, "plant_disease_model.tflite")
LABELS_PATH = os.path.join(BASE_PATH, "data/class_names.txt")

# Thresholds
DISEASE_THRESHOLD = 0.40  # Strict for Disease
HEALTHY_THRESHOLD = 0.15  # Low for AI Healthy

class TerminalSmartFarmer:
    def __init__(self):
        self.rf_model = None
        self.scaler = None
        self.targets = None
        self.vision_interpreter = None
        self.crop_dataset = None
        
        print("\n🌱 AI Smart Farmer - Terminal Edition")
        self.load_resources()
        self.main_menu()

    def load_resources(self):
        print("⏳ Loading system resources...")
        try:
            # Load Crop Models
            if os.path.exists(CROP_MODEL_FILE):
                self.rf_model = joblib.load(CROP_MODEL_FILE)
                self.scaler = joblib.load(SCALER_FILE)
                self.targets = joblib.load(TARGETS_FILE)
                print("✅ Crop Models Loaded.")
            else:
                print("❌ Crop models not found in models/ folder.")
            
            # Load Dataset (for simulation fallback)
            if os.path.exists(DATA_FILE):
                self.crop_dataset = pd.read_csv(DATA_FILE)
            
            # Load Vision Model
            if os.path.exists(VISION_MODEL_PATH) and tflite:
                self.vision_interpreter = tflite.Interpreter(model_path=VISION_MODEL_PATH)
                self.vision_interpreter.allocate_tensors()
                self.vis_input = self.vision_interpreter.get_input_details()
                self.vis_output = self.vision_interpreter.get_output_details()
                print(f"✅ Vision Model Loaded: {os.path.basename(VISION_MODEL_PATH)}")
            else:
                self.vision_interpreter = None
                print(f"⚠️ Vision Model Missing or TFLite not installed.")
                
        except Exception as e:
            print(f"❌ Critical Load Error: {e}")
            sys.exit(1)

    # =================================================
    #  PART 1: SOIL ANALYSIS Logic (From Source 2)
    # =================================================
    def get_sensor_readings(self):
        try:
            ser = serial.Serial(
                port=npk7.SERIAL_PORT, baudrate=npk7.BAUD,
                timeout=npk7.TIMEOUT, parity=serial.PARITY_NONE, stopbits=1
            )
            with ser:
                data = npk7.read_once(ser, retries=2)
            if data: 
                data['rainfall'] = 100.0 
                return data, "Real Sensor"
        except Exception:
            pass 
        
        # Fallback to Simulation
        if self.crop_dataset is not None:
            supported_crops = list(thresholds.keys())
            valid_data = self.crop_dataset[self.crop_dataset['label'].isin(supported_crops)]
            if not valid_data.empty:
                row = valid_data.sample(1).iloc[0]
                sim_data = {
                    'nitrogen_mgkg': row['N'],
                    'phosphorus_mgkg': row['P'],
                    'potassium_mgkg': row['K'],
                    'temperature_c': row['temperature'],
                    'moisture_pct': row['humidity'],
                    'ph': row['ph'],
                    'rainfall': row['rainfall']
                }
                return sim_data, f"Simulated ({row['label'].upper()})"
        return None, "Error"

    def run_crop_analysis(self, full_check=False):
        print("\n--- SOIL & CROP ANALYSIS ---")
        data, source = self.get_sensor_readings()
        
        if not data:
            print("❌ Failed to get sensor data.")
            return

        soil_params = {
            'N': data['nitrogen_mgkg'], 'P': data['phosphorus_mgkg'], 'K': data['potassium_mgkg'],
            'temperature': data['temperature_c'], 'humidity': data['moisture_pct'],
            'ph': data['ph'], 'rainfall': data['rainfall']
        }

        print(f"Data Source: {source}")
        print(f"Readings: N={soil_params['N']} P={soil_params['P']} K={soil_params['K']} pH={soil_params['ph']}, temperature={soil_params['temperature']},rainfall={soil_params['rainfall']},humidity={soil_params['humidity']}:.1f")

        feature_order = ['N', 'P', 'K', 'temperature', 'humidity', 'ph', 'rainfall']
        input_df = pd.DataFrame([[soil_params[f] for f in feature_order]], columns=feature_order)
        
        with warnings.catch_warnings():
            warnings.simplefilter("ignore")
            input_scaled = self.scaler.transform(input_df)

        probs = self.rf_model.predict_proba(input_scaled)[0]
        class_labels = self.rf_model.classes_
        
        top_crops = []
        for i, prob in enumerate(probs):
            if prob > 0:
                class_id = class_labels[i]
                name = self.targets.get(class_id, self.targets.get(str(class_id), "Unknown"))
                top_crops.append((prob, name))
        
        top_crops.sort(key=lambda x: x[0], reverse=True)
        
        print("\nTop Recommended Crops:")
        for idx, (score, name) in enumerate(top_crops[:3]):
            print(f"  {idx+1}. {name.upper()} ({score*100:.1f}%)")

        selected_crop = None
        while True:
            try:
                choice = input("\nSelect crop number to analyze (1-3): ")
                choice_idx = int(choice) - 1
                if 0 <= choice_idx < len(top_crops[:3]):
                    selected_crop = top_crops[choice_idx][1]
                    break
                else:
                    print("Invalid choice. Try again.")
            except ValueError:
                print("Please enter a number.")

        print(f"\nSelected: {selected_crop.upper()}")
        
        recs = check_parameters(selected_crop.lower(), soil_params, thresholds, fertilizers)
        if recs:
            print("\n⚠️ FERTILIZER ADVICE:")
            for r in recs:
                print(f"  - {r}")
        else:
            print("\n✅ Soil conditions are ideal! No fertilizer needed.")

        if full_check:
            print("\n--- CONTINUING TO DISEASE CHECK ---")
            print("Wait for camera window to appear...")
            time.sleep(1)
            self.start_disease_detection()
        else:
            input("\nPress Enter to return to menu...")

    # =================================================
    #  PART 2: LEAF DISEASE DETECTION (Unbreakable Logic)
    # =================================================
    def start_disease_detection(self):
        # 1. LOAD LABELS
        try:
            with open(LABELS_PATH, 'r') as f:
                all_classes = [line.strip() for line in f.readlines()]
        except FileNotFoundError:
            print(f"\n Error: {LABELS_PATH} not found!")
            input("Press Enter to return...")
            return

        # 2. SELECT CROP
        print("\n" + "="*30)
        print("   LEAF DISEASE SCANNER")
        print("="*30)
        choice = input("Enter number (1-3): ")

        if choice == '1': 
            target_crop = "POTATO"  
            compatible_crops = ["Potato", "Tomato"] 
        elif choice == '2': 
            target_crop = "TOMATO"
            compatible_crops = ["Tomato"]
        elif choice == '3': 
            target_crop = "PEPPER"
            compatible_crops = ["Pepper", "Bell"]
        else:
            target_crop = "TOMATO"
            compatible_crops = ["Tomato"]

        print(f"\n CAMERA STARTING :")
        print(" Press 'q' to quit camera and return to menu.")
        time.sleep(1)

        # 3. USE LOADED MODEL
        if self.vision_interpreter is None:
            print("❌ Vision model not loaded correctly.")
            return

        interpreter = self.vision_interpreter
        input_details = self.vis_input
        output_details = self.vis_output
        input_type = input_details[0]['dtype']

        cap = cv2.VideoCapture(0)
        # Set resolution
        cap.set(cv2.CAP_PROP_FRAME_WIDTH, 640)
        cap.set(cv2.CAP_PROP_FRAME_HEIGHT, 480)
        font = cv2.FONT_HERSHEY_SIMPLEX

        # --- HELPER: DETECT GREEN COLOR (Backup for Healthy) ---
        def is_green_dominant(frame):
            h, w, _ = frame.shape
            center_chunk = frame[h//3:2*h//3, w//3:2*w//3]
            hsv = cv2.cvtColor(center_chunk, cv2.COLOR_BGR2HSV)
            
            lower_green = np.array([35, 40, 40])
            upper_green = np.array([85, 255, 255])
            
            mask = cv2.inRange(hsv, lower_green, upper_green)
            green_ratio = np.count_nonzero(mask) / (mask.size)
            return green_ratio > 0.25

        # --- MAIN CAMERA LOOP ---
        while True:
            ret, frame = cap.read()
            if not ret: break

            # Preprocess
            img_resized = cv2.resize(frame, (224, 224))
            img_rgb = cv2.cvtColor(img_resized, cv2.COLOR_BGR2RGB) 

            if input_type == np.float32:
                img_input = (np.array(img_rgb, dtype=np.float32) / 127.5) - 1.0
            else:
                img_input = np.array(img_rgb, dtype=np.uint8)

            img_input = np.expand_dims(img_input, axis=0)

            # Run AI
            interpreter.set_tensor(input_details[0]['index'], img_input)
            interpreter.invoke()
            output_data = interpreter.get_tensor(output_details[0]['index'])[0]

            if output_data.dtype == np.uint8:
                scale, zero_point = output_details[0]['quantization']
                if scale == 0: scale = 1 
                output_data = (output_data.astype(np.float32) - zero_point) * scale

            # Filter Results
            highest_score = 0
            best_label_full = ""
            
            for i, score in enumerate(output_data):
                label_name = all_classes[i]
                
                is_relevant = False
                # Check if it matches selected crop OR is a "cousin"
                for c in compatible_crops:
                    if c.lower() in label_name.lower():
                        is_relevant = True
                
                # Universal Healthy Check
                if "healthy" in label_name.lower():
                    is_relevant = True

                if is_relevant:
                    if score > highest_score:
                        highest_score = score
                        best_label_full = label_name

            # --- DISPLAY LOGIC ---
            cv2.rectangle(frame, (0, 0), (640, 100), (0, 0, 0), -1)

            # 1. Clean Text
            raw_text = best_label_full.lower()
            remove_words = ["potato", "tomato", "pepper", "bell", "plant", "_", "___"]
            for word in remove_words:
                raw_text = raw_text.replace(word, " ")
            clean_disease = " ".join(raw_text.split()).upper()

            # 2. Check Conditions
            ai_found_disease = (highest_score > DISEASE_THRESHOLD) and ("HEALTHY" not in clean_disease)
            ai_found_healthy = (highest_score > HEALTHY_THRESHOLD) and ("HEALTHY" in clean_disease)

            if ai_found_disease:
                color = (0, 0, 255) # Red
                main_text = f"{clean_disease}"
                sub_text = f"Confidence: {int(highest_score*100)}%"

            elif ai_found_healthy:
                color = (0, 255, 0) # Green
                main_text = f"HEALTHY"
                sub_text = f"Confidence: {int(highest_score*100)}%"

            else:
                if is_green_dominant(frame):
                    color = (0, 255, 0) # Green
                    main_text = f": HEALTHY"
                    sub_text = "Verified by Leaf Color Analysis"
                else:
                    color = (200, 200, 200)
                    main_text = f"Scanning ..."
                    sub_text = "Place leaf in center"

            cv2.putText(frame, main_text, (10, 40), font, 0.8, color, 2)
            cv2.putText(frame, sub_text, (10, 80), font, 0.6, (200, 200, 200), 1)

            cv2.imshow('Crop Disease Detector', frame)
            if cv2.waitKey(1) & 0xFF == ord('q'): 
                break

        cap.release()
        cv2.destroyAllWindows()

    # =================================================
    #  PART 3: MAIN MENU
    # =================================================
    def main_menu(self):
        while True:
            print("\n" + "="*50)
            print("  SMART FARMING ASSISTANT (HACKATHON)")
            print("="*50)
            print(" [1] Crop Recommendation (Soil Analysis)")
            print(" [2] Leaf Disease Detection (Camera)")
            print(" [3] Full Analysis (Crop + Disease)")
            print(" [4] Exit")
            print("="*50)

            choice = input(" Select Option (1-4): ")

            if choice == '1':
                self.run_crop_analysis(full_check=False)
            
            elif choice == '2':
                self.start_disease_detection()
            
            elif choice == '3':
                self.run_crop_analysis(full_check=True)
                
            elif choice == '4':
                print("\nThank you for using! 🏆")
                break
                
            else:
                print("\n❌ Invalid choice. Try again.")

if __name__ == "__main__":
    TerminalSmartFarmer()
