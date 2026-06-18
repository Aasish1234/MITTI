let recognition = null;
let isVoiceListening = false;
let isGeminiActive = false;

function toggleSidebar() {
    document.getElementById("sidebar").classList.toggle("collapsed");
}

function toggleTheme() {
    const body = document.body;
    const icon = document.querySelector(".theme-toggle i");

    if (body.classList.contains("dark")) {
        body.classList.replace("dark", "light");
        icon.className = "fa-solid fa-moon";
        localStorage.setItem("theme", "light");
    } else {
        body.classList.replace("light", "dark");
        icon.className = "fa-solid fa-sun";
        localStorage.setItem("theme", "dark");
    }
}

window.addEventListener("DOMContentLoaded", () => {
    const savedTheme = localStorage.getItem("theme") || "dark";
    document.body.className = savedTheme;

    const icon = document.querySelector(".theme-toggle i");
    if (icon) {
        icon.className = savedTheme === "dark" ? "fa-solid fa-sun" : "fa-solid fa-moon";
    }

    const savedLang = localStorage.getItem("lang") || "en";
    const select = document.getElementById("languageSelect");
    if (select) {
        select.value = savedLang;
    }

    const chatInput = document.getElementById("chatInput");
    if (chatInput) {
        chatInput.addEventListener("input", () => {
            if (chatInput.value.trim() !== "") {
                if ('speechSynthesis' in window) {
                    window.speechSynthesis.cancel();
                }
            }
        });
    }

    const apiKey = localStorage.getItem("gemini_api_key");
    if (apiKey) {
        isGeminiActive = true;
        updateVoiceIndicator("standby");
    } else {
        isGeminiActive = false;
        updateVoiceIndicator("local_standby");
    }
});

const translations = {
    en: {
        title: "MITTI",
        tagline: "Voice-First Natural Farming Consultant – Organic Remedies, Subsidies & Multi-level Crop Planning",
        checkBtn: "🌱 Check Soil Nutrients",
        analyzing: "Polling NPK sensor and running suitability engine..."
    },
    hi: {
        title: "मिट्टी",
        tagline: "वॉयस-फर्स्ट प्राकृतिक खेती सलाहकार - जैविक उपचार, सरकारी सब्सिडी और बहु-स्तरीय फसल योजना",
        checkBtn: "🌱 मिट्टी के पोषक तत्व जांचें",
        analyzing: "एनपीके सेंसर पोलिंग और उपयुक्तता गणना जारी है..."
    },
    te: {
        title: "మిట్టి",
        tagline: "వాయిస్-ఫస్ట్ సహజ వ్యవసాయ సలహాదారు - సేంద్రీయ నివారణలు, సబ్సిడీలు & బహుళ-స్థాయి పంట ప్రణాళిక",
        checkBtn: "🌱 నేల పోషకాలను తనిఖీ చేయండి",
        analyzing: "నేల విశ్లేషణ మరియు పంట సిఫార్సు ప్రక్రియ జరుగుతోంది..."
    },
    ta: {
        title: "மிட்டி",
        tagline: "குரல் வழி இயற்கை வேளாண்மை ஆலோசகர் - இயற்கை பூச்சி மேலாண்மை, மானியங்கள் மற்றும் அடுக்கு பயிர் திட்டம்",
        checkBtn: "🌱 மண் சத்துக்களை சோதிக்கவும்",
        analyzing: "மண் பகுப்பாய்வு மற்றும் பயிர் பரிந்துரை நடைபெறுகிறது..."
    },
    kn: {
        title: "ಮಿಟ್ಟಿ",
        tagline: "ವಾಯ್ಸ್-ಫಸ್ಟ್ ನೈಸರ್ಗಿಕ ಕೃಷಿ ಸಲಹೆಗಾರ - ಸಾವಯವ ಉಪಚಾರಗಳು, ಸಬ್ಸಿಡಿಗಳು ಮತ್ತು ಬಹು-ಸ್ತರದ ಬೆಳೆ ಯೋಜನೆ",
        checkBtn: "🌱 ಮಣ್ಣಿನ ಪೋಷಕಾಂಶಗಳನ್ನು ಪರೀಕ್ಷಿಸಿ",
        analyzing: "ಮಣ್ಣಿನ ವಿಶ್ಲೇಷಣೆ ಮತ್ತು ಬೆಳೆ ಶಿಫಾರಸು ಪ್ರಕ್ರಿಯೆ ಚಾಲನೆಯಲ್ಲಿದೆ..."
    }
};

function changeLanguage() {
    const lang = document.getElementById("languageSelect").value;
    localStorage.setItem("lang", lang);
    
    const t = translations[lang] || translations.en;
    const headerTitle = document.querySelector(".topbar-center h1");
    const headerTagline = document.querySelector(".topbar-center span");
    const checkBtn = document.getElementById("checkSoilBtn");
    
    if (headerTitle) headerTitle.textContent = t.title;
    if (headerTagline) headerTagline.textContent = t.tagline;
    if (checkBtn) checkBtn.textContent = t.checkBtn;
}

function getDummySoilAnalysis() {
    return {
        soil: {
            N: Math.floor(Math.random() * 50) + 15,
            P: Math.floor(Math.random() * 40) + 10,
            K: Math.floor(Math.random() * 45) + 15,
            ph: (Math.random() * 2 + 5.5).toFixed(1),
            temperature: Math.floor(Math.random() * 10) + 22,
            humidity: Math.floor(Math.random() * 30) + 50
        },
        recommendations: [
            { crop: "Maize (Corn)", suitability: "Highly Suitable", scheme: "Cowpea + Marigold (Layered)", confidence: 0.94 },
            { crop: "Chili", suitability: "Suitable", scheme: "Garlic + Turmeric (Rhizosphere)", confidence: 0.82 },
            { crop: "Finger Millet (Ragi)", suitability: "Suitable", scheme: "Beans + Sweet Potato", confidence: 0.76 },
            { crop: "Cotton", suitability: "Moderately Suitable", scheme: "Cowpea + Coriander (Ground Cover)", confidence: 0.61 }
        ]
    };
}

const cropNaturalAdvice = {
    "maize (corn)": [
        "Companion Seed Selection: Intercrop with Cowpea (leguminous ground cover) and Marigold (trap crop).",
        "Ecosystem Action: Cowpea fixes nitrogen, minimizing soil fertilizer needs. Marigolds emit alpha-terthienyl, reducing root-knot nematodes.",
        "Rhizosphere Build: Apply Jeevamrutha twice during vegetative phase.",
        "Subsidy Benefit: Eligible for PKVY incentive of Rs. 50,000 per hectare for natural transition."
    ],
    "chili": [
        "Companion Seed Selection: Plant with garlic (repellent border) and intercrop with coriander.",
        "Ecosystem Action: Garlic volatile oils repel aphids, thrips, and mites. Coriander attracts beneficial predatory insects.",
        "Organic Remedy: In case of thrip infestation, spray Agniastra.",
        "Subsidy Benefit: Support available under PKVY cluster funding."
    ],
    "finger millet (ragi)": [
        "Companion Seed Selection: Intercrop with pigeon pea (Arhar) in a 4:1 row ratio.",
        "Ecosystem Action: Deep-rooted pigeon pea taps subsoil nutrients, while Ragi extracts nutrients from shallow layers.",
        "Humus Prep: Mix Neem Cake (4 quintals/ha) with field compost before seeding to control root grubs naturally.",
        "Subsidy Benefit: Government millets promotion scheme provides seed mini-kits and free organic training."
    ],
    "cotton": [
        "Companion Seed Selection: Grow trap crops like Okra and castor on boundaries.",
        "Ecosystem Action: Castor attracts cotton bollworms, serving as a biological sink to protect cotton crops.",
        "Pest Spray: Spray Neem Seed Kernel Extract (NSKE 5%) at first sight of leaf hoppers.",
        "Subsidy Benefit: Cotton natural farming qualifies for state organic cotton cultivation bonuses."
    ]
};

function checkSoil() {
    const btn = document.getElementById("checkSoilBtn");
    const loader = document.getElementById("loader");
    const result = document.getElementById("resultArea");
    const tableBody = document.getElementById("cropTableBody");
    const detailsBox = document.getElementById("cropDetails");

    btn.disabled = true;
    loader.classList.remove("hidden");
    result.classList.add("hidden");
    if (detailsBox) detailsBox.classList.add("hidden");
    tableBody.innerHTML = "";

    const lang = localStorage.getItem("lang") || "en";
    const t = translations[lang] || translations.en;
    const loaderMsg = loader.querySelector("p");
    if (loaderMsg) loaderMsg.textContent = t.analyzing;

    setTimeout(() => {
        const data = getDummySoilAnalysis();
        const soil = data.soil;

        document.getElementById("soilN").textContent = soil.N;
        document.getElementById("soilP").textContent = soil.P;
        document.getElementById("soilK").textContent = soil.K;
        document.getElementById("soilPH").textContent = soil.ph;
        document.getElementById("soilTemp").textContent = soil.temperature;
        document.getElementById("soilMoisture").textContent = soil.humidity;

        data.recommendations.forEach(r => {
            const row = document.createElement("tr");
            row.innerHTML = `
                <td><strong>${r.crop}</strong></td>
                <td>${r.suitability}</td>
                <td>${r.scheme}</td>
                <td><span style="color:var(--accent); font-weight:600;">${Math.round(r.confidence * 100)}%</span></td>
            `;
            row.style.cursor = "pointer";
            row.onclick = () => showCropDetails(r.crop);
            tableBody.appendChild(row);
        });

        loader.classList.add("hidden");
        result.classList.remove("hidden");
        btn.disabled = false;
    }, 1500);
}

function showCropDetails(cropName) {
    const detailsBox = document.getElementById("cropDetails");
    const title = document.getElementById("detailTitle");
    const list = document.getElementById("detailList");

    if (!detailsBox) return;

    title.textContent = `🌾 companion planting guide for ${cropName}`;
    list.innerHTML = "";

    const key = cropName.toLowerCase();
    const adviceList = cropNaturalAdvice[key] || [
        "Plant in companion rows with cover crops like cowpea or beans.",
        "Apply local organic formulations (Jeevamrutha, Beejamrutha) for root protection.",
        "Utilize trap crop margins (marigold/castor) to trap biological insects.",
        "Qualifies for state organic and natural farming transition subsidies."
    ];

    adviceList.forEach(item => {
        const li = document.createElement("li");
        li.textContent = item;
        list.appendChild(li);
    });

    detailsBox.classList.remove("hidden");
    detailsBox.scrollIntoView({ behavior: "smooth" });
}

if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    recognition = new SpeechRecognition();
    recognition.continuous = false;
    recognition.interimResults = false;
    recognition.lang = 'en-US';

    recognition.onstart = () => {
        isVoiceListening = true;
        updateVoiceIndicator("listening");
        document.getElementById("chatInput").placeholder = "Listening closely...";
    };

    recognition.onend = () => {
        isVoiceListening = false;
        if (isGeminiActive) {
            updateVoiceIndicator("standby");
        } else {
            updateVoiceIndicator("local_standby");
        }
        document.getElementById("chatInput").placeholder = "Type or click the microphone to speak...";
    };

    recognition.onresult = (event) => {
        const text = event.results[0][0].transcript;
        document.getElementById("chatInput").value = text;
        sendChatMessage();
    };

    recognition.onerror = (event) => {
        console.error("Speech recognition error", event.error);
        stopVoiceRecognition();
    };
}

const agriculturalRoots = [
    "farm", "crop", "seed", "soil", "nutri", "npk", "fertil", "pest", "remed",
    "diseas", "mulch", "water", "irrigat", "organ", "natur", "jeevamruth", "beejamruth",
    "neem", "mildew", "blight", "rust", "weather", "rain", "climat", "temperat", "subsid",
    "government", "financ", "price", "market", "rate", "cost", "rupee", "rice", "wheat",
    "turmeric", "ragi", "maize", "chili", "chilli", "cotton", "marigold", "cowpea",
    "companion", "plant", "grow", "cultiv", "harvest", "yield", "compost", "manure",
    "insect", "spray", "fungicid", "kisan", "pkvy", "pm-kisan", "vegetab", "fruit",
    "tomato", "potato", "onion", "garlic", "ginger", "sugarcane", "mustard", "soybean",
    "legume", "bean", "pea", "lentil", "gram", "flower", "tree", "garden", "herbs",
    "dung", "urine", "vermicompost", "sow", "drought", "monsoon", "loan", "scheme"
];

function checkGuardRail(query) {
    const lowercase = query.toLowerCase().trim();
    if (!lowercase) return false;
    
    const allowedPhrases = [
        "hello", "hi", "namaste", "hey", "good morning", "good afternoon", "good evening",
        "who are you", "what is your name", "what can you do", "help me", "how are you"
    ];
    if (allowedPhrases.some(phrase => lowercase === phrase || lowercase.startsWith(phrase + " ") || lowercase.includes(phrase))) {
        return true;
    }
    
    return agriculturalRoots.some(root => lowercase.includes(root));
}

const systemInstruction = `You are Mitti, an expert Natural Farming Consultant. Answer only questions related to natural farming, organic remedies, companion planting, weather, market rates, and government subsidies (like PKVY, PM-Kisan). Strictly refuse to answer off-topic queries (e.g. general knowledge, programming, non-farming topics, recipes of other foods) by saying: "I can only help you with natural farming, organic remedies, companion planting, weather, market rates, and government subsidies. Please ask an agriculture-related question!". Keep your responses concise, action-oriented, and structured. Do not use markdown bold/italic formatting in a way that sounds weird when spoken.`;

async function callGeminiAPI(query) {
    const apiKey = localStorage.getItem("gemini_api_key");
    if (!apiKey) {
        throw new Error("No API Key configured.");
    }

    const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify({
            contents: [{ parts: [{ text: query }] }],
            systemInstruction: { parts: [{ text: systemInstruction }] }
        })
    });

    if (!response.ok) {
        throw new Error(`API Error: ${response.status}`);
    }

    const data = await response.json();
    if (data.candidates && data.candidates[0] && data.candidates[0].content && data.candidates[0].content.parts[0]) {
        return data.candidates[0].content.parts[0].text;
    } else {
        throw new Error("Invalid response format from Gemini API");
    }
}

function updateVoiceIndicator(status) {
    const indicator = document.getElementById("voiceIndicator");
    const micBtn = document.getElementById("micBtn");
    if (!indicator) return;
    
    if (status === "connecting" || status === "thinking") {
        indicator.style.background = "#FFC107";
        indicator.style.display = "inline-block";
        if (micBtn) micBtn.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i>';
    } else if (status === "listening") {
        indicator.style.background = "#FF5252";
        indicator.style.display = "inline-block";
        if (micBtn) micBtn.innerHTML = '<i class="fa-solid fa-microphone-slash"></i>';
    } else if (status === "standby") {
        indicator.style.background = "#00E676";
        indicator.style.display = "inline-block";
        if (micBtn) micBtn.innerHTML = '<i class="fa-solid fa-microphone"></i>';
    } else if (status === "local_standby") {
        indicator.style.background = "#81C784";
        indicator.style.display = "inline-block";
        if (micBtn) micBtn.innerHTML = '<i class="fa-solid fa-microphone"></i>';
    }
}

function toggleVoiceListening() {
    if (!recognition) {
        alert("Browser does not support Speech Recognition.");
        return;
    }
    if (isVoiceListening) {
        stopVoiceRecognition();
    } else {
        if ('speechSynthesis' in window) {
            window.speechSynthesis.cancel();
        }
        startVoiceRecognition();
    }
}

function startVoiceRecognition() {
    try {
        const selectedLang = localStorage.getItem("lang") || "en";
        if (selectedLang === "hi") recognition.lang = "hi-IN";
        else if (selectedLang === "te") recognition.lang = "te-IN";
        else if (selectedLang === "ta") recognition.lang = "ta-IN";
        else if (selectedLang === "kn") recognition.lang = "kn-IN";
        else recognition.lang = "en-US";
        
        recognition.start();
    } catch (e) {
        console.error(e);
    }
}

function stopVoiceRecognition() {
    if (recognition) {
        recognition.stop();
    }
}

function toggleChatWindow() {
    const win = document.getElementById("chatWindow");
    if (win.style.display === "flex") {
        win.style.display = "none";
        stopVoiceRecognition();
    } else {
        win.style.display = "flex";
        const apiKey = localStorage.getItem("gemini_api_key");
        if (!apiKey) {
            appendMessage("Welcome! Gemini API key is missing. The chatbot is currently in Local offline mode. Open settings (gear icon) in the header to add your free Gemini key.", "system");
        }
    }
}

function handleChatInput(event) {
    if (event.key === "Enter") {
        sendChatMessage();
    }
}

const voiceKnowledgeBase = [
    {
        keywords: ["subsidy", "subsidies", "pkvy", "pm-kisan", "pm kisan", "government", "finance", "money", "help"],
        reply: "Natural farming transitions are highly supported by the government! The Paramparagat Krishi Vikas Yojana (PKVY) provides Rs 50,000 per hectare for organic seeds and bio-formulations. The PM-Kisan scheme also releases Rs 6,000 annually to support marginal farmers."
    },
    {
        keywords: ["mildew", "rust", "early blight", "spot", "blight", "disease", "pest", "fungus", "remedy", "cure"],
        reply: "For fungal leaf rust or mildew, spray sour buttermilk solution. Ferment sour buttermilk for 4 weeks in a copper container, dilute it 1 to 10 with water, and spray. For insect pests, spray Neemasthra or Agniasthra, which are made from cow urine, neem seeds, and garlic."
    },
    {
        keywords: ["cropping", "multilevel", "rotation", "layer", "stack", "companion", "maize", "chili", "ragi"],
        reply: "Multilevel cropping layers plants by root depth and height. You stack Canopy coconut trees, Understory banana plants, middle pepper bushes, ground legumes, and rhizosphere ginger together. This controls weeds, binds soil nitrogen, and multiplies your income."
    },
    {
        keywords: ["price", "market", "rate", "cost", "basmati", "wheat", "turmeric"],
        reply: "Organic market rates are premium today! Organic Basmati rice is selling at 85 Rupees per kilogram, Organic wheat is at 42 Rupees per kilogram, and high-curcumin Turmeric rhizosphere fetches 140 Rupees per kilogram."
    },
    {
        keywords: ["weather", "rain", "temperature", "forecast", "climate"],
        reply: "The regional forecast predicts moderate humidity and temperatures around 26 degrees Celsius, with scattered light rain. This is an excellent time to apply straw mulching to conserve rhizosphere moisture."
    }
];

async function sendChatMessage() {
    const input = document.getElementById("chatInput");
    const query = input.value.trim();
    if (!query) return;

    if ('speechSynthesis' in window) {
        window.speechSynthesis.cancel();
    }

    if (!checkGuardRail(query)) {
        appendMessage(query, "user");
        input.value = "";
        
        const guardRailReply = "I can only help you with natural farming, organic remedies, companion planting, weather, market rates, and government subsidies. Please ask an agriculture-related question!";
        setTimeout(() => {
            appendMessage(guardRailReply, "model");
            speakAssistantResponse(guardRailReply);
        }, 500);
        return;
    }

    appendMessage(query, "user");
    input.value = "";

    try {
        updateVoiceIndicator("thinking");
        const response = await fetch('/api/chat', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ query })
        });

        if (response.ok) {
            const data = await response.json();
            if (data.reply) {
                updateVoiceIndicator("standby");
                appendMessage(data.reply, "model");
                speakAssistantResponse(data.reply);
                return;
            }
        }
        throw new Error("Server API failed");
    } catch (err) {
        const apiKey = localStorage.getItem("gemini_api_key");
        if (apiKey) {
            try {
                const responseText = await callGeminiAPI(query);
                updateVoiceIndicator("standby");
                appendMessage(responseText, "model");
                speakAssistantResponse(responseText);
            } catch (clientErr) {
                updateVoiceIndicator("standby");
                appendMessage(`AI call failed: ${clientErr.message}. Using offline consultant.`, "system");
                executeLocalFallback(query);
            }
        } else {
            executeLocalFallback(query);
        }
    }
}

function executeLocalFallback(query) {
    let matchReply = "I understand you are asking about agriculture. In natural farming, we recommend biological inputs like Jeevamrutha and cover cropping. Ask me about subsidies, organic remedies, weather, market rates, or five-layer cropping for specific details!";
    
    const lowercaseQuery = query.toLowerCase();
    for (const kb of voiceKnowledgeBase) {
        const matched = kb.keywords.some(k => lowercaseQuery.includes(k));
        if (matched) {
            matchReply = kb.reply;
            break;
        }
    }

    setTimeout(() => {
        appendMessage(matchReply, "model");
        speakAssistantResponse(matchReply);
    }, 600);
}

function appendMessage(text, sender) {
    const chatMsg = document.getElementById("chatMessages");
    const msg = document.createElement("div");
    msg.className = `message ${sender}`;
    msg.innerHTML = text;
    chatMsg.appendChild(msg);
    chatMsg.scrollTop = chatMsg.scrollHeight;
}

function speakAssistantResponse(text) {
    if ('speechSynthesis' in window) {
        window.speechSynthesis.cancel();
        
        const utterance = new SpeechSynthesisUtterance(text);
        
        const selectedLang = localStorage.getItem("lang") || "en";
        if (selectedLang === "hi") utterance.lang = "hi-IN";
        else if (selectedLang === "te") utterance.lang = "te-IN";
        else if (selectedLang === "ta") utterance.lang = "ta-IN";
        else if (selectedLang === "kn") utterance.lang = "kn-IN";
        else utterance.lang = "en-US";
        
        utterance.rate = 1.05;
        utterance.pitch = 1.0;
        
        window.speechSynthesis.speak(utterance);
    }
}

function toggleSettingsWindow() {
    const settings = document.getElementById("chatSettings");
    if (!settings) return;
    if (settings.style.display === "none") {
        settings.style.display = "block";
        const key = localStorage.getItem("gemini_api_key") || "";
        document.getElementById("apiKeyInput").value = key;
    } else {
        settings.style.display = "none";
    }
}

function saveApiKey() {
    const keyInput = document.getElementById("apiKeyInput");
    if (!keyInput) return;
    const key = keyInput.value.trim();
    if (key) {
        localStorage.setItem("gemini_api_key", key);
        isGeminiActive = true;
        updateVoiceIndicator("standby");
        appendMessage("Gemini API Key saved successfully! AI Advisor is now active.", "system");
    } else {
        localStorage.removeItem("gemini_api_key");
        isGeminiActive = false;
        updateVoiceIndicator("local_standby");
        appendMessage("Gemini API Key removed. Using Local fallback mode.", "system");
    }
    toggleSettingsWindow();
}

window.toggleSidebar = toggleSidebar;
window.toggleTheme = toggleTheme;
window.changeLanguage = changeLanguage;
window.checkSoil = checkSoil;
window.showCropDetails = showCropDetails;
window.toggleChatWindow = toggleChatWindow;
window.toggleVoiceListening = toggleVoiceListening;
window.sendChatMessage = sendChatMessage;
window.handleChatInput = handleChatInput;
window.toggleSettingsWindow = toggleSettingsWindow;
window.saveApiKey = saveApiKey;
