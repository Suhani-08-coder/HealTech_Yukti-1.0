const BACKEND_URL = "http://127.0.0.1:5000/api";
let currentMode = 'signup'; 
let userEmail = '';

function showSignup() {
    currentMode = 'signup';
    toggleForms('signup-form');
}

function showLogin() {
    currentMode = 'login';
    toggleForms('login-form');
}

function toggleForms(activeId) {
    const forms = ['signup-form', 'login-form', 'otp-form'];
    forms.forEach(id => {
        const el = document.getElementById(id);
        if (id === activeId) {
            el.style.display = 'block';
            // Simple fade-in animation
            el.style.opacity = '0';
            setTimeout(() => el.style.opacity = '1', 50);
        } else {
            el.style.display = 'none';
        }
    });
}

async function handleAuth(mode) {
    currentMode = mode;
    const btn = event.target; // Capture button to change text
    const originalText = btn.innerText;
    
    if (mode === 'signup') {
        userEmail = document.getElementById('s-email').value;
    } else {
        userEmail = document.getElementById('l-email').value;
    }

    if (!userEmail) return alert("Please enter your email address.");

    btn.innerText = "Sending Code...";

    try {
        const res = await fetch(`${BACKEND_URL}/send-otp`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ email: userEmail })
        });
        
        const data = await res.json();
        
        // Switch to OTP form
        toggleForms('otp-form');
        alert(data.message); // Keep alert for clear feedback

    } catch (e) {
        console.error(e);
        alert("Unable to connect to server.");
    } finally {
        btn.innerText = originalText;
    }
}

async function verifyCode() {
    const otp = document.getElementById('otp-input').value;
    const btn = event.target;
    
    let payload = { email: userEmail, otp: otp };

    if (currentMode === 'signup') {
        payload.userData = {
            name: document.getElementById('s-name').value,
            age: document.getElementById('s-age').value,
            gender: document.getElementById('s-gender').value
        };
    }

    btn.innerText = "Verifying...";

    try {
        const res = await fetch(`${BACKEND_URL}/verify-otp`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(payload)
        });

        const data = await res.json();

        if (res.ok) {
            localStorage.setItem('userEmail', data.user.email);
            localStorage.setItem('userName', data.user.name);
            localStorage.setItem('userAge', data.user.age);
            
            window.location.href = "Welcome.html";
        } else {
            alert(data.error);
            btn.innerText = "Enter Sanctuary";
        }
    } catch (e) {
        alert("Verification Failed");
        btn.innerText = "Enter Sanctuary";
    }
}