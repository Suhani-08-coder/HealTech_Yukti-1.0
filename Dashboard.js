
const userName = localStorage.getItem("userName") || "Explorer";


const monthlyMoodData = [6, 7, 5, 8, 6, 7, 9, 8, 7, 6, 5, 7, 8, 9, 7];
const weeklyIntensityData = [5, 6, 7, 8, 6, 5, 7];


document.getElementById("userName").innerText = userName;


const todayMood = monthlyMoodData[monthlyMoodData.length - 1];
document.getElementById("dailyScore").innerText = `${todayMood}/10`;


let streak = 0;
monthlyMoodData.forEach(score => {
    if (score >= 6) streak++;
    else streak = 0;
});
document.getElementById("currentStreakText").innerText = `${streak} Days 🔥`;

// ---------- PATTERN ALERT ----------
const avgMood =
    monthlyMoodData.reduce((a, b) => a + b, 0) / monthlyMoodData.length;

const patternAlert = document.getElementById("patternAlert");

if (avgMood < 4) {
    patternAlert.innerText = "Low Mood Pattern ⚠️";
    patternAlert.classList.add("text-red-400");
} else if (avgMood < 6) {
    patternAlert.innerText = "Fluctuating Mood ⚡";
    patternAlert.classList.add("text-yellow-400");
} else {
    patternAlert.innerText = "Stable Pattern ✨";
}

// ---------- DETECTION CARD ----------
const passiveMoodEl = document.getElementById("passiveMood");
const confidenceLevelEl = document.getElementById("confidenceLevel");
const reasoningTextEl = document.getElementById("reasoningText");

if (todayMood >= 7) {
    passiveMoodEl.innerText = "Calm";
    confidenceLevelEl.innerText = "85% Sure";
    reasoningTextEl.innerText =
        "Consistent positive check-ins and balanced usage detected.";
} else if (todayMood >= 5) {
    passiveMoodEl.innerText = "Neutral";
    confidenceLevelEl.innerText = "65% Sure";
    reasoningTextEl.innerText =
        "Mixed sentiment words and irregular check-in timings.";
} else {
    passiveMoodEl.innerText = "Stressed";
    confidenceLevelEl.innerText = "90% Sure";
    reasoningTextEl.innerText =
        "Negative sentiment + late-night activity detected.";
}


const riskAlert = document.getElementById("riskAlert");

if (avgMood <= 4) {
    riskAlert.classList.remove("hidden");
    riskAlert.innerText =
        "⚠️ We noticed a prolonged low mood pattern. Consider using Relax or reaching out to support.";
}

const ctxMonthly = document.getElementById("monthlyChart").getContext("2d");

new Chart(ctxMonthly, {
    type: "line",
    data: {
        labels: monthlyMoodData.map((_, i) => `Day ${i + 1}`),
        datasets: [
            {
                label: "Mood Score",
                data: monthlyMoodData,
                borderWidth: 2,
                tension: 0.4,
                fill: true
            }
        ]
    },
    options: {
        responsive: true,
        plugins: {
            legend: { display: false }
        },
        scales: {
            y: {
                min: 0,
                max: 10
            }
        }
    }
});


const ctxWeekly = document.getElementById("weeklyChart").getContext("2d");

new Chart(ctxWeekly, {
    type: "bar",
    data: {
        labels: ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"],
        datasets: [
            {
                label: "Emotional Intensity",
                data: weeklyIntensityData
            }
        ]
    },
    options: {
        responsive: true,
        plugins: {
            legend: { display: false }
        },
        scales: {
            y: {
                min: 0,
                max: 10
            }
        }
    }
});