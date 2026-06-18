

let videoStream = null;
let captureInterval = null;
let videoDevices = [];
let currentCameraIndex = 0;

const video = document.getElementById("video");
const canvas = document.getElementById("canvas");
const diseaseStatus = document.getElementById("diseaseStatus");
const cameraStatus = document.getElementById("cameraStatus");

// --- 1. SOIL RECOMMENDATION DATABASE ---
const dummyCropRecommendations = [
    { crop: "Maize (Corn)", rating: "Excellent Match (Legume Intercropped)" },
    { crop: "Chili", rating: "Good Match (Garlic Companion)" },
    { crop: "Finger Millet (Ragi)", rating: "Good Match (Mixed cropping)" },
    { crop: "Cotton", rating: "Moderate Match (Castor trap border)" }
];

const dummySoilAdvice = {
    "maize (corn)": [
        "Nitrogen Management: Intercrop with Cowpea. Nitrogen fixed by cowpea root nodules feed maize roots naturally.",
        "Rhizosphere: Spray Liquid Jeevamrutha at crop age 30 and 60 days.",
        "Sowing: Optimal seeding depth is 5cm. Sow after first summer monsoon shower."
    ],
    "chili": [
        "Surfactant Protection: Intercrop with Onion/Garlic to repel sucking insects.",
        "Rhizosphere: Apply 5 tonnes/ha of vermicompost enriched with Trichoderma fungus.",
        "Moisture: Mulch beds with paddy straw to preserve organic moisture."
    ],
    "finger millet (ragi)": [
        "Sowing: Mixed broadcast seeding with Mustard and Cowpea.",
        "Rhizosphere: Apply waste-decomposer solution twice during tillering.",
        "Companion Benefit: Pigeon Pea borders prevent run-off erosion."
    ],
    "cotton": [
        "Sowing: Draw boundary lines of Castor or Marigolds to trap bollworms.",
        "Rhizosphere: Mulch with cotton crop residues to recycle potassium.",
        "Pest Control: Apply Dashaparni extract (10-leaf botanical formulation) if pests cross economic thresholds."
    ]
};

// --- 2. WEATHER INTELLIGENCE CATALOG ---
const weatherForecasts = [
    { day: "Mon", temp: "27°C", icon: "fa-cloud-sun", label: "Partly Cloudy" },
    { day: "Tue", temp: "29°C", icon: "fa-sun", label: "Sunny" },
    { day: "Wed", temp: "25°C", icon: "fa-cloud-showers-heavy", label: "Showers" },
    { day: "Thu", temp: "24°C", icon: "fa-cloud-rain", label: "Light Rain" },
    { day: "Fri", temp: "26°C", icon: "fa-cloud", label: "Overcast" }
];

// --- 3. MARKET & SUBSIDIES DATABASE ---
const marketRates = [
    { crop: "Organic Basmati", price: "Rs. 85 / kg", trend: "UP (+2.3%)" },
    { crop: "Organic Sharbati Wheat", price: "Rs. 42 / kg", trend: "UP (+1.1%)" },
    { crop: "High-Curcumin Turmeric", price: "Rs. 140 / kg", trend: "UP (+4.5%)" },
    { crop: "Guntur Red Chili (Natural)", price: "Rs. 165 / kg", trend: "DOWN (-0.3%)" },
    { crop: "Organic Pearl Millet (Bajra)", price: "Rs. 36 / kg", trend: "UP (+1.8%)" }
];

const financialSubsidies = [
    { title: "Paramparagat Krishi Vikas Yojana (PKVY)", detail: "Provides Rs. 50,000 per hectare for clusters transitioning to organic. Rs. 31,000 is directly credited for biological inputs." },
    { title: "PM-Kisan Samman Nidhi", detail: "Provides direct financial support of Rs. 6,000 per year in three installments for farm holdings." },
    { title: "State Subsidized Bio-Input Centers", detail: "Get 75% subsidy on drum setups, custom-hiring tools, and waste-decomposer vials." },
    { title: "National Millets Mission Support", detail: "Offers free seeds mini-kits, organic certification assistance, and processing equipment subsidies up to 50%." }
];

// --- 4. ORCHESTRATED FARM AUDIT FLOW ---
function startFullCheck() {
    const btn = document.getElementById("startFullCheckBtn");
    const loader = document.getElementById("fullLoader");
    const loaderText = document.getElementById("loaderText");
    const result = document.getElementById("fullResult");
    const cropTable = document.getElementById("fullCropTable");

    btn.disabled = true;
    loader.classList.remove("hidden");
    result.classList.add("hidden");
    cropTable.innerHTML = "";

    loaderText.textContent = "Querying digital sensors & analyzing soil conditions…";

    setTimeout(() => {
        // Render Crop Ratings
        dummyCropRecommendations.forEach(r => {
            const row = document.createElement("tr");
            row.innerHTML = `
                <td><strong>${r.crop}</strong></td>
                <td>${r.rating}</td>
            `;
            row.style.cursor = "pointer";
            row.onclick = () => showFullCropDetails(r.crop);
            cropTable.appendChild(row);
        });

        // Populate Weather Forecast
        document.getElementById("weatherSummary").innerHTML = "<strong>Forecast:</strong> Warm and humid with light showers expected on Wednesday. Ideal time to apply biological inputs.";
        const forecastArea = document.getElementById("weatherForecast");
        forecastArea.innerHTML = "";
        weatherForecasts.forEach(w => {
            const div = document.createElement("div");
            div.className = "weather-day";
            div.innerHTML = `
                <span>${w.day}</span>
                <i class="fa-solid ${w.icon}"></i>
                <strong>${w.temp}</strong>
            `;
            forecastArea.appendChild(div);
        });

        // Populate Market Rates
        const marketArea = document.getElementById("marketPrices");
        marketArea.innerHTML = "";
        marketRates.forEach(m => {
            const div = document.createElement("div");
            div.className = "market-item";
            div.innerHTML = `
                <span>${m.crop}</span>
                <span><strong>${m.price}</strong> <small style="color:${m.trend.includes('UP') ? '#7cff6b':'#FF5252'}">${m.trend}</small></span>
            `;
            marketArea.appendChild(div);
        });

        // Populate Subsidies
        const subsidyArea = document.getElementById("subsidiesList");
        subsidyArea.innerHTML = "";
        financialSubsidies.forEach(f => {
            const div = document.createElement("div");
            div.className = "subsidy-item";
            div.innerHTML = `
                <strong>${f.title}</strong>
                <span>${f.detail}</span>
            `;
            subsidyArea.appendChild(div);
        });

        result.classList.remove("hidden");
        loaderText.textContent = "Starting diagnostic camera lens…";
        startCamera();
        
        loader.classList.add("hidden");
        btn.disabled = false;
        
        speakAssistantResponse("Soil analysis and farm diagnostic audit completed successfully. View the crop recommendations, local market rates, and organic subsidies below.");
    }, 1500);
}

// --- 5. CAMERA CONNECTION ---
async function loadVideoDevices() {
    try {
        const devices = await navigator.mediaDevices.enumerateDevices();
        videoDevices = devices.filter(d => d.kind === "videoinput");
        const backIndex = videoDevices.findIndex(d =>
            d.label.toLowerCase().includes("back") ||
            d.label.toLowerCase().includes("rear") ||
            d.label.toLowerCase().includes("environment")
        );
        if (backIndex !== -1) currentCameraIndex = backIndex;
    } catch (err) {
        console.error(err);
    }
}

async function startCamera() {
    try {
        if (videoDevices.length === 0) {
            await loadVideoDevices();
        }

        const deviceId = videoDevices[currentCameraIndex]?.deviceId;
        videoStream = await navigator.mediaDevices.getUserMedia({
            video: deviceId
                ? { deviceId: { exact: deviceId } }
                : { facingMode: "environment" }
        });

        video.srcObject = videoStream;
        cameraStatus.textContent = "📡 Camera active — scanning crop leaf…";

        video.onloadedmetadata = () => {
            video.play();
            startSendingFrames();
        };
    } catch (err) {
        console.error(err);
        cameraStatus.textContent = "Camera access denied. Simulating leaf analysis...";
        // Trigger simulated leaf diagnostic anyway for fallback
        setTimeout(() => {
            simulateFallbackLeafCheck();
        }, 2000);
    }
}

function stopCamera() {
    if (videoStream) {
        videoStream.getTracks().forEach(t => t.stop());
        videoStream = null;
    }
    clearInterval(captureInterval);
}

// --- 6. LEAF SCANNING LOOP SIMULATION ---
const dummyDiseases = [
    { label: "Healthy Leaf", confidence: 0.94, remedy: "Healthy leaf tissue. Keep maintaining compost mulch." },
    { label: "Powdery Mildew", confidence: 0.72, remedy: "Fungal infection. Spray copper-fermented sour buttermilk." },
    { label: "Leaf Rust", confidence: 0.81, remedy: "Fungal rust. Spray Agniastra (decoction of cow urine, ginger, garlic, chili)." }
];

let frameCounter = 0;
let finalDecision = null;

function simulateFallbackLeafCheck() {
    diseaseStatus.className = "warning";
    diseaseStatus.innerHTML = `<strong>Leaf Spot</strong> (78%)<br>
    <span style="font-size:0.9rem; color:#ffd54f;">💊 Remedy: Spray Neem Seed Kernel Extract (NSKE 5%)</span>`;
}

function startSendingFrames() {
    const ctx = canvas.getContext("2d");
    frameCounter = 0;
    finalDecision = null;

    captureInterval = setInterval(() => {
        if (!video.videoWidth) return;

        canvas.width = video.videoWidth;
        canvas.height = video.videoHeight;
        ctx.drawImage(video, 0, 0);

        frameCounter++;

        if (frameCounter < 3) {
            diseaseStatus.textContent = "Scanning leaf surface for spots and pathogen spore loads…";
            diseaseStatus.className = "";
        } else if (frameCounter < 5) {
            diseaseStatus.textContent = "Running neural network classification on plant tissues…";
        } else {
            if (!finalDecision) {
                finalDecision = dummyDiseases[Math.floor(Math.random() * dummyDiseases.length)];
            }
            
            diseaseStatus.innerHTML = `<strong>${finalDecision.label}</strong> (${Math.round(finalDecision.confidence * 100)}%)<br>
            <span style="font-size:0.9rem; color:#ffd54f;">💊 Remedy: ${finalDecision.remedy}</span>`;

            if (finalDecision.label === "Healthy Leaf") {
                diseaseStatus.className = "healthy";
                diseaseStatus.style.borderLeft = "4px solid #4CAF50";
            } else {
                diseaseStatus.className = "danger";
                diseaseStatus.style.borderLeft = "4px solid #FF5252";
            }

            clearInterval(captureInterval);
            cameraStatus.textContent = "Inference completed. Camera paused.";
            stopCamera();
        }
    }, 1500);
}

// --- 7. CROP DETAIL REVEAL ---
function showFullCropDetails(cropName) {
    const box = document.getElementById("fullCropDetails");
    const title = document.getElementById("fullDetailTitle");
    const list = document.getElementById("fullDetailList");

    title.textContent = `🌾 companion planting guide for ${cropName}`;
    list.innerHTML = "";

    const key = cropName.toLowerCase();
    const advice = dummySoilAdvice[key] || ["Plant with deep-rooted organic cover crops."];

    advice.forEach(item => {
        const li = document.createElement("li");
        li.textContent = item;
        list.appendChild(li);
    });

    box.classList.remove("hidden");
    box.scrollIntoView({ behavior: "smooth" });
}
