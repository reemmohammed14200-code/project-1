// Global variables
let currentUser = null;
let map = null;
let currentStream = null;
let storedFaces = {};
let loginPhoto = null;
let registrationPhoto = null;

// Initialize the application
document.addEventListener('DOMContentLoaded', function() {
    setTimeout(() => {
        initializeApp();
    }, 1000);

    loadStoredData();
    setupEventListeners();
});

// Initialize face-api.js
async function initializeApp() {
    try {
        if (typeof faceapi === 'undefined') {
            console.error('Face API not loaded.');
            showMessage('Face detection library not found.', 'error');
            return;
        }

        await faceapi.nets.tinyFaceDetector.loadFromUri('/models');
        await faceapi.nets.faceLandmark68Net.loadFromUri('/models');
        await faceapi.nets.faceRecognitionNet.loadFromUri('/models');
        console.log('✅ Face API models loaded');
    } catch (error) {
        console.error('Error loading models:', error);
        showMessage('Error loading models.', 'error');
    }
}

// Load stored data from localStorage
function loadStoredData() {
    try {
        const storedUsers = localStorage.getItem('truckDrivers');
        if (storedUsers) storedFaces = JSON.parse(storedUsers);
    } catch (error) {
        console.error('Error loading stored data:', error);
    }
}

// Setup event listeners
function setupEventListeners() {
    document.getElementById('register-form').addEventListener('submit', handleRegistration);
    document.getElementById('login-form').addEventListener('submit', handleLogin);
    document.getElementById('permit-form').addEventListener('submit', handlePermitRequest);
    document.getElementById('permit-date').min = new Date().toISOString().split('T')[0];
}

// Face verification
async function verifyFace() {
    const statusElement = document.getElementById('verification-status');
    const nationalId = document.getElementById('login-national-id').value;

    if (!statusElement) return;
    if (!nationalId) {
        showMessage('Enter National ID.', 'error');
        return;
    }

    const currentPhoto = loginPhoto || window.loginPhoto;
    if (!currentPhoto) {
        showMessage('Capture a photo first.', 'error');
        return;
    }

    if (!storedFaces[nationalId]) {
        statusElement.innerHTML = '✗ User not found';
        statusElement.className = 'verification-status error';
        return;
    }

    try {
        statusElement.innerHTML = '<span class="loading"></span> Verifying...';
        statusElement.className = 'verification-status processing';

        const storedImg = new Image();
        storedImg.src = storedFaces[nationalId].photo;

        const currentImg = new Image();
        currentImg.src = currentPhoto;

        await Promise.all([
            new Promise((res) => storedImg.onload = () => res()),
            new Promise((res) => currentImg.onload = () => res())
        ]);

        const storedDetection = await faceapi
            .detectSingleFace(storedImg, new faceapi.TinyFaceDetectorOptions())
            .withFaceLandmarks();

        const currentDetection = await faceapi
            .detectSingleFace(currentImg, new faceapi.TinyFaceDetectorOptions())
            .withFaceLandmarks();

        if (!storedDetection || !currentDetection) {
            statusElement.innerHTML = '✗ No face detected.';
            statusElement.className = 'verification-status error';
            return;
        }

        const similarity = calculateFaceSimilarity(storedDetection, currentDetection);
        console.log('Similarity score:', similarity);

        if (similarity > 0.4) {
            statusElement.innerHTML = '✓ Verified!';
            statusElement.className = 'verification-status success';
            window.faceVerified = true;
        } else {
            statusElement.innerHTML = '✗ Verification failed.';
            statusElement.className = 'verification-status error';
            window.faceVerified = false;
        }
    } catch (error) {
        console.error('Verification error:', error);
        statusElement.innerHTML = '✗ Verification error.';
        statusElement.className = 'verification-status error';
    }
}

// Calculate face similarity
function calculateFaceSimilarity(d1, d2) {
    const l1 = d1.landmarks.positions;
    const l2 = d2.landmarks.positions;
    const n = Math.min(l1.length, l2.length);
    let total = 0;
    for (let i = 0; i < n; i++) {
        const dx = l1[i].x - l2[i].x;
        const dy = l1[i].y - l2[i].y;
        total += Math.sqrt(dx * dx + dy * dy);
    }
    return Math.max(0, 1 - (total / n / 100));
}

// Capture photo
async function capturePhoto(type) {
    const video = document.getElementById(`${type}-video`);
    const canvas = document.getElementById(`${type}-canvas`);
    const preview = document.getElementById(`${type}-photo-preview`);
    if (!video || !canvas || !preview) return;
    if (!currentStream) return;

    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    const ctx = canvas.getContext('2d');
    ctx.drawImage(video, 0, 0);

    const photoData = canvas.toDataURL('image/jpeg', 0.8);
    preview.innerHTML = `<img src="${photoData}" alt="Captured photo">`;

    if (type === 'reg') registrationPhoto = photoData;
    else if (type === 'login') loginPhoto = photoData;

    showMessage('Photo captured!', 'success');
}

// Start camera
async function startCamera(type) {
    stopCamera();
    const video = document.getElementById(`${type}-video`);
    const stream = await navigator.mediaDevices.getUserMedia({ video: true });
    video.srcObject = stream;
    currentStream = stream;
    video.style.display = 'block';
    await new Promise((res) => video.onloadedmetadata = () => { video.play(); res(); });
}

// Stop camera
function stopCamera() {
    if (currentStream) {
        currentStream.getTracks().forEach(track => track.stop());
        currentStream = null;
    }
    document.querySelectorAll('video').forEach(v => v.style.display = 'none');
}

// Registration
async function handleRegistration(e) {
    e.preventDefault();
    const userData = {
        name: document.getElementById('reg-name').value,
        nationalId: document.getElementById('reg-national-id').value,
        truckNumber: document.getElementById('reg-truck-number').value,
        cargoType: document.getElementById('reg-cargo-type').value,
        photo: registrationPhoto
    };

    if (!userData.photo) {
        showMessage('Capture a photo before registering.', 'error');
        return;
    }

    storedFaces[userData.nationalId] = userData;
    localStorage.setItem('truckDrivers', JSON.stringify(storedFaces));
    showMessage('Registration successful!', 'success');
    e.target.reset();
    document.getElementById('reg-photo-preview').innerHTML = '';
    showScreen('login-screen');
}

// Login
async function handleLogin(e) {
    e.preventDefault();
    const nationalId = document.getElementById('login-national-id').value;

    if (!window.faceVerified) {
        showMessage('Verify face first.', 'error');
        return;
    }

    if (!storedFaces[nationalId]) {
        showMessage('User not found.', 'error');
        return;
    }

    currentUser = storedFaces[nationalId];
    updateDashboard();
    showScreen('dashboard-screen');
    e.target.reset();
    loginPhoto = null;
    window.faceVerified = false;
}

// Dashboard update
function updateDashboard() {
    if (!currentUser) return;
    document.getElementById('driver-photo').src = currentUser.photo;
    document.getElementById('driver-name').textContent = currentUser.name;
    document.getElementById('driver-national-id').textContent = `ID: ${currentUser.nationalId}`;
    document.getElementById('driver-truck-number').textContent = `Truck: ${currentUser.truckNumber}`;
    document.getElementById('driver-cargo-type').textContent = `Cargo: ${currentUser.cargoType}`;
}

// Permit request
function handlePermitRequest(e) {
    e.preventDefault();
    const permitData = {
        id: Date.now().toString(),
        date: document.getElementById('permit-date').value,
        timeSlot: document.getElementById('permit-time').value,
        route: document.getElementById('permit-route').value,
        purpose: document.getElementById('permit-purpose').value,
        status: 'pending',
        driverId: currentUser.nationalId,
        driverName: currentUser.name,
        timestamp: new Date().toISOString()
    };

    const permits = JSON.parse(localStorage.getItem('permits') || '[]');
    permits.push(permitData);
    localStorage.setItem('permits', JSON.stringify(permits));

    showMessage('Permit request submitted!', 'success');
    e.target.reset();
    showScreen('map-screen');
}

// Show messages
function showMessage(message, type = 'success') {
    const existing = document.querySelectorAll('.message');
    existing.forEach(el => el.remove());

    const el = document.createElement('div');
    el.className = `message ${type}`;
    el.textContent = message;

    const screen = document.querySelector('.screen.active');
    screen.insertBefore(el, screen.firstChild);

    setTimeout(() => {
        if (el.parentNode) el.remove();
    }, 5000);
}

// Switch screens
function showScreen(id) {
    document.querySelectorAll('.screen').forEach(s => s.classList.remove('active'));
    document.getElementById(id).classList.add('active');
    stopCamera();
}

localStorage.clear(); // يحذف كل البيانات السابقة عند تحميل الصفحة
