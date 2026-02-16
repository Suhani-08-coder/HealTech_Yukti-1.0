const sanctuaryData = {
    "mindful-corner": {
        title: "The Mindful Corner",
        tagline: "Where silence finds its voice.",
        phone: "+91 98765 43210",
        desc: "A minimalist urban retreat designed for deep silence. Features soundproof meditation pods and 1-on-1 mindfulness coaching for beginners.",
        img: "https://images.unsplash.com/photo-1545389336-cf090694435e?auto=format&fit=crop&q=80&w=2000"
    },
    "zen-garden": {
        title: "Zen Garden",
        tagline: "Rooted in nature, blooming in peace.",
        phone: "+91 98222 11100",
        desc: "Open-air pavilions surrounded by ancient bamboo and flowing water. We specialize in Zen meditation and outdoor morning yoga sessions.",
        img: "https://images.unsplash.com/photo-1506126613408-eca07ce68773?auto=format&fit=crop&q=80&w=2000"
    },
    "inner-peace": {
        title: "Inner Peace Collective",
        tagline: "Harmonizing soul and sound.",
        phone: "+91 95555 00044",
        desc: "A center dedicated to Sound Therapy. Experience healing vibrations from Tibetan singing bowls and delta-wave frequency immersion.",
        img: "https://images.unsplash.com/photo-1610110269180-a298e213d3a0?q=80&w=435&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D"
    },
    "urban-soul": {
        title: "Urban Soul",
        tagline: "Retreat. Reset. Restart.",
        phone: "+91 88888 77766",
        desc: "Our weekend stress-relief intensives are perfect for working professionals. Digital detox workshops and guided breathing sessions available.",
        img: "https://images.unsplash.com/photo-1570218295208-19f51ef34881?w=600&auto=format&fit=crop&q=60&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxzZWFyY2h8MXx8d2Vla2VuZCUyMGludGVuc2l2ZSUyMGRpZ2l0YWwlMjBkZXRveHxlbnwwfHwwfHx8MA%3D%3D"
    }
};

function updatePreview(key, element) {
    const data = sanctuaryData[key];
    if (!data) return;

    document.querySelectorAll('.sanctuary-card').forEach(card => card.classList.remove('active'));
    element.classList.add('active');

    const img = document.getElementById('main-preview');
    const titleEl = document.getElementById('preview-title');
    const taglineEl = document.getElementById('preview-tagline');
    const phoneEl = document.getElementById('preview-phone');
    const descEl = document.getElementById('preview-desc');

    img.style.opacity = '0';

    setTimeout(() => {
        img.src = data.img;
        titleEl.innerText = data.title;
        taglineEl.innerText = `"${data.tagline}"`;
        phoneEl.innerHTML = `📞 ${data.phone}`;
        descEl.innerText = data.desc;

        img.onload = () => {
            img.style.opacity = '1';
        };
    }, 400);
}

(function() {
    const userEmail = localStorage.getItem("userEmail");
    if (!userEmail) {
        
        window.location.href = "loginPage.html";
    }
})();
function logout() {
    localStorage.clear();
    window.location.href = "loginPage.html";
}
