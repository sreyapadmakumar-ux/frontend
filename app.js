const BACKEND_URL = 'http://127.0.0.1:3000';
const CURRENCY_SYMBOL = '₹';
const USD_TO_INR = 83;
function toINR(usd) { return Math.round(usd * USD_TO_INR).toLocaleString('en-IN'); }
function formatPrice(usd) { return CURRENCY_SYMBOL + toINR(usd); }

let currentView = 'home';
let selectedFile = null;
let chatOpen = false;
let isLoggedIn = false;

document.addEventListener('DOMContentLoaded', () => {
    initParticles();
    initCursorGlow();
    initScrollHeader();
    initCounters();
    initUploadZone();
    initFilters();
    loadMarketplace();
    loadFeatured();
    animateEcoMetrics();
    initScrollAnimations();
});

// Cursor Glow
function initCursorGlow() {
    const glow = document.getElementById('cursor-glow');
    document.addEventListener('mousemove', e => {
        glow.style.left = e.clientX + 'px';
        glow.style.top = e.clientY + 'px';
    });
}

// Particles
function initParticles() {
    const container = document.getElementById('particles');
    for (let i = 0; i < 40; i++) {
        const p = document.createElement('div');
        p.className = 'particle';
        p.style.left = Math.random() * 100 + '%';
        p.style.animationDuration = (Math.random() * 20 + 15) + 's';
        p.style.animationDelay = Math.random() * 20 + 's';
        const size = (Math.random() * 4 + 2) + 'px';
        p.style.width = size;
        p.style.height = size;
        const colors = ['#00d4aa', '#6c5ce7', '#fd79a8', '#55efc4'];
        p.style.background = colors[Math.floor(Math.random() * colors.length)];
        container.appendChild(p);
    }
}

// Scroll Header
function initScrollHeader() {
    const header = document.getElementById('header');
    window.addEventListener('scroll', () => {
        header.classList.toggle('scrolled', window.scrollY > 50);
    });
}

// Scroll Animations
function initScrollAnimations() {
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('animate-in');
            }
        });
    }, { threshold: 0.1 });

    document.querySelectorAll('.step-card, .featured-card, .testimonial-card, .eco-metric').forEach(el => {
        observer.observe(el);
    });
}

// Counters
function initCounters() {
    const counters = document.querySelectorAll('.stat-number[data-count]');
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                animateCounter(entry.target);
                observer.unobserve(entry.target);
            }
        });
    }, { threshold: 0.5 });
    counters.forEach(c => observer.observe(c));
}

function animateCounter(el) {
    const target = parseInt(el.dataset.count);
    const duration = 2000;
    const start = performance.now();
    function update(now) {
        const progress = Math.min((now - start) / duration, 1);
        const eased = 1 - Math.pow(1 - progress, 3);
        el.textContent = Math.floor(eased * target).toLocaleString();
        if (progress < 1) requestAnimationFrame(update);
        else el.textContent = target.toLocaleString();
    }
    requestAnimationFrame(update);
}

function animateEcoMetrics() {
    const fills = document.querySelectorAll('.metric-fill');
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const circle = entry.target;
                const percent = parseInt(circle.dataset.percent) || 0;
                const circumference = 2 * Math.PI * 45;
                circle.style.strokeDashoffset = circumference - (circumference * percent / 100);
                observer.unobserve(circle);
            }
        });
    }, { threshold: 0.5 });
    fills.forEach(f => observer.observe(f));
}

// Navigation
function navigateTo(view) {
    if (event) event.preventDefault();
    document.querySelectorAll('.view').forEach(v => v.classList.remove('active'));
    const target = document.getElementById(view + '-view');
    if (target) target.classList.add('active');
    document.querySelectorAll('.nav-link').forEach(link => {
        link.classList.toggle('active', link.dataset.view === view);
    });
    currentView = view;
    window.scrollTo({ top: 0, behavior: 'smooth' });
    if (view === 'marketplace') loadMarketplace();
    if (view === 'home') loadFeatured();
}

// Auth Modal
function openAuthModal(form) {
    const overlay = document.getElementById('auth-modal-overlay');
    overlay.classList.add('active');
    switchAuthForm(form || 'login');
}

function closeAuthModal(e) {
    if (e && e.target !== e.currentTarget) return;
    const overlay = document.getElementById('auth-modal-overlay');
    overlay.classList.remove('active');
}

function switchAuthForm(form) {
    document.getElementById('login-form').style.display = form === 'login' ? 'block' : 'none';
    document.getElementById('signup-form').style.display = form === 'signup' ? 'block' : 'none';
    document.getElementById('auth-success').style.display = 'none';
}

function togglePassword(id) {
    const input = document.getElementById(id);
    const icon = input.parentElement.querySelector('.toggle-pass i');
    if (input.type === 'password') {
        input.type = 'text';
        icon.className = 'fas fa-eye-slash';
    } else {
        input.type = 'password';
        icon.className = 'fas fa-eye';
    }
}

function handleLogin(e) {
    e.preventDefault();
    const email = document.getElementById('login-email').value;
    document.getElementById('login-form').style.display = 'none';
    document.getElementById('auth-success').style.display = 'block';
    document.getElementById('success-title').textContent = 'Welcome Back!';
    document.getElementById('success-text').textContent = 'You\'re now logged in as ' + email;
    isLoggedIn = true;
    document.getElementById('auth-btn-text').textContent = 'Account';
    showToast('Successfully logged in!', 'success');
}

function handleSignup(e) {
    e.preventDefault();
    const email = document.getElementById('signup-email').value;
    document.getElementById('signup-form').style.display = 'none';
    document.getElementById('auth-success').style.display = 'block';
    document.getElementById('success-title').textContent = 'Welcome to ReCircle!';
    document.getElementById('success-text').textContent = 'Your account has been created with ' + email;
    isLoggedIn = true;
    document.getElementById('auth-btn-text').textContent = 'Account';
    showToast('Account created successfully!', 'success');
}

// Toast Notifications
function showToast(message, type) {
    const container = document.getElementById('toast-container');
    const toast = document.createElement('div');
    toast.className = 'toast ' + type;
    toast.innerHTML = '<span class="toast-icon"><i class="fas fa-' + (type === 'success' ? 'check-circle' : 'exclamation-circle') + '"></i></span><span class="toast-message">' + message + '</span>';
    container.appendChild(toast);
    setTimeout(() => { toast.style.opacity = '0'; toast.style.transform = 'translateX(100px)'; setTimeout(() => toast.remove(), 300); }, 3000);
}

// Upload Zone
function initUploadZone() {
    const zone = document.getElementById('upload-zone');
    const input = document.getElementById('device-image-input');
    zone.addEventListener('dragover', e => { e.preventDefault(); zone.classList.add('dragover'); });
    zone.addEventListener('dragleave', () => zone.classList.remove('dragover'));
    zone.addEventListener('drop', e => {
        e.preventDefault();
        zone.classList.remove('dragover');
        if (e.dataTransfer.files.length) handleFileSelection(e.dataTransfer.files[0]);
    });
    input.addEventListener('change', e => {
        if (e.target.files.length) handleFileSelection(e.target.files[0]);
    });
}

function handleFileSelection(file) {
    if (!file.type.startsWith('image/')) { showToast('Please select an image file', 'error'); return; }
    if (file.size > 10 * 1024 * 1024) { showToast('File size must be less than 10MB', 'error'); return; }
    selectedFile = file;
    const preview = document.getElementById('image-preview');
    const container = document.getElementById('image-preview-container');
    const zone = document.getElementById('upload-zone');
    const reader = new FileReader();
    reader.onload = e => {
        preview.src = e.target.result;
        zone.style.display = 'none';
        container.style.display = 'block';
    };
    reader.readAsDataURL(file);
}

function removeImage() {
    selectedFile = null;
    document.getElementById('image-preview-container').style.display = 'none';
    document.getElementById('upload-zone').style.display = 'block';
    document.getElementById('device-image-input').value = '';
    document.getElementById('result-card').style.display = 'none';
}

function fileToBase64(file) {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.readAsDataURL(file);
        reader.onload = () => resolve(reader.result);
        reader.onerror = error => reject(error);
    });
}

async function handleUpload() {
    if (!selectedFile) { showToast('Please select an image first', 'error'); return; }
    const loading = document.getElementById('loading-indicator');
    const previewContainer = document.getElementById('image-preview-container');
    const steps = document.querySelectorAll('.load-step');
    try {
        previewContainer.style.display = 'none';
        loading.style.display = 'block';
        // Animate loading steps
        for (let i = 0; i < steps.length; i++) {
            await new Promise(r => setTimeout(r, 800));
            steps.forEach((s, idx) => {
                s.classList.toggle('active', idx <= i);
                s.querySelector('i').className = idx <= i ? 'fas fa-check-circle' : 'fas fa-circle';
            });
        }
        const base64 = await fileToBase64(selectedFile);
        const response = await fetch(BACKEND_URL + '/api/upload', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ image: base64 })
        });
        const data = await response.json();
        loading.style.display = 'none';
        renderResultCard(data);
        showToast('AI analysis complete!', 'success');
    } catch (error) {
        console.error('Upload error:', error);
        loading.style.display = 'none';
        previewContainer.style.display = 'block';
        renderResultCard({
            deviceName: 'iPhone 14 Pro', condition: 'Excellent', price: 450,
            ecoScore: 'A+', ecoPercent: 92, recommendation: 'sell',
            description: 'This device is in great condition and can be refurbished for another user.',
            tags: ['128GB', 'Space Gray', 'Unlocked']
        });
        showToast('Demo mode - Backend not connected', 'success');
    }
}

function renderResultCard(data) {
    const card = document.getElementById('result-card');
    document.getElementById('device-name').textContent = data.deviceName || 'Unknown Device';
    document.getElementById('device-condition').textContent = data.condition || 'Good Condition';
    document.getElementById('device-price').textContent = formatPrice(data.price || 0);
    document.getElementById('eco-score').textContent = data.ecoScore || 'B';
    document.getElementById('sell-price').textContent = formatPrice(data.price || 0);
    document.getElementById('eco-points').textContent = '+' + ((data.price || 0) * 2) + ' Eco Points';
    const ecoPercent = data.ecoPercent || 70;
    const rec = data.recommendation || 'recycle';
    document.getElementById('rec-action').textContent = rec === 'sell' ? 'Sell' : 'Recycle';
    document.getElementById('rec-text').textContent = data.description || 'Consider recycling this device to earn eco points.';
    document.getElementById('rec-icon').textContent = rec === 'sell' ? '💰' : '♻️';
    // Tags
    const tagsContainer = document.getElementById('device-tags');
    tagsContainer.innerHTML = '';
    (data.tags || ['Good Condition', 'Tested']).forEach(tag => {
        tagsContainer.innerHTML += '<span class="tag">' + tag + '</span>';
    });
    card.style.display = 'block';
    setTimeout(() => { document.getElementById('eco-bar-fill').style.width = ecoPercent + '%'; }, 100);
}

function handleSell() {
    if (!isLoggedIn) { openAuthModal('login'); showToast('Please log in to sell', 'error'); return; }
    showToast('Listing created! Redirecting to marketplace...', 'success');
    setTimeout(() => navigateTo('marketplace'), 1500);
}

function handleRecycle() {
    if (!isLoggedIn) { openAuthModal('login'); showToast('Please log in to recycle', 'error'); return; }
    showToast('Thank you for choosing to recycle! +500 Eco Points credited!', 'success');
}

// Filters
function initFilters() {
    document.querySelectorAll('.filter-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            document.querySelectorAll('.filter-btn').forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            loadMarketplace(btn.dataset.filter);
        });
    });
}

// Device Images - reliable Unsplash photos
const DEVICE_IMAGES = {
    'iPhone 15 Pro': 'https://images.unsplash.com/photo-1695048133142-1a20484d2569?w=400&h=500&fit=crop',
    'iPhone 14 Pro': 'https://images.unsplash.com/photo-1678911820864-e2c567c655d7?w=400&h=500&fit=crop',
    'iPhone 13': 'https://images.unsplash.com/photo-1632635878399-8e537254e56f?w=400&h=500&fit=crop',
    'Samsung Galaxy S24': 'https://images.unsplash.com/photo-1610945415295-d9bbf067e59c?w=400&h=500&fit=crop',
    'Samsung Galaxy S23': 'https://images.unsplash.com/photo-1610945265064-0e34e5519bbf?w=400&h=500&fit=crop',
    'Google Pixel 8': 'https://images.unsplash.com/photo-1598327105666-5b89351aff97?w=400&h=500&fit=crop',
    'MacBook Air M2': 'https://images.unsplash.com/photo-1517336714731-489689fd1ca8?w=400&h=300&fit=crop',
    'MacBook Pro 14': 'https://images.unsplash.com/photo-1517336714731-489689fd1ca8?w=400&h=300&fit=crop',
    'Dell XPS 15': 'https://images.unsplash.com/photo-1593642632559-0c6d3fc62b89?w=400&h=300&fit=crop',
    'iPad Pro 12.9': 'https://images.unsplash.com/photo-1544244015-0df4b3ffc6b0?w=400&h=500&fit=crop',
    'iPad Air': 'https://images.unsplash.com/photo-1585790050230-5dd28404ccb9?w=400&h=500&fit=crop',
    'AirPods Pro': 'https://images.unsplash.com/photo-1606220945770-b5b6c2c55bf1?w=400&h=300&fit=crop',
    'AirPods Max': 'https://images.unsplash.com/photo-1625245488600-f03fef636a3c?w=400&h=300&fit=crop',
    'Sony WH-1000XM5': 'https://images.unsplash.com/photo-1618366712010-f4ae9c647dcb?w=400&h=300&fit=crop',
    'Apple Watch Ultra': 'https://images.unsplash.com/photo-1434493789847-2f02dc6ca35d?w=400&h=400&fit=crop',
    'Apple Watch SE': 'https://images.unsplash.com/photo-1579586337278-3befd40fd17a?w=400&h=400&fit=crop'
};

const DEMO_LISTINGS = [
    { id: 1, name: 'iPhone 15 Pro', price: 899, originalPrice: 1199, condition: 'Excellent', eco: 'A+', category: 'phones', tags: ['256GB', 'Titanium', 'Unlocked'] },
    { id: 2, name: 'iPhone 14 Pro', price: 649, originalPrice: 999, condition: 'Excellent', eco: 'A+', category: 'phones', tags: ['128GB', 'Deep Purple', 'Unlocked'] },
    { id: 3, name: 'iPhone 13', price: 449, originalPrice: 799, condition: 'Very Good', eco: 'A', category: 'phones', tags: ['128GB', 'Blue', 'Unlocked'] },
    { id: 4, name: 'Samsung Galaxy S24', price: 650, originalPrice: 899, condition: 'Excellent', eco: 'A', category: 'phones', tags: ['128GB', 'Phantom Black'] },
    { id: 5, name: 'Samsung Galaxy S23', price: 499, originalPrice: 799, condition: 'Very Good', eco: 'A', category: 'phones', tags: ['128GB', 'Green'] },
    { id: 6, name: 'Google Pixel 8', price: 449, originalPrice: 699, condition: 'Excellent', eco: 'A+', category: 'phones', tags: ['128GB', 'Obsidian'] },
    { id: 7, name: 'MacBook Air M2', price: 780, originalPrice: 1099, condition: 'Very Good', eco: 'A', category: 'laptops', tags: ['8GB RAM', '256GB', 'Midnight'] },
    { id: 8, name: 'MacBook Pro 14', price: 1400, originalPrice: 1999, condition: 'Excellent', eco: 'A+', category: 'laptops', tags: ['M3 Pro', '18GB', 'Space Black'] },
    { id: 9, name: 'Dell XPS 15', price: 650, originalPrice: 1299, condition: 'Good', eco: 'B+', category: 'laptops', tags: ['i7', '16GB', '512GB'] },
    { id: 10, name: 'iPad Pro 12.9', price: 720, originalPrice: 1099, condition: 'Excellent', eco: 'A+', category: 'tablets', tags: ['256GB', 'WiFi', 'Space Gray'] },
    { id: 11, name: 'iPad Air', price: 380, originalPrice: 599, condition: 'Very Good', eco: 'A', category: 'tablets', tags: ['64GB', 'WiFi', 'Blue'] },
    { id: 12, name: 'AirPods Pro', price: 150, originalPrice: 249, condition: 'Excellent', eco: 'A+', category: 'audio', tags: ['USB-C', 'ANC'] },
    { id: 13, name: 'AirPods Max', price: 350, originalPrice: 549, condition: 'Good', eco: 'A', category: 'audio', tags: ['Space Gray', 'Lightning'] },
    { id: 14, name: 'Sony WH-1000XM5', price: 220, originalPrice: 399, condition: 'Excellent', eco: 'A+', category: 'audio', tags: ['Black', 'ANC'] },
    { id: 15, name: 'Apple Watch Ultra', price: 550, originalPrice: 799, condition: 'Very Good', eco: 'A+', category: 'watches', tags: ['49mm', 'Titanium'] },
    { id: 16, name: 'Apple Watch SE', price: 180, originalPrice: 249, condition: 'Excellent', eco: 'A+', category: 'watches', tags: ['40mm', 'GPS', 'Starlight'] }
];

const FEATURED_LISTINGS = [
    { name: 'iPhone 15 Pro', price: 899, originalPrice: 1199, badge: 'Best Seller' },
    { name: 'MacBook Air M2', price: 780, originalPrice: 1099, badge: 'Top Pick' },
    { name: 'AirPods Pro', price: 150, originalPrice: 249, badge: 'Hot Deal' },
    { name: 'iPad Pro 12.9', price: 720, originalPrice: 1099, badge: 'Premium' },
    { name: 'Apple Watch Ultra', price: 550, originalPrice: 799, badge: 'Popular' },
    { name: 'Sony WH-1000XM5', price: 220, originalPrice: 399, badge: 'Audio King' }
];

function loadMarketplace(filter) {
    let listings = [...DEMO_LISTINGS];
    if (filter && filter !== 'all') {
        listings = listings.filter(l => l.category === filter);
    }
    renderMarketplace(listings);
}

function renderMarketplace(listings) {
    const grid = document.getElementById('marketplace-grid');
    grid.innerHTML = '';
    const categoryEmojis = { phones: '📱', laptops: '💻', tablets: '📱', audio: '🎧', watches: '⌚' };
    listings.forEach((listing, i) => {
        const card = document.createElement('div');
        card.className = 'listing-card';
        card.style.animationDelay = (i * 0.08) + 's';
        const img = DEVICE_IMAGES[listing.name] || '';
        const emoji = categoryEmojis[listing.category] || '📱';
        const imgHTML = img
            ? '<img src="' + img + '" alt="' + listing.name + '" loading="lazy" onerror="this.parentElement.innerHTML=\'<span class=list-emoji>' + emoji + '</span>\'">'
            : '<span class="list-emoji">' + emoji + '</span>';
        card.innerHTML =
            '<div class="listing-image">' + imgHTML +
            '<span class="listing-eco-tag">Eco: ' + listing.eco + '</span>' +
            '</div>' +
            '<div class="listing-content">' +
            '<div class="listing-header">' +
            '<h3 class="listing-name">' + listing.name + '</h3>' +
            '<span class="listing-price">' + formatPrice(listing.price) + '</span>' +
            '</div>' +
            '<p class="listing-condition">' + listing.condition + (listing.originalPrice ? ' · <span style="text-decoration:line-through;color:var(--text-muted)">' + formatPrice(listing.originalPrice) + '</span>' : '') + '</p>' +
            '<div class="eco-badge"><i class="fas fa-leaf"></i> Eco Score: ' + listing.eco + '</div>' +
            '<div class="listing-actions">' +
            '<button class="listing-btn listing-btn-primary" onclick="handleBuy(\'' + listing.name + '\', ' + listing.price + ')"><i class="fas fa-shopping-cart"></i> Buy Now</button>' +
            '<button class="listing-btn listing-btn-secondary" onclick="openDetailsModal(' + listing.id + ')"><i class="fas fa-info-circle"></i> Details</button>' +
            '</div></div>';
        grid.appendChild(card);
    });
}

function handleBuy(name, price) {
    if (!isLoggedIn) { openAuthModal('login'); showToast('Please log in to purchase', 'error'); return; }
    showToast('Added ' + name + ' to cart! (' + formatPrice(price) + ')', 'success');
}

// Device Details Data
const DEVICE_DETAILS = {
    1: { description: 'The iPhone 15 Pro features a titanium design, the A17 Pro chip, a customizable Action button, and the most powerful iPhone camera system ever. This device has been professionally inspected and certified.', specs: { 'Chip': 'A17 Pro', 'Display': '6.1" Super Retina XDR', 'Storage': '256GB', 'Camera': '48MP Main', 'Battery': 'Up to 23 hrs', '5G': 'Yes' }, conditionPercent: 95, conditionText: 'Excellent - No visible scratches, battery health at 98%', ecoPoints: 500 },
    2: { description: 'The iPhone 14 Pro introduces the Dynamic Island, a 48MP camera system, and the A16 Bionic chip. All-day battery life and a stunning Always-On display make this a premium device.', specs: { 'Chip': 'A16 Bionic', 'Display': '6.1" Super Retina XDR', 'Storage': '128GB', 'Camera': '48MP Main', 'Battery': 'Up to 23 hrs', '5G': 'Yes' }, conditionPercent: 90, conditionText: 'Excellent - Minor wear on edges, battery health at 95%', ecoPoints: 400 },
    3: { description: 'iPhone 13 delivers a dramatic leap in chip performance, camera capabilities, and battery life. Features the A15 Bionic chip and advanced dual-camera system.', specs: { 'Chip': 'A15 Bionic', 'Display': '6.1" Super Retina XDR', 'Storage': '128GB', 'Camera': '12MP Dual', 'Battery': 'Up to 19 hrs', '5G': 'Yes' }, conditionPercent: 80, conditionText: 'Very Good - Light scratches on screen, battery health at 89%', ecoPoints: 350 },
    4: { description: 'Samsung Galaxy S24 brings AI-powered features to your fingertips with Galaxy AI. Features a stunning Dynamic AMOLED 2X display and advanced camera system.', specs: { 'Processor': 'Snapdragon 8 Gen 3', 'Display': '6.2" Dynamic AMOLED', 'Storage': '128GB', 'Camera': '50MP Main', 'Battery': '4000mAh', '5G': 'Yes' }, conditionPercent: 95, conditionText: 'Excellent - Like new condition, no scratches', ecoPoints: 450 },
    5: { description: 'Samsung Galaxy S23 offers flagship performance with the Snapdragon 8 Gen 2 processor, advanced camera with Nightography, and all-day battery life.', specs: { 'Processor': 'Snapdragon 8 Gen 2', 'Display': '6.1" Dynamic AMOLED', 'Storage': '128GB', 'Camera': '50MP Main', 'Battery': '3900mAh', '5G': 'Yes' }, conditionPercent: 85, conditionText: 'Very Good - Minor signs of use, screen pristine', ecoPoints: 400 },
    6: { description: 'MacBook Air with M2 chip delivers incredible performance in an ultra-thin design. Up to 18 hours of battery life, stunning Liquid Retina display, and fanless design.', specs: { 'Chip': 'Apple M2', 'Display': '13.6" Liquid Retina', 'RAM': '8GB', 'Storage': '256GB SSD', 'Battery': 'Up to 18 hrs', 'Weight': '2.7 lbs' }, conditionPercent: 90, conditionText: 'Very Good - Minor cosmetic wear, keyboard pristine', ecoPoints: 600 },
    7: { description: 'MacBook Pro 14-inch with M3 Pro chip delivers exceptional performance for demanding pro workflows. Features a stunning Liquid Retina XDR display and up to 18 hours of battery life.', specs: { 'Chip': 'Apple M3 Pro', 'Display': '14.2" Liquid Retina XDR', 'RAM': '18GB', 'Storage': '512GB SSD', 'Battery': 'Up to 17 hrs', 'Weight': '3.4 lbs' }, conditionPercent: 95, conditionText: 'Excellent - Like new, zero scratches', ecoPoints: 800 },
    8: { description: 'Dell XPS 15 combines stunning 15.6" OLED display with powerful Intel Core i7 processor. Perfect for creative professionals and power users.', specs: { 'Processor': 'Intel Core i7-13700H', 'Display': '15.6" 3.5K OLED', 'RAM': '16GB', 'Storage': '512GB SSD', 'Battery': 'Up to 13 hrs', 'Graphics': 'Intel Arc' }, conditionPercent: 75, conditionText: 'Good - Light scratches on chassis, screen clean', ecoPoints: 500 },
    9: { description: 'iPad Pro 12.9-inch with M2 chip delivers desktop-class performance in a stunning Liquid Retina XDR display. Perfect for creative work and entertainment.', specs: { 'Chip': 'Apple M2', 'Display': '12.9" Liquid Retina XDR', 'Storage': '256GB', 'Camera': '12MP Wide + 10MP Ultra Wide', 'Battery': 'Up to 10 hrs', 'Connectivity': 'WiFi 6E' }, conditionPercent: 90, conditionText: 'Very Good - Light wear on edges, screen perfect', ecoPoints: 550 },
    10: { description: 'iPad Air delivers powerful performance with the M1 chip in a thin and light design. Features a 10.9" Liquid Retina display and Touch ID.', specs: { 'Chip': 'Apple M1', 'Display': '10.9" Liquid Retina', 'Storage': '64GB', 'Camera': '12MP Wide', 'Battery': 'Up to 10 hrs', 'Touch ID': 'Yes' }, conditionPercent: 85, conditionText: 'Very Good - Minor wear, screen clean', ecoPoints: 400 },
    11: { description: 'AirPods Pro 2nd generation with USB-C delivers up to 2x more Active Noise Cancellation than the previous generation. Features Adaptive Transparency and personalized Spatial Audio.', specs: { 'Type': 'In-ear', 'ANC': 'Active Noise Cancellation', 'Battery': '6 hrs listening', 'Charging': 'USB-C + MagSafe', 'Spatial Audio': 'Yes', 'Water Resistant': 'IP54' }, conditionPercent: 95, conditionText: 'Excellent - Like new with all accessories', ecoPoints: 200 },
    12: { description: 'AirPods Max delivers stunning high-fidelity audio with Apple-designed drivers. Features Active Noise Cancellation, Transparency mode, and spatial audio.', specs: { 'Type': 'Over-ear', 'ANC': 'Active Noise Cancellation', 'Battery': '20 hrs listening', 'Charging': 'Lightning', 'Driver': '40mm', 'Material': 'Aluminum' }, conditionPercent: 80, conditionText: 'Good - Light headband wear, ear cups clean', ecoPoints: 300 },
    13: { description: 'Sony WH-1000XM5 delivers the best noise-canceling performance with Auto NC Optimizer. Features 30-hour battery life and multipoint connection.', specs: { 'Type': 'Over-ear', 'ANC': 'Industry-leading', 'Battery': '30 hours', 'Driver': '30mm', 'Bluetooth': '5.2', 'Codec': 'LDAC' }, conditionPercent: 90, conditionText: 'Very Good - Minimal wear, cushions like new', ecoPoints: 250 },
    14: { description: 'Apple Watch Ultra 2 is the most rugged and capable Apple Watch. Features a 49mm titanium case, precision dual-frequency GPS, and up to 36 hours of battery life.', specs: { 'Case': '49mm Titanium', 'Display': 'Always-On Retina', 'Water Resistance': '100m', 'Battery': 'Up to 36 hrs', 'GPS': 'Precision Dual-Frequency', 'Chip': 'S9 SiP' }, conditionPercent: 90, conditionText: 'Very Good - Minor case scratches, screen perfect', ecoPoints: 350 },
    15: { description: 'Apple Watch SE delivers core Apple Watch features including heart rate monitoring, emergency SOS, and sleep tracking at a more affordable price.', specs: { 'Case': '40mm Aluminum', 'Display': 'Retina LTPO OLED', 'Water Resistance': '50m', 'Battery': 'Up to 18 hrs', 'GPS': 'Built-in', 'Chip': 'S8 SiP' }, conditionPercent: 95, conditionText: 'Excellent - Like new condition', ecoPoints: 250 }
};

function openDetailsModal(id) {
    const listing = DEMO_LISTINGS.find(l => l.id === id);
    if (!listing) return;
    const details = DEVICE_DETAILS[id] || {};
    const img = DEVICE_IMAGES[listing.name] || '';
    const categoryIcons = { phones: '📱 Smartphone', laptops: '💻 Laptop', tablets: '📱 Tablet', audio: '🎧 Audio', watches: '⌚ Watch' };

    document.getElementById('details-category').innerHTML = '<i class="fas fa-tag"></i> ' + (categoryIcons[listing.category] || listing.category);
    document.getElementById('details-name').textContent = listing.name;
    document.getElementById('details-price').textContent = formatPrice(listing.price);
    document.getElementById('details-original').textContent = formatPrice(listing.originalPrice || listing.price);
    const savings = listing.originalPrice ? Math.round((1 - listing.price / listing.originalPrice) * 100) : 0;
    document.getElementById('details-savings').textContent = savings ? '-' + savings + '% off' : '';
    document.getElementById('details-description').textContent = details.description || 'This device has been professionally inspected and certified by ReCircle.';
    document.getElementById('details-eco-badge').textContent = 'Eco: ' + listing.eco;
    document.getElementById('details-eco-score').textContent = listing.eco;
    document.getElementById('details-eco-text').textContent = 'Earn ' + (details.ecoPoints || 300) + ' Eco Points with this purchase';
    document.getElementById('details-eco-points').textContent = '+' + (details.ecoPoints || 300) + ' pts';

    // Image
    const mainImg = document.getElementById('details-img');
    mainImg.src = img;
    mainImg.alt = listing.name;

    // Condition
    const conditionLower = listing.condition.toLowerCase().replace(/\s+/g, '-');
    document.querySelector('.condition-fill').className = 'condition-fill ' + conditionLower;
    document.getElementById('details-condition-text').textContent = details.conditionText || listing.condition + ' condition';

    // Specs
    const specsGrid = document.getElementById('details-specs-grid');
    specsGrid.innerHTML = '';
    const specs = details.specs || {};
    Object.entries(specs).forEach(([label, value]) => {
        specsGrid.innerHTML += '<div class="spec-item"><span class="spec-label">' + label + '</span><span class="spec-value">' + value + '</span></div>';
    });

    // Buy button
    document.getElementById('details-buy-btn').onclick = function() { handleBuy(listing.name, listing.price); };

    document.getElementById('details-modal-overlay').classList.add('active');
    document.body.style.overflow = 'hidden';
}

function closeDetailsModal(e) {
    if (e && e.target !== e.currentTarget && !e.target.classList.contains('details-close') && !e.target.closest('.details-close')) return;
    document.getElementById('details-modal-overlay').classList.remove('active');
    document.body.style.overflow = '';
}

function loadFeatured() {
    const grid = document.getElementById('featured-grid');
    if (!grid) return;
    grid.innerHTML = '';
    const featuredEmojis = ['📱', '💻', '🎧', '📱', '⌚', '🎧'];
    FEATURED_LISTINGS.forEach((listing, i) => {
        const card = document.createElement('div');
        card.className = 'featured-card';
        card.style.animationDelay = (i * 0.15) + 's';
        const img = DEVICE_IMAGES[listing.name] || '';
        const emoji = featuredEmojis[i] || '📱';
        const imgHTML = img
            ? '<img src="' + img + '" alt="' + listing.name + '" loading="lazy" onerror="this.parentElement.innerHTML=\'<span class=featured-emoji>' + emoji + '</span>\'">'
            : '<span class="featured-emoji">' + emoji + '</span>';
        const listingData = DEMO_LISTINGS.find(l => l.name === listing.name);
        const id = listingData ? listingData.id : 1;
        card.innerHTML =
            '<div class="featured-img" onclick="openDetailsModal(' + id + ')">' + imgHTML +
            '<span class="featured-badge">' + listing.badge + '</span>' +
            '</div>' +
            '<div class="featured-content">' +
            '<h3 class="featured-name">' + listing.name + '</h3>' +
            '<div><span class="featured-price">' + formatPrice(listing.price) + '</span><span class="featured-original">' + formatPrice(listing.originalPrice) + '</span></div>' +
            '</div>';
        grid.appendChild(card);
    });
}

// Chat
function toggleChat() {
    chatOpen = !chatOpen;
    const win = document.getElementById('chat-window');
    const toggle = document.getElementById('chat-toggle');
    const icon = toggle.querySelector('.chat-icon');
    const closeIcon = toggle.querySelector('.chat-close-icon');
    win.style.display = chatOpen ? 'flex' : 'none';
    icon.style.display = chatOpen ? 'none' : 'inline';
    closeIcon.style.display = chatOpen ? 'inline' : 'none';
}

function handleChatKeypress(e) {
    if (e.key === 'Enter') sendChatMessage();
}

function sendSuggestion(text) {
    document.getElementById('chat-input').value = text;
    sendChatMessage();
}

async function sendChatMessage() {
    const input = document.getElementById('chat-input');
    const msg = input.value.trim();
    if (!msg) return;
    input.value = '';
    addChatMessage(msg, 'user');
    // Hide suggestions after first message
    const suggestions = document.querySelector('.chat-suggestions');
    if (suggestions) suggestions.style.display = 'none';
    try {
        const response = await fetch(BACKEND_URL + '/api/chat', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ message: msg })
        });
        const data = await response.json();
        addChatMessage(data.reply || data.message || 'I can help you with selling or recycling your devices!', 'bot');
    } catch (e) {
        const lowerMsg = msg.toLowerCase();
        let reply;
        if (lowerMsg.includes('sell')) {
            reply = 'To sell your device, go to the "Sell/Recycle" page and upload a photo. Our AI will evaluate it instantly and give you the best price in ₹!';
        } else if (lowerMsg.includes('eco') || lowerMsg.includes('score')) {
            reply = 'The Eco Score rates how recyclable your device is (A+ being the best). Higher scores earn you more Eco Points, which can be redeemed for discounts!';
        } else if (lowerMsg.includes('worth') || lowerMsg.includes('price') || lowerMsg.includes('value')) {
            reply = 'Device values depend on the model, condition, and market demand. Upload a photo on our Sell page for an instant AI-powered valuation in ₹!';
        } else if (lowerMsg.includes('recycle')) {
            reply = 'Recycling your device through ReCircle ensures it gets responsibly processed. You\'ll earn Eco Points that can be used as discounts in our marketplace!';
        } else if (lowerMsg.includes('buy') || lowerMsg.includes('purchase')) {
            reply = 'Browse our Marketplace for certified refurbished devices at up to 40% off! All devices come with a 12-month warranty. Prices in ₹.';
        } else {
            reply = 'Thanks for your message! I can help with selling, buying, or recycling devices. Try asking about device values, eco scores, or how to get started!';
        }
        addChatMessage(reply, 'bot');
    }
}

function addChatMessage(text, type) {
    const container = document.getElementById('chat-messages');
    const div = document.createElement('div');
    div.className = 'message ' + type + '-message';
    div.innerHTML = '<div class="message-content">' + text + '</div>';
    container.appendChild(div);
    container.scrollTop = container.scrollHeight;
}
