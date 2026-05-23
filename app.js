// Embedded Regulatory Data Table from Image
const regulatoryData = {
    "single_crew": {
        "brackets": [
            { "startMin": 0, "endMin": 239, "maxFT": 8, "fdp": { "1-2": 9, "3": 9, "4": 9, "5": 9, "6": 9, "7+": 9 } },
            { "startMin": 240, "endMin": 299, "maxFT": 8, "fdp": { "1-2": 10, "3": 10, "4": 10, "5": 9, "6": 9, "7+": 9 } },
            { "startMin": 300, "endMin": 359, "maxFT": 9, "fdp": { "1-2": 12, "3": 12, "4": 12, "5": 11.5, "6": 11, "7+": 10.5 } },
            { "startMin": 360, "endMin": 419, "maxFT": 9, "fdp": { "1-2": 13, "3": 13, "4": 13, "5": 11.5, "6": 11, "7+": 10.5 } },
            { "startMin": 420, "endMin": 719, "maxFT": 9, "fdp": { "1-2": 14, "3": 13, "4": 13, "5": 12.5, "6": 12, "7+": 11.5 } },
            { "startMin": 720, "endMin": 779, "maxFT": 9, "fdp": { "1-2": 13, "3": 13, "4": 13, "5": 12.5, "6": 12, "7+": 11.5 } },
            { "startMin": 780, "endMin": 1019, "maxFT": 9, "fdp": { "1-2": 12, "3": 12, "4": 12, "5": 11.5, "6": 11, "7+": 10.5 } },
            { "startMin": 1020, "endMin": 1199, "maxFT": 9, "fdp": { "1-2": 12, "3": 11, "4": 11, "5": 10, "6": 9, "7+": 9 } },
            { "startMin": 1200, "endMin": 1319, "maxFT": 9, "fdp": { "1-2": 12, "3": 11, "4": 11, "5": 10, "6": 9, "7+": 9 } },
            { "startMin": 1320, "endMin": 1379, "maxFT": 8, "fdp": { "1-2": 11, "3": 10, "4": 10, "5": 9, "6": 9, "7+": 9 } },
            { "startMin": 1380, "endMin": 1439, "maxFT": 8, "fdp": { "1-2": 10, "3": 10, "4": 9, "5": 9, "6": 9, "7+": 9 } }
        ]
    },
    "augmented_3_pilots": {
        "brackets": [
            { "startMin": 0, "endMin": 359, "maxFT": 13, "fdp": { "Class 1": 15, "Class 2": 14, "Class 3": 13 } },
            { "startMin": 360, "endMin": 419, "maxFT": 13, "fdp": { "Class 1": 16, "Class 2": 15, "Class 3": 14 } },
            { "startMin": 420, "endMin": 779, "maxFT": 13, "fdp": { "Class 1": 17, "Class 2": 16.5, "Class 3": 15 } },
            { "startMin": 780, "endMin": 1019, "maxFT": 13, "fdp": { "Class 1": 16, "Class 2": 15, "Class 3": 14 } },
            { "startMin": 1020, "endMin": 1439, "maxFT": 13, "fdp": { "Class 1": 15, "Class 2": 14, "Class 3": 13 } }
        ]
    },
    "double_4_pilots": {
        "brackets": [
            { "startMin": 0, "endMin": 359, "maxFT": 17, "fdp": { "Class 1": 17, "Class 2": 15.5, "Class 3": 13.5 } },
            { "startMin": 360, "endMin": 419, "maxFT": 17, "fdp": { "Class 1": 18.5, "Class 2": 16.5, "Class 3": 14.5 } },
            { "startMin": 420, "endMin": 779, "maxFT": 17, "fdp": { "Class 1": 19, "Class 2": 18, "Class 3": 15.5 } },
            { "startMin": 780, "endMin": 1019, "maxFT": 17, "fdp": { "Class 1": 18.5, "Class 2": 16.5, "Class 3": 14.5 } },
            { "startMin": 1020, "endMin": 1439, "maxFT": 17, "fdp": { "Class 1": 17, "Class 2": 15.5, "Class 3": 13.5 } }
        ]
    }
};

// DOM Elements
const reportTimeInput = document.getElementById('reportTime');
const crewTypeInput = document.getElementById('crewType');
const sectorsInput = document.getElementById('sectors');
const restClassInput = document.getElementById('restClass');
const sectorGroup = document.getElementById('sectorGroup');
const restGroup = document.getElementById('restGroup');

const maxFdpDisplay = document.getElementById('maxFdp');
const maxFltDisplay = document.getElementById('maxFlt');
const finalOnBlockDisplay = document.getElementById('finalOnBlock');

// Initialize Defaults & History Logic
window.addEventListener('DOMContentLoaded', () => {
    const now = new Date();
    const lastEntryTime = localStorage.getItem('lastFdpEntryTime');
    const lastEntryTimestamp = localStorage.getItem('lastFdpTimestamp');

    // Default to 'now' unless an entry exists from the last 24 hours
    if (lastEntryTime && lastEntryTimestamp && (now.getTime() - lastEntryTimestamp < 24 * 60 * 60 * 1000)) {
        reportTimeInput.value = lastEntryTime;
    } else {
        const hours = String(now.getHours()).padStart(2, '0');
        const minutes = String(now.getMinutes()).padStart(2, '0');
        reportTimeInput.value = `${hours}:${minutes}`;
    }
    
    calculateFDP();
});

// Manage UI visibility rules based on configuration selection
crewTypeInput.addEventListener('change', () => {
    if (crewTypeInput.value === 'single_crew') {
        sectorGroup.classList.remove('hidden');
        restGroup.classList.add('hidden');
    } else {
        sectorGroup.classList.add('hidden');
        restGroup.classList.remove('hidden');
    }
    calculateFDP();
});

// Event Listeners for Calculations
[reportTimeInput, sectorsInput, restClassInput].forEach(element => {
    element.addEventListener('change', calculateFDP);
});

function calculateFDP() {
    const timeVal = reportTimeInput.value;
    if (!timeVal) return;

    // Save calculation session state locally
    localStorage.setItem('lastFdpEntryTime', timeVal);
    localStorage.setItem('lastFdpTimestamp', new Date().getTime());

    // Compute absolute running time minutes from midnight
    const [hours, minutes] = timeVal.split(':').map(Number);
    const totalReportMinutes = (hours * 60) + minutes;

    const crewType = crewTypeInput.value;
    const config = regulatoryData[crewType];
    
    // Determine target filter sub-parameter
    const subParam = (crewType === 'single_crew') ? sectorsInput.value : restClassInput.value;

    // Search corresponding bracket match
    const matchedBracket = config.brackets.find(b => totalReportMinutes >= b.startMin && totalReportMinutes <= b.endMin);

    if (matchedBracket) {
        const maxFDP = matchedBracket.fdp[subParam];
        const maxFLT = matchedBracket.maxFT;

        // Render standard readouts
        maxFdpDisplay.textContent = `${maxFDP} hrs`;
        maxFltDisplay.textContent = `${maxFLT} hrs`;

        // Calculate and format final on-block time
        const fdpMinutes = maxFDP * 60;
        const totalBlockMinutes = (totalReportMinutes + fdpMinutes) % 1440; // Clock rollover handling

        const blockHours = String(Math.floor(totalBlockMinutes / 60)).padStart(2, '0');
        const blockMins = String(totalBlockMinutes % 60).padStart(2, '0');
        
        finalOnBlockDisplay.textContent = `${blockHours}:${blockMins}`;
    }
}

document.getElementById('updateBtn').addEventListener('click', async () => {
    const btn = document.getElementById('updateBtn');
    btn.textContent = "Checking...";
    btn.style.borderColor = "var(--border)";

    if ('serviceWorker' in navigator) {
        try {
            const registration = await navigator.serviceWorker.getRegistration();
            if (registration) {
                await registration.update();
                
                if (registration.waiting) {
                    btn.textContent = "Updating...";
                    btn.style.color = "var(--success)";
                    btn.style.borderColor = "var(--success)";
                    registration.waiting.postMessage({ type: 'SKIP_WAITING' });
                    setTimeout(() => window.location.reload(), 600);
                } else {
                    btn.textContent = "Up To Date ✓";
                    btn.style.color = "var(--success)";
                    btn.style.borderColor = "var(--success)";
                    setTimeout(() => {
                        btn.textContent = "Refresh ↻";
                        btn.style.color = "var(--muted)";
                        btn.style.borderColor = "var(--border)";
                    }, 2000);
                }
            }
        } catch (error) {
            btn.textContent = "Error ✗";
            btn.style.color = "#f87171";
            btn.style.borderColor = "#f87171";
            setTimeout(() => {
                btn.textContent = "Refresh ↻";
                btn.style.color = "var(--muted)";
                btn.style.borderColor = "var(--border)";
            }, 2000);
        }
    } else {
        btn.textContent = "Offline Only";
    }
});