const BACKEND_URL = "http://127.0.0.1:5000/api/analyze-quiz";

const questions = [
    { 
        text: "How have you been sleeping lately?", 
        options: ["Great, fully rested", "Okay, could be better", "Poorly, hardly sleeping"], 
        scores: [10, 5, 0] 
    },
    { 
        text: "Do you feel overwhelmed by your daily tasks?", 
        options: ["Rarely", "Sometimes", "Often"], 
        scores: [10, 5, 0] 
    },
    { 
        text: "Are you finding time to do things you enjoy?", 
        options: ["Yes, regularly", "Occasionally", "No, not at all"], 
        scores: [10, 5, 0] 
    },
    { 
        text: "How would you rate your energy levels today?", 
        options: ["High", "Moderate", "Low"], 
        scores: [10, 5, 0] 
    },
    { 
        text: "Have you felt anxious or worried recently?", 
        options: ["Not really", "A little bit", "Yes, significantly"], 
        scores: [10, 5, 0] 
    }
];

let currentQuestionIndex = 0;
let totalScore = 0;
let userAnswers = [];

function initQuiz() {
    currentQuestionIndex = 0;
    totalScore = 0;
    userAnswers = [];
    document.getElementById("quiz-container").classList.remove("hidden");
    document.getElementById("result-container").classList.add("hidden");
    document.getElementById("loading-container").classList.add("hidden");
    loadQuestion();
}

function loadQuestion() {
    const q = questions[currentQuestionIndex];
    document.getElementById("question-text").innerText = q.text;
    document.getElementById("current-step").innerText = currentQuestionIndex + 1;
    
    const container = document.getElementById("options-container");
    container.innerHTML = "";
    
    q.options.forEach((opt, index) => {
        const btn = document.createElement("button");
        
        // --- REDESIGN UPDATE: Injecting Tailwind Classes for styling ---
        btn.className = "option-btn w-full p-5 text-left text-lg text-slate-600 bg-white border border-slate-200 rounded-2xl shadow-sm hover:border-teal-400 hover:ring-1 hover:ring-teal-400 hover:shadow-md transition-all duration-200 group";
        
        btn.innerHTML = `<span class="group-hover:text-teal-600 transition-colors">${opt}</span>`;
        btn.onclick = () => handleAnswer(q.scores[index], opt);
        container.appendChild(btn);
    });

    updateProgress();
}

function handleAnswer(score, answerText) {
    totalScore += score;
    userAnswers.push({
        question: questions[currentQuestionIndex].text,
        answer: answerText
    });
    
    currentQuestionIndex++;
    
    if (currentQuestionIndex < questions.length) {
        loadQuestion();
    } else {
        finishQuiz();
    }
}

function updateProgress() {
    const progress = ((currentQuestionIndex) / questions.length) * 100;
    document.getElementById("progressBar").style.width = progress + "%";
}

async function finishQuiz() {
    document.getElementById("quiz-container").classList.add("hidden");
    document.getElementById("loading-container").classList.remove("hidden");
    document.getElementById("score-display").innerText = totalScore;

    try {
        const response = await fetch(BACKEND_URL, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ answers: userAnswers, score: totalScore })
        });

        const data = await response.json();
        
        if(data.error) throw new Error(data.error);
        
        showResults(data.reply);

    } catch (error) {
        console.error(error);
        getOfflineRecommendation();
    }
}

function getOfflineRecommendation() {
    let advice = "";
    
    if (totalScore >= 40) {
        advice = "You're in a great mental space! 🌟 To keep this momentum, we recommend trying a **Focus Meditation** to channel your energy positively.";
    } else if (totalScore >= 25) {
        advice = "You're doing okay, but might be carrying some hidden stress. 💙 We recommend listening to **Rain Sounds** in our Relaxation Zone to unwind.";
    } else {
        advice = "It seems you're having a tough time. That's okay. 🤗 We strongly recommend trying the **Deep Breathing Exercise** video to help calm your nervous system.";
    }

    showResults(advice);
}

function showResults(feedback) {
    document.getElementById("loading-container").classList.add("hidden");
    document.getElementById("result-container").classList.remove("hidden");
    
    const formattedFeedback = feedback.replace(/\*\*/g, "").replace(/\n/g, "<br>");
    document.getElementById("ai-feedback-text").innerHTML = formattedFeedback;
}

function restartQuiz() {
    initQuiz();
}
(function() {
    const userEmail = localStorage.getItem("userEmail");
    if (!userEmail) {
        
        window.location.href = "loginPage.html";
    }
})();

window.onload = initQuiz;