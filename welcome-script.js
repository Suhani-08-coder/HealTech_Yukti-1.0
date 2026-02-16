const BACKEND_URL = "http://127.0.0.1:5000/api";

const safetyHindi = new Audio('audio/hindi-calm-Audio.mp3'); 
const safetyEnglish = new Audio('audio/English-calm-Audio.mp3'); 

let selectedMood = "";


function handleMood(mood, cardElement) {
    selectedMood = mood;
    document.querySelectorAll('.mood-btn').forEach(c => c.classList.remove('active'));
    cardElement.classList.add('active');

    const box = document.getElementById('moodMessage');
    const title = document.getElementById('msgTitle');
    const body = document.getElementById('msgBody');
    const btn = document.getElementById('msgBtn');
    
    box.classList.remove('hidden');

    const config = {
        great: { color: "#fcd34d", title: "Radiant Energy ✨", body: "You are glowing. Let's channel this positivity into a reflection session.", text: "Begin Reflection", url: "relax.html" },
        good: { color: "#6ee7b7", title: "Peaceful Flow 🌿", body: "A beautiful state to be in. Deepen this calm with a guided breathing session.", text: "Start Breathing", url: "resources.html#ai" },
        neutral: { color: "#cbd5e1", title: "Still Waters ☁️", body: "Stillness is powerful. If you feel stuck, our AI companion can offer a fresh perspective.", text: "Speak to Companion", action: openChat },
        struggling: { color: "#93c5fd", title: "Heavy Heart 🌧️", body: "It's okay to feel this way. Nature visuals can help ground you in the present moment.", text: "Watch Visuals", url: "resources.html#videos" },
        awful: { color: "#fda4af", title: "Stormy Seas ⛈️", body: "You don't have to carry this alone. Let the soundscapes wash over you and provide relief.", text: "Listen to Rain", url: "resources.html#songs" }
    };

    const s = config[mood];
    box.style.borderLeftColor = s.color;
    title.innerText = s.title;
    body.innerText = s.body;
    btn.innerText = s.text;
    btn.onclick = s.action ? s.action : () => window.location.href = s.url;
}

function openChat() {
    const overlay = document.getElementById('chatOverlay');
    overlay.classList.remove('hidden');
    setTimeout(() => overlay.style.opacity = '1', 10);
}

function closeChat() {
    const overlay = document.getElementById('chatOverlay');
    overlay.style.opacity = '0';
    setTimeout(() => overlay.classList.add('hidden'), 500);
}


async function submitNote() {
    const thought = document.getElementById('userNote').value;
    const aiBox = document.getElementById('aiResponse');
    const email = localStorage.getItem("userEmail");
    const sendBtn = document.querySelector('.btn-action'); 

    if (!thought.trim()) return;

    sendBtn.innerText = "Connecting...";
    aiBox.classList.remove('hidden');
    aiBox.innerHTML = "<span>Listening...</span>";

    try {
        const res = await fetch(`${BACKEND_URL}/chat`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ message: thought })
        });
        const data = await res.json();
        
    
        const companionReply = data.reply || "Main sun raha hoon, kahiye...";

        if (data.action === "safety_alert") {
            const hindiPattern = /[\u0900-\u097F]/;
            
       
            if (hindiPattern.test(thought)) {
                safetyHindi.play(); 
            } else {
                safetyEnglish.play(); 
            }

            let hotlines = data.hotlines ? data.hotlines.map(h => `<a href="${h.link}" /20 p-2 rounded mb-2 text-white no-underline hover:bg-red-500/40 transition">${h.name}: ${h.number}</a>`).join('') : "";
            
            aiBox.innerHTML = `
                <div class="p-5 rounded-xl text-left ">
                    <strong class="block mb-2 text-soft-white text-xl font-serif">You are not alone ✨</strong>
                    <p class="text-rose-100 leading-relaxed mb-4">${companionReply}</p>
                    <div class="space-y-2">${hotlines}</div>
                </div>
            `;
        } else {
            let html = `<strong class="text-teal-200 block mb-2">Companion</strong>${companionReply}`;
            if (data.suggestion) {
                html += `<button onclick="window.location.href='${data.suggestion.link}'" class="mt-4 block bg-white/10 p-2 px-4 rounded-full text-xs hover:bg-white/20 transition">${data.suggestion.text} →</button>`;
            }
            aiBox.innerHTML = html;
        }

        
        if (email) {
            await fetch(`${BACKEND_URL}/save-chat`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
        email,
        message: thought,
        reply: companionReply
    })
});

        }

    } catch (e) {
        aiBox.innerText = "The connection is silent right now. Please check your server.";
    } finally {
        sendBtn.innerText = "Release";
    }
}

function logout() {
    localStorage.clear();
    window.location.href = "loginPage.html";
}


window.onload = function() {
    const name = localStorage.getItem('userName');
    if(name) {
        const display = document.getElementById('usernameDisplay');
        if(display) display.innerText = name;
    }
};

