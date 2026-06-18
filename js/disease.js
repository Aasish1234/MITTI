

let videoStream = null;
let captureInterval = null;
let videoDevices = [];
let currentCameraIndex = 0;

const video = document.getElementById("video");
const canvas = document.getElementById("canvas");
const resultBox = document.getElementById("diseaseResult");
const resultText = document.getElementById("resultText");

// --- 1. CAMERA STREAM CONNECTION ---
async function loadVideoDevices() {
    try {
        const devices = await navigator.mediaDevices.enumerateDevices();
        videoDevices = devices.filter(d => d.kind === "videoinput");

        // Prefer back/rear camera for mobile smart board usage
        const backIndex = videoDevices.findIndex(d =>
            d.label.toLowerCase().includes("back") ||
            d.label.toLowerCase().includes("rear") ||
            d.label.toLowerCase().includes("environment")
        );

        if (backIndex !== -1) {
            currentCameraIndex = backIndex;
        }

        // Hide switch button if single lens is present
        const switchBtn = document.getElementById("switchCamBtn");
        if (switchBtn && videoDevices.length < 2) {
            switchBtn.style.display = "none";
        }
    } catch (err) {
        console.error("Error enumerating devices:", err);
    }
}

async function startCamera() {
    const cameraBox = document.getElementById("cameraBox");
    if (!video) return;

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

        document.getElementById("startCamBtn").disabled = true;
        document.getElementById("stopCamBtn").disabled = false;
        
        if (cameraBox) {
            cameraBox.classList.add("scanning");
        }

        video.onloadedmetadata = () => {
            video.play();
            startSendingFrames();
        };

    } catch (err) {
        alert("Camera stream access denied. Please grant permission.");
        console.error(err);
    }
}

function stopCamera() {
    const cameraBox = document.getElementById("cameraBox");
    
    if (videoStream) {
        videoStream.getTracks().forEach(track => track.stop());
        videoStream = null;
    }

    clearInterval(captureInterval);

    document.getElementById("startCamBtn").disabled = false;
    document.getElementById("stopCamBtn").disabled = true;
    
    if (cameraBox) {
        cameraBox.classList.remove("scanning");
    }
    
    if (resultBox) {
        resultBox.classList.add("hidden");
    }
}

function switchCamera() {
    if (videoDevices.length < 2) return;

    stopCamera();
    currentCameraIndex = (currentCameraIndex + 1) % videoDevices.length;
    startCamera();
}

// --- 2. ORGANIC REMEDIES CATALOG ---
const organicDiseases = [
    {
        name: "Healthy Leaf",
        severity: "None",
        pestType: "N/A",
        remedy: "No disease detected.",
        recipe: "Keep maintaining rhizosphere humus. Spray Jeevamrutha bi-weekly as a soil tonic to boost microbial resistance."
    },
    {
        name: "Powdery Mildew (Fungal Infection)",
        severity: "Medium",
        pestType: "Erysiphe polygoni",
        remedy: "Sour Buttermilk Copper-Decoction Spray",
        recipe: "Take 1 liter of sour buttermilk (fermented for 4 weeks in a copper vessel to release copper ions). Mix with 10 liters of water. Spray thoroughly on leaf surfaces every 7 days."
    },
    {
        name: "Leaf Rust (Fungal Infection)",
        severity: "High",
        pestType: "Puccinia graminis",
        remedy: "Agniastra (Ginger-Garlic-Chili Decoction)",
        recipe: "Boil 500g crushed garlic, 500g ginger paste, and 500g hot green chili paste in 10 liters of cow urine. Dilute 250ml of this filtrate in 10 liters of water. Spray twice a week."
    },
    {
        name: "Early Blight (Fungal pathogen)",
        severity: "Medium",
        pestType: "Alternaria solani",
        remedy: "Wood Ash & Lime Suspension",
        recipe: "Sift 50g dry wood ash and 10g slaked lime. Mix in 1 liter of water, let it settle overnight, filter, and spray. The alkaline residue inhibits fungal spore germination."
    },
    {
        name: "Leaf Spot (Bacterial infection)",
        severity: "Low",
        pestType: "Xanthomonas campestris",
        remedy: "Neem Seed Kernel Extract (NSKE 5%) & Soap Emulsion",
        recipe: "Soak 500g neem seed powder in 10 liters of water overnight. Filter and mix 10ml liquid soap as a surfactant. Spray in the evening to cure and prevent leaf spots."
    }
];

let frameCounter = 0;

// --- 3. RUN SIMULATED INFERENCE ---
function runOrganicDiseaseAnalysis() {
    frameCounter++;

    if (frameCounter < 3) {
        return { type: "scanning", msg: "Scanning leaf cuticle and visual anomalies..." };
    }

    if (frameCounter < 5) {
        return { type: "processing", msg: "Running CNN classification and checking botanical database..." };
    }

    // Pick a random disease diagnosis once processing finishes
    const diagnosis = organicDiseases[Math.floor(Math.random() * organicDiseases.length)];
    return { type: "result", data: diagnosis };
}

function formatRemedyOutput(data) {
    if (data.name === "Healthy Leaf") {
        return `<strong>Diagnosis:</strong> <span style="color:#7cff6b; text-shadow: 0 0 8px rgba(124,255,107,0.4);">HEALTHY</span>
<br><strong>System Status:</strong> ${data.remedy}
<br><br><strong>Rhizosphere Care:</strong> ${data.recipe}`;
    }

    const severityColor = data.severity === "High" ? "#FF5252" : "#FFD54F";
    return `<strong>Detected:</strong> <span style="color:#FF5252; text-shadow: 0 0 8px rgba(255,82,82,0.4);">${data.name}</span>
<br><strong>Severity:</strong> <span style="color:${severityColor}; font-weight:bold;">${data.severity}</span>
<br><strong>Pathogen:</strong> <em>${data.pestType}</em>
<br><br><strong>Organic Remedy:</strong> <span style="color:var(--accent); font-weight:bold;">${data.remedy}</span>
<br><strong>Recipe & Application:</strong> ${data.recipe}`;
}

function startSendingFrames() {
    const ctx = canvas.getContext("2d");
    frameCounter = 0;

    captureInterval = setInterval(() => {
        if (!video || !video.videoWidth) return;

        canvas.width = video.videoWidth;
        canvas.height = video.videoHeight;
        ctx.drawImage(video, 0, 0);

        // Run mock AI analysis
        const res = runOrganicDiseaseAnalysis();

        if (resultBox) {
            resultBox.classList.remove("hidden");
        }

        if (res.type === "result") {
            const output = formatRemedyOutput(res.data);
            if (resultText) resultText.innerHTML = output;

            // Voice synthesis of the result for accessibility
            const speechText = res.data.name === "Healthy Leaf" 
                ? "Diagnosis complete. The leaf is healthy. No action needed." 
                : `Diagnosis complete. Detected ${res.data.name} with ${res.data.severity} severity. Recommending ${res.data.remedy}.`;
            
            speakAssistantResponse(speechText);
            
            // Draw result border
            if (res.data.name === "Healthy Leaf") {
                resultBox.style.borderLeft = "5px solid #4CAF50"; // Green
            } else {
                resultBox.style.borderLeft = "5px solid #FF5252"; // Red
            }

            // Stop camera loop as diagnosis is complete
            clearInterval(captureInterval);
            const cameraBox = document.getElementById("cameraBox");
            if (cameraBox) cameraBox.classList.remove("scanning");

        } else {
            // Scanning or processing
            if (resultText) resultText.innerHTML = `<i class="fa-solid fa-spinner fa-spin"></i> ${res.msg}`;
            if (resultBox) resultBox.style.borderLeft = "5px solid var(--accent)";
        }

    }, 1500);
}
