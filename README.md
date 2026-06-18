# MITTI: Voice-Based Natural Farming Consultant

> **An interactive, voice-first prototype helping smallholder farmers transition to natural and organic farming with instant disease diagnosis, companion planting seed advice, market/weather intelligence, and financial subsidy guidance.**

**MITTI** (meaning *Soil* in Hindi) is a premium, web-based digital consultant optimized for mobile devices and smart boards. It provides voice-driven, context-aware advice to assist farmers in phasing out chemical inputs in favor of biological, multi-level cropping systems.

---

## 🌟 Core Features

### 1. Disease Identification & Treatment
- **Camera Scan:** Simulates edge computer vision leaf scans using the device camera.
- **Organic Prescriptions:** Instead of chemical sprays, it recommends natural treatments (e.g., sour buttermilk copper decoction, Ginger-Garlic-Chili extract *Agniastra*, Neem Seed Kernel Extract *NSKE*).

### 2. Seed & Financial Guidance
- **Seeding Suggestions:** Recommends primary crops (Maize, Chili, Ragi, Cotton) and pair-matched companion seeds to maximize land efficiency.
- **Subsidy Portal:** Explains available natural farming subsidies such as PKVY (Paramparagat Krishi Vikas Yojana) cluster benefits and PM-Kisan Samman Nidhi.

### 3. Weather & Market Intelligence
- **Weather Forecast:** Simulates region-specific humidity, rainfall, and thermal profiles.
- **Organic Markets:** Pulls current rates of organic crops (Basmati rice, Sharbati wheat, turmeric, red chili) with daily market trend indications.

### 4. Natural Farming Education
- **Interactive 5-Layer Stack:** Visually details the biological forest model: Canopy (Layer 1), Understory (Layer 2), Shrub (Layer 3), Ground Cover (Layer 4), and Rhizosphere (Layer 5) with roots and compatibility insights.

### 5. Dual Voice Pipeline (Voice-First)
- **Local Web Speech API:** Uses browser-native Speech-to-Text (`webkitSpeechRecognition`) and Text-to-Speech (`speechSynthesis`) for a zero-configuration, local voice assistant that requires no api keys.
- **ElevenLabs Conversational widget:** Integrated widget option for advanced neural voice streaming.

---

## 🛠️ Technology Stack

- **Core & Logic:** HTML5, CSS3, Vanilla Javascript.
- **Styling Aesthetics:** Premium Earthy Dark-Theme, Radial Gradients (`#2a1c14` to `#120b07`), Amber Accents (`#c78b5a`), Glassmorphism Cards, Sweep Animations.
- **Voice Stack:** Browser Web Speech API & ElevenLabs ConvAI Embed.
- **Local Dev Server:** Python standard library (`http.server`).

---

## 🧠 Voice Assistant Prompt Design & Guardrails

The voice engine operates under strict guardrails to prevent chemical recommendations:

1. **Focus on Organic Inputs:** When asked about plant health, the system forces recommendations to local bio-formulations (e.g., *Jeevamrutha*, *Beejamrutha*, *Dashaparni*, *Neemasthra*) rather than synthetic NPK/urea.
2. **Companion Planting Synergy:** Every crop recommendation includes a leguminous or insect-repellant companion crop to preserve natural nitrogen fixing and biological pest boundaries.
3. **Guardrail Check:** Query keywords (e.g., *pesticide*, *fertilizer*) are intercepted and mapped to natural treatments, preventing black-box recommendations.

---

## 🌐 Localization & Regional Support

MITTI supports five languages to make it accessible to regional smallholders:
- **English** (default)
- **Hindi (हिंदी)**
- **Telugu (తెలుగు)**
- **Tamil (தமிழ்)**
- **Kannada (ಕನ್ನಡ)**

Selecting a language translates critical UI components and matches the local Speech Recognition API locale (e.g., `hi-IN` for Hindi STT).

---

## 🚀 How to Run Locally

Start the local server using Python (no third-party dependencies required):

```bash
python run_app.py
```

This starts a server at `http://localhost:8000` and automatically opens `http://localhost:8000/index.html` in your default browser.
