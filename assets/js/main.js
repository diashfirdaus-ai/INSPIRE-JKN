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

// ===== INBOX SIMULATOR LOGIC =====
const mockComplaints = [
    { id: "C-1042", source: "Twitter", sourceClass: "twitter", text: "Suami baru kena PHK bulan lalu, jadi bulan ini sekeluarga terpaksa nunggak BPJS dulu karena buat makan aja susah. Mohon pengertiannya." },
    { id: "C-1043", source: "LAPOR!", sourceClass: "lapor", text: "Tolong dong aplikasi mobile JKN diperbaiki! Saya mau bayar tunggakan malah muter-muter aja di halaman login. Ribet banget antarmukanya bikin pusing." },
    { id: "C-1044", source: "App Store", sourceClass: "appstore", text: "Udah 3 hari coba bayar JKN lewat m-banking gagal terus. Error terus di gateway pembayaran. Padahal lagi butuh buat berobat besok." },
    { id: "C-1045", source: "Twitter", sourceClass: "twitter", text: "Saya sudah 5 bulan tidak membayar iuran karena lupa dan tidak ada yang mengingatkan. Baru tahu kalau ada program cicilan." }
];

let analyzedResults = {};

function initSimulator() {
    const tbody = document.getElementById('complaintsBody');
    if (!tbody) return;
    tbody.innerHTML = '';
    
    mockComplaints.forEach((comp) => {
        const tr = document.createElement('tr');
        tr.id = `row-${comp.id}`;
        tr.innerHTML = `
            <td><strong>${comp.id}</strong></td>
            <td><span class="source-badge ${comp.sourceClass}">${comp.source}</span></td>
            <td>${comp.text}</td>
            <td id="status-${comp.id}"><span class="status-badge status-pending">Menunggu...</span></td>
            <td id="rec-${comp.id}"><span style="color:var(--sl400);font-style:italic;">Belum Dianalisis</span></td>
            <td id="action-${comp.id}">
                <button class="btn-execute" style="opacity:0.5;cursor:not-allowed;" disabled><i class="fas fa-play"></i> Eksekusi</button>
            </td>
        `;
        tbody.appendChild(tr);
    });
}

// Initialize on page load if simulator exists
document.addEventListener("DOMContentLoaded", () => {
    initSimulator();
});

async function analyzeAll() {
    const btn = document.getElementById('btnAnalyzeAll');
    if (btn) {
        btn.disabled = true;
        btn.innerHTML = `<div class="spinner-small" style="display:inline-block;vertical-align:middle;margin-right:6px;border-width:2px;width:14px;height:14px;"></div> Menganalisis...`;
    }

    if (!GEMINI_CONFIG.useServerless && (!GEMINI_CONFIG.apiKey || GEMINI_CONFIG.apiKey.trim() === '')) {
        showToast("API Key Gemini belum diisi. Buka file config.js dan isi API Key Anda.");
        if (btn) {
            btn.disabled = false;
            btn.innerHTML = `<i class="fas fa-bolt"></i> Analisis Semua (AI)`;
        }
        return;
    }

    // Process all complaints in parallel
    const promises = mockComplaints.map(comp => analyzeSingle(comp));
    await Promise.all(promises);

    if (btn) {
        btn.innerHTML = `<i class="fas fa-check"></i> Selesai Dianalisis`;
        btn.style.background = 'var(--em600)';
    }
}

async function analyzeSingle(complaint) {
    const systemPrompt = `Anda adalah analis data senior di BPJS Kesehatan (JKN). Tugas Anda membaca teks keluhan dari peserta dan mengekstrak informasi.
Klasifikasikan determinan menjadi: [Ekonomi, Teknis Aplikasi, Gateway Pembayaran, Administratif, Lainnya].
Sentimen: [Positif, Netral, Negatif].
Rekomendasi_aksi berupa tindakan sistem otomatis singkat.`;

    const responseSchema = {
        type: "OBJECT",
        properties: {
            determinan: { type: "STRING" },
            sentimen: { type: "STRING" },
            rekomendasi_aksi: { type: "STRING" }
        },
        required: ["determinan", "sentimen", "rekomendasi_aksi"]
    };

    let payload;
    if (GEMINI_CONFIG.useServerless) {
        payload = { prompt: complaint.text, systemInstruction: systemPrompt, responseSchema: responseSchema };
    } else {
        payload = {
            contents: [{ parts: [{ text: complaint.text }] }],
            systemInstruction: { parts: [{ text: systemPrompt }] },
            generationConfig: { responseMimeType: "application/json", responseSchema: responseSchema }
        };
    }

    const apiUrl = typeof GEMINI_CONFIG.apiUrl === 'function' ? GEMINI_CONFIG.apiUrl() : GEMINI_CONFIG.apiUrl;

    try {
        const response = await fetch(apiUrl, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload)
        });

        if (!response.ok) throw new Error(`HTTP ${response.status}`);
        
        const result = await response.json();
        let resultText = '';
        if (GEMINI_CONFIG.useServerless) {
            resultText = result.text;
        } else {
            resultText = result.candidates[0].content.parts[0].text;
        }

        const data = JSON.parse(resultText);
        analyzedResults[complaint.id] = data;
        updateRowUI(complaint.id, data);
    } catch (error) {
        console.error('LLM Error for ' + complaint.id, error);
        document.getElementById(`status-${complaint.id}`).innerHTML = `<span class="status-badge" style="background:#fee2e2;color:#dc2626;">Error</span>`;
    }
}

function updateRowUI(id, data) {
    const detColor = getDeterminanColor(data.determinan);
    
    document.getElementById(`status-${id}`).innerHTML = `
        <span class="status-badge status-analyzed">Selesai</span><br>
        <strong style="color:${detColor};font-size:0.8rem;">${data.determinan}</strong><br>
        <span style="font-size:0.75rem;color:var(--sl500);">Sentimen: ${data.sentimen}</span>
    `;
    
    document.getElementById(`rec-${id}`).innerHTML = `
        <div style="font-size:0.85rem;color:#065f46;font-weight:600;background:var(--em50);padding:8px;border-radius:6px;border:1px solid var(--em200);">
            ${data.rekomendasi_aksi}
        </div>
    `;

    document.getElementById(`action-${id}`).innerHTML = `
        <button class="btn-execute" id="btn-exec-${id}" onclick="executeAction('${id}')">
            <i class="fas fa-play"></i> Eksekusi
        </button>
    `;
}

function getDeterminanColor(det) {
    det = (det || '').toLowerCase();
    if (det.includes('ekonomi')) return '#dc2626';
    if (det.includes('teknis') || det.includes('aplikasi')) return '#2563eb';
    if (det.includes('gateway')) return '#d97706';
    if (det.includes('administ')) return '#7c3aed';
    return 'var(--sl800)';
}

function executeAction(id) {
    const btn = document.getElementById(`btn-exec-${id}`);
    if (!btn) return;

    btn.disabled = true;
    btn.classList.add('loading');
    btn.innerHTML = `<div class="spinner-small" style="display:inline-block;vertical-align:middle;margin-right:6px;"></div> Proses...`;

    // Simulate execution time
    setTimeout(() => {
        btn.classList.remove('loading');
        btn.classList.add('success');
        btn.innerHTML = `<i class="fas fa-check"></i> Dieksekusi`;
    }, 1500 + Math.random() * 1000);
}

// ===== TOAST NOTIFICATION =====
function showToast(msg) {
    const t = document.getElementById('toast');
    document.getElementById('toast-msg').textContent = msg;
    t.classList.add('show');
    setTimeout(() => t.classList.remove('show'), 3500);
}
