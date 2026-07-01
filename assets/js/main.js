// ============================================================
// Inspire-JKN - Main JavaScript
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

let simulatorHistory = [];
let currentSingleId = null;

function addToHistory(text, data) {
    const id = Date.now() + Math.floor(Math.random() * 1000);
    const item = {
        id: id,
        text: text,
        determinan: data.determinan,
        sentimen: data.sentimen,
        rekomendasi: data.rekomendasi_aksi,
        status: 'pending'
    };
    simulatorHistory.unshift(item); // prepend
    renderHistory();
    return id;
}

function renderHistory() {
    const section = document.getElementById('historySection');
    const tbody = document.getElementById('historyBody');
    if (!section || !tbody) return;
    
    if (simulatorHistory.length === 0) {
        section.style.display = 'none';
        return;
    }
    
    section.style.display = 'block';
    tbody.innerHTML = '';
    
    simulatorHistory.forEach(item => {
        let detColor = 'var(--sl800)';
        const det = (item.determinan || '').toLowerCase();
        if (det.includes('ekonomi')) detColor = '#dc2626';
        else if (det.includes('teknis') || det.includes('aplikasi')) detColor = '#2563eb';
        else if (det.includes('gateway')) detColor = '#d97706';
        else if (det.includes('administ')) detColor = '#7c3aed';

        const s = (item.sentimen || '').toLowerCase();
        const icon = s === 'negatif' ? '😞 ' : s === 'positif' ? '😊 ' : '😐 ';

        let actionHtml = '';
        if (item.status === 'executed') {
            actionHtml = `<span style="display:inline-flex;align-items:center;gap:6px;color:#10b981;font-weight:600;font-size:0.8rem;"><i class="fas fa-check-circle"></i> Dieksekusi</span>`;
        } else {
            actionHtml = `<button class="btn-execute" id="btn-hist-${item.id}" onclick="executeHistoryAction(${item.id}, '${(item.rekomendasi || '').replace(/'/g, "\\'")}')" style="padding:6px 12px;font-size:0.75rem;"><i class="fas fa-play"></i> Eksekusi</button>`;
        }

        const tr = document.createElement('tr');
        tr.innerHTML = `
            <td style="font-size:0.8rem;">${item.text}</td>
            <td><strong style="color:${detColor};font-size:0.8rem;">${item.determinan}</strong></td>
            <td style="font-size:0.8rem;">${icon} ${item.sentimen}</td>
            <td style="font-size:0.8rem;color:#065f46;">${item.rekomendasi}</td>
            <td id="hist-action-${item.id}">${actionHtml}</td>
        `;
        tbody.appendChild(tr);
    });
}

function executeHistoryAction(id, rekomendasi) {
    const btn = document.getElementById(`btn-hist-${id}`);
    if (!btn) return;
    
    btn.disabled = true;
    btn.classList.add('loading');
    btn.innerHTML = `<div class="spinner-small" style="display:inline-block;vertical-align:middle;margin-right:6px;"></div>...`;

    const modal = document.getElementById('execModal');
    const modalBody = document.getElementById('execModalBody');
    if(modal && modalBody) {
        modal.classList.add('show');
        modalBody.innerHTML = '';
        
        const steps = [
            `> Memulai inisialisasi API eksternal...`,
            `> Payload: { action: "${rekomendasi}" }`,
            `> Mengirim instruksi ke backend system...`,
            `<span class="status-warn">> Menunggu konfirmasi dari server (auth_token verified)...</span>`,
            `<span class="status-ok">> [200 OK] Sukses! Tindakan otomatis berhasil diterapkan.</span>`
        ];

        let delay = 0;
        steps.forEach((step, index) => {
            delay += 600 + (Math.random() * 400);
            setTimeout(() => {
                const div = document.createElement('div');
                div.className = 'exec-modal-step';
                div.innerHTML = step;
                modalBody.appendChild(div);
                void div.offsetWidth;
                div.classList.add('show');
                modalBody.scrollTop = modalBody.scrollHeight;

                if (index === steps.length - 1) {
                    const item = simulatorHistory.find(x => x.id === id);
                    if (item) item.status = 'executed';
                    renderHistory();
                    showToast("Tindakan otomatis berhasil dieksekusi!");
                }
            }, delay);
        });
    } else {
        setTimeout(() => {
            const item = simulatorHistory.find(x => x.id === id);
            if (item) item.status = 'executed';
            renderHistory();
            showToast("Tindakan otomatis berhasil dieksekusi!");
        }, 1500 + Math.random() * 1000);
    }
}

// ===== LLM ANALYZE FUNCTION (SINGLE) =====
async function analyzeText() {
    const inputText = document.getElementById('llmInput').value.trim();
    if (!inputText) { showToast("Silakan masukkan teks keluhan terlebih dahulu."); return; }

    if (!GEMINI_CONFIG.useServerless && (!GEMINI_CONFIG.apiKey || GEMINI_CONFIG.apiKey.trim() === '')) {
        showToast("API Key Gemini belum diisi. Buka file config.js dan isi API Key Anda.");
        return;
    }

    // Set loading state
    document.getElementById('resultOverlay').style.display = 'none';
    document.getElementById('btnAnalyze').disabled = true;
    document.getElementById('loadingIndicator').style.display = 'flex';
    document.getElementById('loadingText').textContent = "LLM sedang memproses...";
    document.getElementById('actionBtnContainer').style.display = 'none';
    ['outDeterminan', 'outSentimen', 'outAlasan', 'outRekomendasi'].forEach(id => {
        document.getElementById(id).textContent = '...';
    });

    try {
        const resultText = await callGeminiAPI(inputText);
        const data = JSON.parse(resultText);
        updateResultUI(data);
        currentSingleId = addToHistory(inputText, data);
    } catch (error) {
        console.error('LLM Error:', error);
        showToast("Error: " + error.message);
        document.getElementById('resultOverlay').style.display = 'flex';
    } finally {
        document.getElementById('btnAnalyze').disabled = false;
        document.getElementById('loadingIndicator').style.display = 'none';
    }
}

// ===== CALL GEMINI API =====
async function callGeminiAPI(text) {
    const systemPrompt = `Anda adalah analis data senior di BPJS Kesehatan (JKN). Tugas Anda membaca teks keluhan dari peserta dan mengekstrak informasi spesifik.
Klasifikasikan determinan penunggakan menjadi: [Ekonomi, Teknis Aplikasi, Gateway Pembayaran, Administratif, Lainnya].
Sentimen: [Positif, Netral, Negatif].
Tuliskan alasan_tersembunyi secara ringkas (maks 2 kalimat).
Tuliskan rekomendasi_aksi berupa tindakan sistem otomatis yang spesifik.`;

    const responseSchema = {
        type: "OBJECT",
        properties: {
            determinan: { type: "STRING" },
            sentimen: { type: "STRING" },
            alasan_tersembunyi: { type: "STRING" },
            rekomendasi_aksi: { type: "STRING" }
        },
        required: ["determinan", "sentimen", "alasan_tersembunyi", "rekomendasi_aksi"]
    };

    let payload = GEMINI_CONFIG.useServerless 
        ? { prompt: text, systemInstruction: systemPrompt, responseSchema: responseSchema }
        : {
            contents: [{ parts: [{ text: text }] }],
            systemInstruction: { parts: [{ text: systemPrompt }] },
            generationConfig: { responseMimeType: "application/json", responseSchema: responseSchema }
          };

    const apiUrl = typeof GEMINI_CONFIG.apiUrl === 'function' ? GEMINI_CONFIG.apiUrl() : GEMINI_CONFIG.apiUrl;
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
    if (GEMINI_CONFIG.useServerless) return result.text;
    return result.candidates[0].content.parts[0].text;
}

// ===== UPDATE RESULT UI (SINGLE) =====
function updateResultUI(data) {
    const det = (data.determinan || '').toLowerCase();
    let detColor = 'var(--sl800)';
    if (det.includes('ekonomi')) detColor = '#dc2626';
    else if (det.includes('teknis') || det.includes('aplikasi')) detColor = '#2563eb';
    else if (det.includes('gateway')) detColor = '#d97706';
    else if (det.includes('administ')) detColor = '#7c3aed';

    document.getElementById('outDeterminan').style.color = detColor;
    document.getElementById('outDeterminan').textContent = data.determinan;

    const s = (data.sentimen || '').toLowerCase();
    const icon = s === 'negatif' ? '😞 ' : s === 'positif' ? '😊 ' : '😐 ';
    document.getElementById('outSentimen').textContent = icon + data.sentimen;
    document.getElementById('outAlasan').textContent = '"' + data.alasan_tersembunyi + '"';
    document.getElementById('outRekomendasi').textContent = data.rekomendasi_aksi;
    
    // Reset and show action button
    const btn = document.getElementById('btn-exec-single');
    if (btn) {
        btn.disabled = false;
        btn.classList.remove('loading', 'success');
        btn.innerHTML = `<i class="fas fa-play"></i> Eksekusi Rekomendasi`;
    }
    document.getElementById('actionBtnContainer').style.display = 'block';
}

function executeActionSingle() {
    const btn = document.getElementById('btn-exec-single');
    if (!btn) return;

    btn.disabled = true;
    btn.classList.add('loading');
    btn.innerHTML = `<div class="spinner-small" style="display:inline-block;vertical-align:middle;margin-right:6px;"></div> Proses...`;

    const rekomendasi = document.getElementById('outRekomendasi').textContent;

    // Tampilkan Modal Eksekusi
    const modal = document.getElementById('execModal');
    const modalBody = document.getElementById('execModalBody');
    if(modal && modalBody) {
        modal.classList.add('show');
        modalBody.innerHTML = '';
        
        const steps = [
            `> Memulai inisialisasi API eksternal...`,
            `> Payload: { action: "${rekomendasi}" }`,
            `> Mengirim instruksi ke backend system...`,
            `<span class="status-warn">> Menunggu konfirmasi dari server (auth_token verified)...</span>`,
            `<span class="status-ok">> [200 OK] Sukses! Tindakan otomatis berhasil diterapkan.</span>`
        ];

        let delay = 0;
        steps.forEach((step, index) => {
            delay += 600 + (Math.random() * 400); // randomize timing
            setTimeout(() => {
                const div = document.createElement('div');
                div.className = 'exec-modal-step';
                div.innerHTML = step;
                modalBody.appendChild(div);
                
                // Trigger reflow for animation
                void div.offsetWidth;
                div.classList.add('show');
                
                // Scroll ke paling bawah
                modalBody.scrollTop = modalBody.scrollHeight;

                if (index === steps.length - 1) {
                    // Update button on success
                    btn.classList.remove('loading');
                    btn.classList.add('success');
                    btn.innerHTML = `<i class="fas fa-check"></i> Dieksekusi`;
                    
                    if (currentSingleId) {
                        const item = simulatorHistory.find(x => x.id === currentSingleId);
                        if (item) item.status = 'executed';
                        renderHistory();
                    }
                    showToast("Tindakan otomatis berhasil dieksekusi!");
                }
            }, delay);
        });
    } else {
        // Fallback jika modal tidak ada
        setTimeout(() => {
            btn.classList.remove('loading');
            btn.classList.add('success');
            btn.innerHTML = `<i class="fas fa-check"></i> Dieksekusi`;
            
            if (currentSingleId) {
                const item = simulatorHistory.find(x => x.id === currentSingleId);
                if (item) item.status = 'executed';
                renderHistory();
            }
            showToast("Tindakan otomatis berhasil dieksekusi!");
        }, 1500 + Math.random() * 1000);
    }
}

function closeExecModal() {
    const modal = document.getElementById('execModal');
    if(modal) {
        modal.classList.remove('show');
    }
}

// ===== CSV BATCH PROCESSING =====
function handleFileUpload(event) {
    const file = event.target.files[0];
    if (!file) return;

    if (!GEMINI_CONFIG.useServerless && (!GEMINI_CONFIG.apiKey || GEMINI_CONFIG.apiKey.trim() === '')) {
        showToast("API Key Gemini belum diisi. Buka file config.js dan isi API Key Anda.");
        event.target.value = '';
        return;
    }

    const reader = new FileReader();
    reader.onload = async (e) => {
        const text = e.target.result;
        await processCSV(text);
        event.target.value = ''; // reset file input
    };
    reader.readAsText(file);
}

async function processCSV(csvText) {
    // Simple CSV parser
    const lines = csvText.split('\n').map(line => line.trim()).filter(line => line.length > 0);
    if (lines.length === 0) {
        showToast("CSV kosong atau tidak valid.");
        return;
    }

    // Skip header if it exists
    let dataLines = lines;
    if (lines[0].toLowerCase().includes('text') || lines[0].toLowerCase().includes('keluhan')) {
        dataLines = lines.slice(1);
    }

    if (dataLines.length === 0) {
        showToast("Tidak ada data keluhan yang ditemukan di CSV.");
        return;
    }

    document.getElementById('loadingIndicator').style.display = 'flex';
    document.getElementById('btnAnalyze').disabled = true;
    
    let resultsCSV = "Teks Keluhan,Determinan,Sentimen,Alasan Tersembunyi,Rekomendasi Aksi\n";
    
    for (let i = 0; i < dataLines.length; i++) {
        document.getElementById('loadingText').textContent = `Memproses data ${i+1} dari ${dataLines.length}...`;
        
        let text = dataLines[i];
        if (text.startsWith('"') && text.endsWith('"')) text = text.substring(1, text.length - 1);
        
        try {
            const resultText = await callGeminiAPI(text);
            const data = JSON.parse(resultText);
            
            addToHistory(text, data);
            
            const escapeCSV = (str) => '"' + (str || '').replace(/"/g, '""') + '"';
            resultsCSV += `${escapeCSV(text)},${escapeCSV(data.determinan)},${escapeCSV(data.sentimen)},${escapeCSV(data.alasan_tersembunyi)},${escapeCSV(data.rekomendasi_aksi)}\n`;
        } catch (error) {
            console.error(`Error processing line ${i+1}:`, error);
            resultsCSV += `"${text}","ERROR","ERROR","ERROR","ERROR"\n`;
        }
    }

    // Trigger Download
    const blob = new Blob([resultsCSV], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", "hasil_analisis_jkn.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    document.getElementById('loadingIndicator').style.display = 'none';
    document.getElementById('btnAnalyze').disabled = false;
    showToast(`Batch analisis selesai! File hasil_analisis_jkn.csv telah diunduh.`);
}

// ===== TOAST NOTIFICATION =====
function showToast(msg) {
    const t = document.getElementById('toast');
    document.getElementById('toast-msg').textContent = msg;
    t.classList.add('show');
    setTimeout(() => t.classList.remove('show'), 3500);
}
