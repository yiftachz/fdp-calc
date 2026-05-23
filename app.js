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

const reportTimeInput = document.getElementById('reportTime');
const crewTypeInput = document.getElementById('crewType');
const sectorsInput = document.getElementById('sectors');
const restClassInput = document.getElementById('restClass');
const sectorGroup = document.getElementById('sectorGroup');
const restGroup = document.getElementById('restGroup');

const maxFdpDisplay = document.getElementById('maxFdp');
const maxFltDisplay = document.getElementById('maxFlt');
const finalOnBlockDisplay = document.getElementById('finalOnBlock');

window.addEventListener('DOMContentLoaded', () => {
    const now = new Date();
    const lastEntryTime = localStorage.getItem('lastFdpEntryTime');
    const lastEntryTimestamp = localStorage.getItem('lastFdpTimestamp');
    const pad = (n) => n.toString().padStart(2, '0');

    // Restore calculation context if updated within a 24-hour bracket window
    if (lastEntryTime && lastEntryTimestamp && (now.getTime() - lastEntryTimestamp < 24 * 60 * 60 * 1000)) {
        reportTimeInput.value = lastEntryTime;
    } else {
        reportTimeInput.value = `${pad(now.getHours())}:${pad(now.getMinutes())}`;
    }
    calculateFDP();
});

// Inline keyboard parsing with auto-colon spacing injection[cite: 1]
reportTimeInput.addEventListener('input', (e) => {
    let v = e.target.value.replace(/[^0-9]/g, '');
    if (v.length >= 3) v = v.slice(0, 2) + ':' + v.slice(2, 4);
    e.target.value = v;
    calculateFDP();
});

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

[sectorsInput, restClassInput].forEach(el => el.addEventListener('change', calculateFDP));

function calculateFDP() {
    const timeVal = reportTimeInput.value;
    if (!timeVal || timeVal.length < 5) return;

    const [hours, minutes] = timeVal.split(':').map(Number);
    if (hours > 23 || minutes > 59) return;

    localStorage.setItem('lastFdpEntryTime', timeVal);
    localStorage.setItem('lastFdpTimestamp', new Date().getTime());

    const totalReportMinutes = (hours * 60) + minutes;
    const crewType = crewTypeInput.value;
    const config = regulatoryData[crewType];
    const subParam = (crewType === 'single_crew') ? sectorsInput.value : restClassInput.value;

    const matchedBracket = config.brackets.find(b => totalReportMinutes >= b.startMin && totalReportMinutes <= b.endMin);

    if (matchedBracket) {
        const maxFDP = matchedBracket.fdp[subParam];
        const maxFLT = matchedBracket.maxFT;

        maxFdpDisplay.textContent = `${maxFDP} h`;
        maxFltDisplay.textContent = `${maxFLT} h`;

        const fdpMinutes = maxFDP * 60;
        const totalBlockMinutes = (totalReportMinutes + fdpMinutes) % 1440;

        const blockHours = String(Math.floor(totalBlockMinutes / 60)).padStart(2, '0');
        const blockMins = String(totalBlockMinutes % 60).padStart(2, '0');
        
        finalOnBlockDisplay.textContent = `${blockHours}:${blockMins}`;
    }
}