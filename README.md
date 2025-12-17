# MITTIE: Multi-parameter IoT-enabled Threshold & Transparent Insight Engine

> **A Smart Agriculture System integrating IoT Sensor Fusion, Agentic AI, and Computer Vision for Precision Farming.**

**MITTIE** is an end-to-end precision agriculture solution designed to address the technological gaps in small and marginal farming. [cite_start]Unlike traditional advisory systems that rely on static databases, MITTIE utilizes a **Raspberry Pi 5** edge-computing unit to process real-time soil analytics, predict optimal crops using **Agentic AI**, and provide transparent, **Explainable AI (XAI)** fertilizer recommendations[cite: 3, 27, 28].

## 🔬 Research & Technical Overview

This project addresses four critical domains in agricultural technology:
1.  **Real-time Soil Analysis:** Moving beyond lab-based delays using industrial-grade Modbus sensors.
2.  **Predictive Modeling:** Utilizing Ensemble Learning (Random Forest) for crop suitability.
3.  **Explainability (XAI):** Bridging the "Black Box" trust gap by providing reasoning for nutrient recommendations.
4.  **Edge Intelligence:** Running lightweight CNN models locally for plant disease detection without cloud dependency.

---

## 🏗️ System Architecture & Methodology

The MITTIE architecture operates on a cyclical data flow: **Acquisition $\rightarrow$ Processing $\rightarrow$ Inference $\rightarrow$ Explanation**.

### 1. Data Acquisition Layer (IoT)
[cite_start]The system interfaces with a **5-pin NPK Soil Sensor** via the **RS485 communication protocol** (using a CH340 driver) to ensure noise-free transmission in field environments[cite: 40]. It aggregates 7 distinct environmental parameters:
* [cite_start]**Macronutrients:** Nitrogen (N), Phosphorus (P), Potassium (K) [cite: 33-35].
* [cite_start]**Environmental:** Soil Temperature, Humidity[cite: 36, 37].
* [cite_start]**Chemical/Physical:** pH Level, Rainfall data[cite: 38, 39].

### 2. Predictive Engine (Agentic AI)
* **Algorithm:** Random Forest Classifier (Ensemble Learning).
* **Function:** The model takes the 7-vector soil profile as input and classifies the agro-climatic suitability into class labels (crops).
* [cite_start]**Training:** Trained on the `Crop_recommendation.csv` dataset containing historical soil-crop mappings[cite: 48].
* [cite_start]**Output:** Generates a ranked list of the top 3 most suitable crops for the specific soil profile[cite: 43].

### 3. Explainable Recommendation Engine (XAI)
To ensure transparency, the system does not simply output a command. It performs a **Nutrient Gap Analysis**:
* **Thresholding:** Compares real-time sensor values against optimal ranges defined in `parameters.py`.
* **Logic:** Calculates the specific deficiency (e.g., "Nitrogen is 20% below threshold for Rice").
* [cite_start]**Prescription:** Recommends specific fertilizers (Urea, DAP, MOP) and explains *why* they are needed (e.g., "Apply Urea to boost vegetative growth")[cite: 51, 56].

### 4. Visual Diagnostics (Computer Vision)
* **Model:** Lightweight Convolutional Neural Network (CNN) converted to **TensorFlow Lite (`.tflite`)**.
* **Deployment:** Optimized for the Raspberry Pi's ARM architecture to perform inference on live video feeds.
* [cite_start]**Function:** Detects leaf anomalies and classifies diseases in real-time[cite: 63, 78].

---

## 📂 Repository Structure

```text
MITTIE/
├── data/
│   ├── Crop_recommendation.csv     # Historical dataset for ML training
│   └── class_names.txt             # Label mapping for disease classification
├── models/
│   ├── train_model.py              # ML pipeline: Preprocessing, RF Training, Serialization
│   ├── plant_disease_model.tflite  # Quantized CNN model for Edge Inference
│   ├── random_forest.pkl           # Serialized Agentic AI model
│   ├── scaler.pkl                  # StandardScaler object for input normalization
│   └── targets.pkl                 # LabelEncoder for decoding crop names
├── npk7.py                         # Main Driver: IoT polling, RS485 comms, & Logic integration
├── parameters.py                   # Domain Knowledge Base: Crop thresholds & Fertilizer logic
├── utils.py                        # Utility functions for tensor manipulation
└── requirements.txt                # Dependency manifest
