// Konfigurasi awal sistem antrian
let queueSystem = {
    currentQueue: "A001",
    nextQueue: "A002",
    currentOperator: "OPERATOR 1",
    nextOperator: "OPERATOR 1",
    selectedOperator: "OPERATOR 1",
    queuePrefix: "A",
    queueNumber: 1,
    lastCalls: [],
    operators: [
        "OPERATOR 1", "OPERATOR 2", "OPERATOR 3", "OPERATOR 4",
        "OPERATOR 5", "OPERATOR 6", "OPERATOR 7", "OPERATOR 8"
    ],
    speechSynthesis: window.speechSynthesis,
    speechEnabled: true
};

// Inisialisasi saat halaman dimuat
document.addEventListener('DOMContentLoaded', function() {
    console.log("DOM Loaded - Initializing System");
    initDateTime();
    initOperators();
    initEventListeners();
    updateDisplay();
    updateCallPreview();
    updateLastCallsDisplay();
    checkSpeechSupport();
    
    // Load data dari localStorage jika ada
    loadFromLocalStorage();
});

// Fungsi untuk menginisialisasi tanggal dan waktu
function initDateTime() {
    updateDateTime();
    setInterval(updateDateTime, 1000);
}

function updateDateTime() {
    const now = new Date();
    const dateElement = document.getElementById('date');
    const timeElement = document.getElementById('time');
    
    const optionsDate = { 
        weekday: 'long', 
        year: 'numeric', 
        month: 'long', 
        day: 'numeric' 
    };
    
    const dateString = now.toLocaleDateString('id-ID', optionsDate);
    const timeString = now.toLocaleTimeString('id-ID');
    
    dateElement.textContent = dateString;
    timeElement.textContent = timeString;
}

// Fungsi untuk menginisialisasi operator (DIPERBAIKI)
function initOperators() {
    const operatorGrid = document.getElementById('operatorGrid');
    operatorGrid.innerHTML = '';
    
    console.log("Initializing operators:", queueSystem.operators);
    
    queueSystem.operators.forEach(operator => {
        const button = document.createElement('button');
        button.className = `operator-btn ${operator === queueSystem.selectedOperator ? 'active' : ''}`;
        button.textContent = operator;
        button.dataset.operator = operator;
        
        button.addEventListener('click', function() {
            console.log("Operator clicked:", this.dataset.operator);
            document.querySelectorAll('.operator-btn').forEach(btn => btn.classList.remove('active'));
            this.classList.add('active');
            queueSystem.selectedOperator = this.dataset.operator;
            updateCallPreview();
            saveToLocalStorage();
            showNotification(`Operator diubah ke: ${queueSystem.selectedOperator}`);
        });
        
        operatorGrid.appendChild(button);
    });
    
    console.log("Operators initialized");
}

// Fungsi untuk menginisialisasi event listener (DIPERBAIKI)
function initEventListeners() {
    console.log("Initializing event listeners");
    
    // Tombol set antrian
    const setQueueBtn = document.getElementById('setQueueBtn');
    if (setQueueBtn) {
        setQueueBtn.addEventListener('click', setQueue);
        console.log("Set Queue button listener added");
    }
    
    // Input nomor antrian - enter key support
    const queueNumberInput = document.getElementById('queueNumber');
    if (queueNumberInput) {
        queueNumberInput.addEventListener('keyup', function(e) {
            if (e.key === 'Enter') setQueue();
        });
        console.log("Queue number input listener added");
    }
    
    // Tombol panggil antrian
    const callQueueBtn = document.getElementById('callQueueBtn');
    if (callQueueBtn) {
        callQueueBtn.addEventListener('click', callQueue);
        console.log("Call Queue button listener added");
    }
    
    // Tombol test suara
    const testVoiceBtn = document.getElementById('testVoiceBtn');
    if (testVoiceBtn) {
        testVoiceBtn.addEventListener('click', testVoice);
        console.log("Test Voice button listener added");
    }
    
    // Tombol reset antrian
    const resetQueueBtn = document.getElementById('resetQueueBtn');
    if (resetQueueBtn) {
        resetQueueBtn.addEventListener('click', resetQueue);
        console.log("Reset Queue button listener added");
    }
    
    // Tombol lewati antrian
    const skipQueueBtn = document.getElementById('skipQueueBtn');
    if (skipQueueBtn) {
        skipQueueBtn.addEventListener('click', skipQueue);
        console.log("Skip Queue button listener added");
    }
    
    // Kontrol volume
    const volumeControl = document.getElementById('volumeControl');
    if (volumeControl) {
        volumeControl.addEventListener('input', function() {
            queueSystem.volume = parseFloat(this.value);
            saveToLocalStorage();
        });
        console.log("Volume control listener added");
    }
    
    // Prefix antrian change
    const queuePrefixSelect = document.getElementById('queuePrefix');
    if (queuePrefixSelect) {
        queuePrefixSelect.addEventListener('change', function() {
            queueSystem.queuePrefix = this.value;
            updateCallPreview();
            saveToLocalStorage();
        });
        console.log("Queue prefix listener added");
    }
    
    // Nomor antrian change
    const queueNumberInputChange = document.getElementById('queueNumber');
    if (queueNumberInputChange) {
        queueNumberInputChange.addEventListener('change', function() {
            queueSystem.queueNumber = parseInt(this.value) || 1;
            updateCallPreview();
            saveToLocalStorage();
        });
        console.log("Queue number change listener added");
    }
    
    console.log("All event listeners initialized");
}

// Fungsi untuk mengatur antrian
function setQueue() {
    console.log("Setting queue...");
    const prefix = document.getElementById('queuePrefix').value;
    const number = parseInt(document.getElementById('queueNumber').value) || 1;
    
    if (number < 1 || number > 999) {
        showNotification("Nomor antrian harus antara 1 dan 999", "error");
        return;
    }
    
    queueSystem.queuePrefix = prefix;
    queueSystem.queueNumber = number;
    
    // Format nomor antrian dengan leading zeros
    const formattedNumber = number.toString().padStart(3, '0');
    queueSystem.currentQueue = `${prefix}${formattedNumber}`;
    
    // Hitung antrian berikutnya
    const nextNumber = number + 1;
    const nextFormattedNumber = nextNumber.toString().padStart(3, '0');
    queueSystem.nextQueue = `${prefix}${nextFormattedNumber}`;
    
    updateDisplay();
    updateCallPreview();
    saveToLocalStorage();
    
    showNotification(`Antrian diatur ke: ${queueSystem.currentQueue}`);
    console.log("Queue set to:", queueSystem.currentQueue);
}

// Fungsi untuk memanggil antrian
function callQueue() {
    console.log("Calling queue...");
    // Update antrian saat ini
    queueSystem.currentQueue = `${queueSystem.queuePrefix}${queueSystem.queueNumber.toString().padStart(3, '0')}`;
    queueSystem.currentOperator = queueSystem.selectedOperator;
    
    // Tambahkan ke riwayat panggilan
    const now = new Date();
    const timeString = now.toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' });
    
    queueSystem.lastCalls.unshift({
        queue: queueSystem.currentQueue,
        operator: queueSystem.currentOperator,
        time: timeString
    });
    
    // Batasi riwayat panggilan ke 5 item terakhir
    if (queueSystem.lastCalls.length > 5) {
        queueSystem.lastCalls = queueSystem.lastCalls.slice(0, 5);
    }
    
    // Update antrian berikutnya
    queueSystem.queueNumber += 1;
    const nextFormattedNumber = queueSystem.queueNumber.toString().padStart(3, '0');
    queueSystem.nextQueue = `${queueSystem.queuePrefix}${nextFormattedNumber}`;
    queueSystem.nextOperator = queueSystem.selectedOperator;
    
    // Update tampilan
    updateDisplay();
    updateCallPreview();
    updateLastCallsDisplay();
    
    // Simpan ke localStorage
    saveToLocalStorage();
    
    // Panggil suara
    speakQueue();
    
    // Tampilkan notifikasi
    showNotification(`Memanggil antrian: ${queueSystem.currentQueue} ke ${queueSystem.currentOperator}`);
    
    // Update input nomor antrian
    document.getElementById('queueNumber').value = queueSystem.queueNumber;
    console.log("Queue called:", queueSystem.currentQueue);
}

// Fungsi untuk memanggil suara
function speakQueue() {
    console.log("Speaking queue...");
    if (!queueSystem.speechEnabled) {
        console.warn("Web Speech API tidak didukung di browser ini.");
        showNotification("Browser tidak mendukung fitur suara", "warning");
        return;
    }
    
    // Hentikan suara yang sedang berbicara
    if (queueSystem.speechSynthesis.speaking) {
        queueSystem.speechSynthesis.cancel();
    }
    
    // Buat teks untuk diucapkan
    const textToSpeak = `Nomor antrian ${queueSystem.currentQueue.split('').join(' ')}, silakan menuju ke ${queueSystem.currentOperator}`;
    
    // Buat utterance
    const utterance = new SpeechSynthesisUtterance(textToSpeak);
    utterance.lang = 'id-ID';
    utterance.rate = 0.9; // Kecepatan bicara
    utterance.pitch = 1; // Nada suara
    utterance.volume = document.getElementById('volumeControl').value || 0.7;
    
    // Tunggu voices siap
    if (speechSynthesis.getVoices().length === 0) {
        speechSynthesis.addEventListener('voiceschanged', function() {
            setVoiceAndSpeak(utterance);
        });
    } else {
        setVoiceAndSpeak(utterance);
    }
    
    // Event saat selesai berbicara
    utterance.onend = function() {
        console.log("Panggilan antrian selesai");
    };
    
    // Event jika terjadi error
    utterance.onerror = function(event) {
        console.error("Error dalam memanggil suara:", event);
        showNotification("Gagal memanggil antrian dengan suara", "error");
    };
}

function setVoiceAndSpeak(utterance) {
    // Pilih suara wanita jika tersedia
    const voices = speechSynthesis.getVoices();
    console.log("Available voices:", voices.length);
    
    const femaleVoice = voices.find(voice => 
        voice.lang.includes('id') && voice.name.toLowerCase().includes('female')
    ) || voices.find(voice => voice.lang.includes('id')) || voices[0];
    
    if (femaleVoice) {
        utterance.voice = femaleVoice;
        console.log("Using voice:", femaleVoice.name);
    }
    
    // Mulai berbicara
    queueSystem.speechSynthesis.speak(utterance);
}

// Fungsi untuk menguji suara
function testVoice() {
    console.log("Testing voice...");
    if (!queueSystem.speechEnabled) {
        showNotification("Browser tidak mendukung fitur suara", "warning");
        return;
    }
    
    const testText = "Ini adalah uji suara dari sistem antrian SPMB SMA Neo 23";
    const utterance = new SpeechSynthesisUtterance(testText);
    utterance.lang = 'id-ID';
    utterance.volume = document.getElementById('volumeControl').value || 0.7;
    
    // Hentikan suara yang sedang berbicara
    if (queueSystem.speechSynthesis.speaking) {
        queueSystem.speechSynthesis.cancel();
    }
    
    queueSystem.speechSynthesis.speak(utterance);
    showNotification("Menguji suara...");
}

// Fungsi untuk melewati antrian
function skipQueue() {
    console.log("Skipping queue...");
    queueSystem.queueNumber += 1;
    const formattedNumber = queueSystem.queueNumber.toString().padStart(3, '0');
    queueSystem.nextQueue = `${queueSystem.queuePrefix}${formattedNumber}`;
    
    updateCallPreview();
    document.getElementById('queueNumber').value = queueSystem.queueNumber;
    saveToLocalStorage();
    
    showNotification(`Antrian dilewati. Antrian berikutnya: ${queueSystem.nextQueue}`);
}

// Fungsi untuk mereset antrian
function resetQueue() {
    console.log("Resetting queue...");
    if (confirm("Apakah Anda yakin ingin mereset antrian? Semua data akan dikembalikan ke awal.")) {
        queueSystem.currentQueue = "A001";
        queueSystem.nextQueue = "A002";
        queueSystem.currentOperator = "OPERATOR 1";
        queueSystem.nextOperator = "OPERATOR 1";
        queueSystem.selectedOperator = "OPERATOR 1";
        queueSystem.queuePrefix = "A";
        queueSystem.queueNumber = 1;
        queueSystem.lastCalls = [];
        
        // Reset UI
        document.getElementById('queuePrefix').value = "A";
        document.getElementById('queueNumber').value = 1;
        document.getElementById('volumeControl').value = 0.7;
        
        // Reset operator buttons
        document.querySelectorAll('.operator-btn').forEach(btn => btn.classList.remove('active'));
        document.querySelector('.operator-btn[data-operator="OPERATOR 1"]').classList.add('active');
        
        updateDisplay();
        updateCallPreview();
        updateLastCallsDisplay();
        saveToLocalStorage();
        
        showNotification("Sistem antrian telah direset ke awal");
    }
}

// Fungsi untuk memperbarui tampilan
function updateDisplay() {
    console.log("Updating display...");
    document.getElementById('currentQueue').textContent = queueSystem.currentQueue;
    document.getElementById('currentOperator').textContent = queueSystem.currentOperator;
    document.getElementById('nextQueue').textContent = queueSystem.nextQueue;
    document.getElementById('nextOperator').textContent = queueSystem.nextOperator;
}

// Fungsi untuk memperbarui preview panggilan
function updateCallPreview() {
    console.log("Updating call preview...");
    const formattedNumber = queueSystem.queueNumber.toString().padStart(3, '0');
    const nextQueue = `${queueSystem.queuePrefix}${formattedNumber}`;
    
    document.getElementById('callPreview').textContent = nextQueue;
    document.getElementById('operatorPreview').textContent = queueSystem.selectedOperator;
}

// Fungsi untuk memperbarui tampilan panggilan terakhir
function updateLastCallsDisplay() {
    console.log("Updating last calls display...");
    const lastCallList = document.getElementById('lastCallList');
    lastCallList.innerHTML = '';
    
    if (queueSystem.lastCalls.length === 0) {
        lastCallList.innerHTML = '<div class="call-item empty">Belum ada panggilan</div>';
        return;
    }
    
    queueSystem.lastCalls.forEach(call => {
        const callItem = document.createElement('div');
        callItem.className = 'call-item';
        callItem.innerHTML = `
            <div>
                <div class="call-number">${call.queue}</div>
                <div class="call-operator">${call.operator}</div>
            </div>
            <div class="call-time">${call.time}</div>
        `;
        lastCallList.appendChild(callItem);
    });
}

// Fungsi untuk menampilkan notifikasi
function showNotification(message, type = "success") {
    console.log("Showing notification:", message);
    const notification = document.getElementById('notification');
    const notificationText = document.getElementById('notificationText');
    
    // Set warna berdasarkan tipe
    if (type === "error") {
        notification.style.backgroundColor = "rgba(255, 100, 100, 0.95)";
        notification.querySelector('i').className = "fas fa-exclamation-circle";
    } else if (type === "warning") {
        notification.style.backgroundColor = "rgba(255, 200, 0, 0.95)";
        notification.querySelector('i').className = "fas fa-exclamation-triangle";
    } else {
        notification.style.backgroundColor = "rgba(0, 255, 157, 0.95)";
        notification.querySelector('i').className = "fas fa-check-circle";
    }
    
    notificationText.textContent = message;
    notification.classList.add('show');
    
    // Sembunyikan notifikasi setelah 3 detik
    setTimeout(() => {
        notification.classList.remove('show');
    }, 3000);
}

// Fungsi untuk memeriksa dukungan Web Speech API
function checkSpeechSupport() {
    if ('speechSynthesis' in window) {
        queueSystem.speechEnabled = true;
        console.log("Web Speech API supported");
    } else {
        queueSystem.speechEnabled = false;
        console.warn("Web Speech API not supported");
        showNotification("Browser tidak mendukung fitur suara. Gunakan Chrome atau Edge untuk fitur lengkap.", "warning");
    }
}

// Fungsi untuk menyimpan ke localStorage
function saveToLocalStorage() {
    try {
        localStorage.setItem('queueSystem', JSON.stringify(queueSystem));
        console.log("Data saved to localStorage");
    } catch (error) {
        console.error("Error saving to localStorage:", error);
    }
}

// Fungsi untuk memuat dari localStorage
function loadFromLocalStorage() {
    try {
        const savedData = localStorage.getItem('queueSystem');
        if (savedData) {
            const parsedData = JSON.parse(savedData);
            Object.assign(queueSystem, parsedData);
            
            // Update UI dengan data yang dimuat
            document.getElementById('queuePrefix').value = queueSystem.queuePrefix;
            document.getElementById('queueNumber').value = queueSystem.queueNumber;
            
            // Update operator buttons
            document.querySelectorAll('.operator-btn').forEach(btn => {
                btn.classList.remove('active');
                if (btn.dataset.operator === queueSystem.selectedOperator) {
                    btn.classList.add('active');
                }
            });
            
            updateDisplay();
            updateCallPreview();
            updateLastCallsDisplay();
            
            console.log("Data loaded from localStorage");
            showNotification("Data antrian berhasil dimuat", "success");
        }
    } catch (error) {
        console.error("Error loading from localStorage:", error);
    }
}

// Inisialisasi voices untuk Web Speech API
if ('speechSynthesis' in window) {
    speechSynthesis.getVoices(); // Memicu loading voices
}