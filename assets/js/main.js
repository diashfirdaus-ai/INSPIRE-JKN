// ============================================================
// JKN LLM Analytics - Main JavaScript
// Requires: config.js (for GEMINI_CONFIG)
// ============================================================

// ===== PAGE NAVIGATION =====
function showPage(page) {
    document.querySelectorAll('.page-section').forEach(s => s.classList.remove('active'));
    document.querySelectorAll('.nav-links a').forEach(a => a.classList.remove('active'));
    document.getElementById(page + '-page').classList.add('active');
    const navEl = document.getElementById('nav-' + page);
    if (navEl) navEl.classList.add('active');
    window.scrollTo({ top: 0, behavior: 'smooth' });
    if (page === 'dashboard') initCharts();
}

// ===== NAVBAR SCROLL EFFECT =====
window.addEventListener('scroll', function () {
    document.getElementById('mainNav').classList.toggle('scrolled', window.scrollY > 20);
});

// ===== FEATURE SLIDER =====
let currentSlide = 0;
const totalSlides = 3;
let sliderInterval;

function moveSlider(dir) {
    currentSlide = (currentSlide + dir + totalSlides) % totalSlides;
    updateSlider();
}

function goToSlide(i) {
    currentSlide = i;
    updateSlider();
}

function updateSlider() {
    const track = document.getElementById('sliderTrack');
    if (track) track.style.transform = `translateX(-${currentSlide * 100}%)`;
    document.querySelectorAll('.slider-dot').forEach((d, i) => {
        d.classList.toggle('active', i === currentSlide);
    });
}

function startAutoPlay() {
    sliderInterval = setInterval(() => moveSlider(1), 5000);
}

startAutoPlay();

const sliderContainer = document.querySelector('.slider-container');
if (sliderContainer) {
    sliderContainer.addEventListener('mouseenter', () => clearInterval(sliderInterval));
    sliderContainer.addEventListener('mouseleave', startAutoPlay);
}

// ===== ANIMATE ON SCROLL =====
const scrollObserver = new IntersectionObserver(function (entries) {
    entries.forEach(e => {
        if (e.isIntersecting) e.target.classList.add('visible');
    });
}, { threshold: 0.1 });

document.querySelectorAll('.animate-on-scroll').forEach(el => scrollObserver.observe(el));

// ===== IMPACT COUNTER ANIMATION =====
function animateCounter(el, target, prefix, suffix) {
    let start = 0;
    const duration = 2000;
    const step = target / (duration / 16);
    const timer = setInterval(() => {
        start += step;
        if (start >= target) { start = target; clearInterval(timer); }
        el.textContent = prefix + Math.floor(start).toLocaleString('id-ID') + suffix;
    }, 16);
}

const counterObserver = new IntersectionObserver(function (entries) {
    entries.forEach(e => {
        if (e.isIntersecting) {
            const el = e.target;
            if (el.id === 'counter-1') animateCounter(el, 12450, '', '');
            if (el.id === 'counter-2') animateCounter(el, 94, '', '%');
            if (el.id === 'counter-3') animateCounter(el, 3120, '', '');
            if (el.id === 'counter-4') animateCounter(el, 245, 'Rp', 'Jt');
            counterObserver.unobserve(el);
        }
    });
}, { threshold: 0.5 });

['counter-1', 'counter-2', 'counter-3', 'counter-4'].forEach(id => {
    const el = document.getElementById(id);
    if (el) counterObserver.observe(el);
});

// ===== CHART INITIALIZATION =====
let chartsInitialized = false;

function initCharts() {
    if (chartsInitialized) return;
    chartsInitialized = true;

    // Bar Chart - EWS Trend
    const tCtx = document.getElementById('trendChart').getContext('2d');
    new Chart(tCtx, {
        type: 'bar',
        data: {
            labels: ['Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu', 'Minggu'],
            datasets: [
                { label: 'Ekonomi/Finansial', data: [120, 150, 180, 130, 200, 250, 280], backgroundColor: '#10b981', borderRadius: 6 },
                { label: 'Teknis/Aplikasi',   data: [80, 90, 70, 85, 95, 110, 130],      backgroundColor: '#3b82f6', borderRadius: 6 },
                { label: 'Gateway Pembayaran', data: [40, 50, 45, 60, 40, 55, 65],        backgroundColor: '#f59e0b', borderRadius: 6 }
            ]
        },
        options: {
            responsive: true, maintainAspectRatio: false,
            scales: {
                x: { stacked: true, grid: { display: false }, border: { display: false } },
                y: { stacked: true, grid: { color: 'rgba(0,0,0,0.04)' }, border: { display: false } }
            },
            plugins: { legend: { position: 'bottom', labels: { usePointStyle: true, boxWidth: 8, padding: 20 } } },
            animation: { duration: 1000, easing: 'easeInOutQuart' }
        }
    });

    // Doughnut Chart - Faktor Determinan
    const fCtx = document.getElementById('factorChart').getContext('2d');
    new Chart(fCtx, {
        type: 'doughnut',
        data: {
            labels: ['Masalah Ekonomi (PHK)', 'UI Aplikasi Membingungkan', 'Gateway Error', 'Lupa Bayar', 'Lainnya'],
            datasets: [{
                data: [45, 20, 15, 12, 8],
                backgroundColor: ['#10b981', '#3b82f6', '#f59e0b', '#8b5cf6', '#94a3b8'],
                borderWidth: 0, hoverOffset: 8
            }]
        },
        options: {
            responsive: true, maintainAspectRatio: false, cutout: '68%',
            plugins: { legend: { position: 'right', labels: { usePointStyle: true, padding: 16, font: { size: 11 } } } },
            animation: { animateRotate: true, duration: 1000 }
        }
    });
}

// ===== LLM EXAMPLE CHIPS =====
function fillExample(type) {
    const examples = {
        1: "Suami baru kena PHK bulan lalu, jadi bulan ini sekeluarga terpaksa nunggak BPJS dulu karena buat makan aja susah. Mohon pengertiannya.",
        2: "Tolong dong aplikasi mobile JKN diperbaiki! Saya mau bayar tunggakan malah muter-muter aja di halaman login. Ribet banget antarmukanya bikin pusing.",
        3: "Udah 3 hari coba bayar JKN lewat m-banking gagal terus. Error terus di gateway pembayaran. Padahal lagi butuh buat berobat besok."
    };
    document.getElementById('llmInput').value = examples[type] || '';
}

// ===== LLM ANALYZE FUNCTION =====
async function analyzeText() {
    const inputText = document.getElementById('llmInput').value.trim();
    if (!inputText) { showToast("Silakan masukkan teks keluhan terlebih dahulu."); return; }

    // Cek API Key jika tidak menggunakan serverless
    if (!GEMINI_CONFIG.useServerless && (!GEMINI_CONFIG.apiKey || GEMINI_CONFIG.apiKey.trim() === '')) {
        showToast("API Key Gemini belum diisi. Buka file config.js dan isi API Key Anda.");
        return;
    }

    // Set loading state
    document.getElementById('resultOverlay').style.display = 'none';
    document.getElementById('btnAnalyze').disabled = true;
    document.getElementById('loadingIndicator').style.display = 'flex';
    document.getElementById('actionBtnContainer').style.display = 'none';
    ['outDeterminan', 'outSentimen', 'outAlasan', 'outRekomendasi'].forEach(id => {
        document.getElementById(id).textContent = '...';
    });

    const systemPrompt = `Anda adalah analis data senior di BPJS Kesehatan (JKN). Tugas Anda adalah membaca teks keluhan dari peserta dan mengekstrak informasi spesifik.
Klasifikasikan determinan penunggakan menjadi salah satu dari: [Ekonomi, Teknis Aplikasi, Gateway Pembayaran, Administratif, Lainnya].
Sentimen: [Positif, Netral, Negatif].
Tuliskan alasan_tersembunyi secara ringkas (maks 2 kalimat).
Tuliskan rekomendasi_aksi berupa tindakan sistem otomatis yang spesifik.`;

    const responseSchema = {
        type: "OBJECT",
        properties: {
            determinan:       { type: "STRING" },
            sentimen:         { type: "STRING" },
            alasan_tersembunyi: { type: "STRING" },
            rekomendasi_aksi: { type: "STRING" }
        },
        required: ["determinan", "sentimen", "alasan_tersembunyi", "rekomendasi_aksi"]
    };

    let payload;
    if (GEMINI_CONFIG.useServerless) {
        payload = {
            prompt: inputText,
            systemInstruction: systemPrompt,
            responseSchema: responseSchema
        };
    } else {
        payload = {
            contents: [{ parts: [{ text: inputText }] }],
            systemInstruction: { parts: [{ text: systemPrompt }] },
            generationConfig: {
                responseMimeType: "application/json",
                responseSchema: responseSchema
            }
        };
    }

    const apiUrl = typeof GEMINI_CONFIG.apiUrl === 'function' ? GEMINI_CONFIG.apiUrl() : GEMINI_CONFIG.apiUrl;

    try {
        const response = await fetch(apiUrl, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload)
        });

        if (!response.ok) {
            const errData = await response.json().catch(() => ({}));
            throw new Error(errData.error?.message || errData.error || `HTTP ${response.status}`);
        }

        const result = await response.json();
        let resultText = '';
        if (GEMINI_CONFIG.useServerless) {
            if (result.text) {
                resultText = result.text;
            } else {
                throw new Error("Respons tidak valid dari serverless function.");
            }
        } else {
            if (result.candidates && result.candidates[0].content.parts[0].text) {
                resultText = result.candidates[0].content.parts[0].text;
            } else {
                throw new Error("Respons tidak valid dari API.");
            }
        }

        updateResultUI(JSON.parse(resultText));
    } catch (error) {
        console.error('LLM Error:', error);
        showToast("Error: " + error.message);
        document.getElementById('resultOverlay').style.display = 'flex';
    } finally {
        document.getElementById('btnAnalyze').disabled = false;
        document.getElementById('loadingIndicator').style.display = 'none';
    }
}

// ===== UPDATE RESULT UI =====
function updateResultUI(data) {
    const det = data.determinan.toLowerCase();
    let detColor = 'var(--sl800)';
    if (det.includes('ekonomi'))    detColor = '#dc2626';
    else if (det.includes('teknis') || det.includes('aplikasi')) detColor = '#2563eb';
    else if (det.includes('gateway'))   detColor = '#d97706';
    else if (det.includes('administ'))  detColor = '#7c3aed';

    document.getElementById('outDeterminan').style.color = detColor;
    document.getElementById('outDeterminan').textContent = data.determinan;

    const s = data.sentimen.toLowerCase();
    const icon = s === 'negatif' ? '😞 ' : s === 'positif' ? '😊 ' : '😐 ';
    document.getElementById('outSentimen').textContent = icon + data.sentimen;
    document.getElementById('outAlasan').textContent = '"' + data.alasan_tersembunyi + '"';
    document.getElementById('outRekomendasi').textContent = data.rekomendasi_aksi;
    document.getElementById('actionBtnContainer').style.display = 'block';
}

// ===== TOAST NOTIFICATION =====
function showToast(msg) {
    const t = document.getElementById('toast');
    document.getElementById('toast-msg').textContent = msg;
    t.classList.add('show');
    setTimeout(() => t.classList.remove('show'), 3500);
}
