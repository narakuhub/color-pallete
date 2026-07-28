// State Management
let state = {
    mainColor: { r: 232, g: 150, b: 35, h: 36, s: 85, l: 52 },
    autoGenerate: true,
    viewMode: 'grid',
    searchQuery: '',
    editingIndex: null,
    palette: [
        { key: 'background', name: 'Background', hex: '#F4F6F9', r: 244, g: 246, b: 249 },
        { key: 'card', name: 'Card Background', hex: '#FFFFFF', r: 255, g: 255, b: 255 },
        { key: 'header', name: 'Header Background', hex: '#FFFFFF', r: 255, g: 255, b: 255 },
        { key: 'primary', name: 'Primary', hex: '#E89623', r: 232, g: 150, b: 35 },
        { key: 'primaryHover', name: 'Primary Hover', hex: '#D2821A', r: 210, g: 130, b: 26 },
        { key: 'secondary', name: 'Secondary', hex: '#BF6E12', r: 191, g: 110, b: 18 },
        { key: 'secondaryHover', name: 'Secondary Hover', hex: '#A55D0F', r: 165, g: 93, b: 15 },
        { key: 'accent', name: 'Accent', hex: '#FFB446', r: 255, g: 184, b: 70 },
        { key: 'textPrimary', name: 'Text Primary', hex: '#1E293B', r: 30, g: 41, b: 59 },
        { key: 'textSecondary', name: 'Text Secondary', hex: '#64748B', r: 100, g: 116, b: 139 },
        { key: 'success', name: 'Success', hex: '#22C55E', r: 34, g: 197, b: 94 },
        { key: 'warning', name: 'Warning', hex: '#F59E0B', r: 245, g: 158, b: 11 },
        { key: 'danger', name: 'Danger', hex: '#EF4444', r: 239, g: 68, b: 68 }
    ]
};

// DOM Elements
const hexInput = document.getElementById('hexInput');
const rInput = document.getElementById('rInput');
const gInput = document.getElementById('gInput');
const bInput = document.getElementById('bInput');
const colorArea = document.getElementById('colorArea');
const colorCursor = document.getElementById('colorCursor');
const hueSlider = document.getElementById('hueSlider');
const hueCursor = document.getElementById('hueCursor');
const autoGenToggle = document.getElementById('autoGenToggle');
const searchInput = document.getElementById('searchInput');
const paletteCardsGrid = document.getElementById('paletteCardsGrid');
const colorCountBadge = document.getElementById('colorCountBadge');
const gridViewBtn = document.getElementById('gridViewBtn');
const listViewBtn = document.getElementById('listViewBtn');
const exportBtn = document.getElementById('exportBtn');
const toast = document.getElementById('toast');

// Modal Elements
const editModal = document.getElementById('editModal');
const modalTitle = document.getElementById('modalTitle');
const modalColorPreview = document.getElementById('modalColorPreview');
const modalColorPicker = document.getElementById('modalColorPicker');
const modalHexInput = document.getElementById('modalHexInput');
const closeModalBtn = document.getElementById('closeModalBtn');
const modalCancelBtn = document.getElementById('modalCancelBtn');
const modalSaveBtn = document.getElementById('modalSaveBtn');
const editIndividualGlobalBtn = document.getElementById('editIndividualGlobalBtn');

// Helper Functions for Color Conversion
function rgbToHex(r, g, b) {
    return "#" + [r, g, b].map(x => {
        const hex = Math.max(0, Math.min(255, Math.round(x))).toString(16);
        return hex.length === 1 ? "0" + hex : hex;
    }).join("").toUpperCase();
}

function hexToRgb(hex) {
    let cleanHex = hex.replace(/^#/, '');
    if (cleanHex.length === 3) {
        cleanHex = cleanHex.split('').map(c => c + c).join('');
    }
    const num = parseInt(cleanHex, 16);
    return {
        r: (num >> 16) & 255,
        g: (num >> 8) & 255,
        b: num & 255
    };
}

function rgbToHsl(r, g, b) {
    r /= 255; g /= 255; b /= 255;
    const max = Math.max(r, g, b), min = Math.min(r, g, b);
    let h, s, l = (max + min) / 2;

    if (max === min) {
        h = s = 0;
    } else {
        const d = max - min;
        s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
        switch (max) {
            case r: h = (g - b) / d + (g < b ? 6 : 0); break;
            case g: h = (b - r) / d + 2; break;
            case b: h = (r - g) / d + 4; break;
        }
        h /= 6;
    }
    return { h: Math.round(h * 360), s: Math.round(s * 100), l: Math.round(l * 100) };
}

function hslToRgb(h, s, l) {
    h /= 360; s /= 100; l /= 100;
    let r, g, b;

    if (s === 0) {
        r = g = b = l;
    } else {
        const hue2rgb = (p, q, t) => {
            if (t < 0) t += 1;
            if (t > 1) t -= 1;
            if (t < 1/6) return p + (q - p) * 6 * t;
            if (t < 1/2) return q;
            if (t < 2/3) return p + (q - p) * (2/3 - t) * 6;
            return p;
        };
        const q = l < 0.5 ? l * (1 + s) : l + s - l * s;
        const p = 2 * l - q;
        r = hue2rgb(p, q, h + 1/3);
        g = hue2rgb(p, q, h);
        b = hue2rgb(p, q, h - 1/3);
    }
    return { r: Math.round(r * 255), g: Math.round(g * 255), b: Math.round(b * 255) };
}

// Show Toast
function showToast(message = 'Copied to clipboard!') {
    toast.textContent = message;
    toast.classList.add('show');
    setTimeout(() => {
        toast.classList.remove('show');
    }, 2000);
}

// Update Palette Automatically based on Main Color
function generateAutomaticPalette() {
    if (!state.autoGenerate) return;
    
    const { r, g, b, h } = state.mainColor;
    const mainHex = rgbToHex(r, g, b);
    
    const secH = (h + 30) % 360;
    const secRgb = hslToRgb(secH, 70, 45);
    const secHex = rgbToHex(secRgb.r, secRgb.g, secRgb.b);
    
    const hoverRgb = hslToRgb(h, 80, 45);
    const hoverHex = rgbToHex(hoverRgb.r, hoverRgb.g, hoverRgb.b);

    state.palette = state.palette.map(item => {
        let newColor = { ...item };
        switch (item.key) {
            case 'primary':
                newColor.hex = mainHex; newColor.r = r; newColor.g = g; newColor.b = b;
                break;
            case 'primaryHover':
                newColor.hex = hoverHex; newColor.r = hoverRgb.r; newColor.g = hoverRgb.g; newColor.b = hoverRgb.b;
                break;
            case 'secondary':
                newColor.hex = secHex; newColor.r = secRgb.r; newColor.g = secRgb.g; newColor.b = secRgb.b;
                break;
            case 'accent':
                newColor.hex = mainHex; newColor.r = r; newColor.g = g; newColor.b = b;
                break;
            default:
                break;
        }
        return newColor;
    });
}

// Render UI Components
function renderUI() {
    const hsl = rgbToHsl(state.mainColor.r, state.mainColor.g, state.mainColor.b);
    state.mainColor.h = hsl.h;
    
    const huePercent = (hsl.h / 360) * 100;
    hueCursor.style.left = `${huePercent}%`;

    colorCursor.style.left = `${hsl.s}%`;
    colorCursor.style.top = `${100 - hsl.l}%`;

    hexInput.value = rgbToHex(state.mainColor.r, state.mainColor.g, state.mainColor.b);
    rInput.value = state.mainColor.r;
    gInput.value = state.mainColor.g;
    bInput.value = state.mainColor.b;

    const filteredPalette = state.palette.filter(item => 
        item.name.toLowerCase().includes(state.searchQuery.toLowerCase()) ||
        item.hex.toLowerCase().includes(state.searchQuery.toLowerCase())
    );

    colorCountBadge.textContent = `${filteredPalette.length} Colors`;
    paletteCardsGrid.innerHTML = '';

    filteredPalette.forEach((item, index) => {
        const card = document.createElement('div');
        card.className = 'color-card';
        
        card.innerHTML = `
            <div class="color-card-preview" style="background-color: ${item.hex};">
                <button class="card-edit-btn" data-index="${index}" title="Edit Color">
                    <svg viewBox="0 0 24 24" width="14" height="14" stroke="currentColor" stroke-width="2" fill="none"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>
                </button>
            </div>
            <div class="color-card-info">
                <span class="card-name">${item.name}</span>
                <div class="card-codes">
                    <span class="card-code-val">RGB(${item.r}, ${item.g}, ${item.b})</span>
                    <span class="card-code-val">${item.hex}</span>
                </div>
                <div class="card-actions">
                    <button class="card-btn copy-hex-btn" data-hex="${item.hex}">Copy HEX</button>
                    <button class="card-btn copy-rgb-btn" data-rgb="rgb(${item.r}, ${item.g}, ${item.b})">Copy RGB</button>
                </div>
            </div>
        `;
        paletteCardsGrid.appendChild(card);
    });
}

// Set Main Color from RGB
function setMainColorRgb(r, g, b) {
    state.mainColor.r = Math.max(0, Math.min(255, r));
    state.mainColor.g = Math.max(0, Math.min(255, g));
    state.mainColor.b = Math.max(0, Math.min(255, b));
    if (state.autoGenerate) {
        generateAutomaticPalette();
    }
    renderUI();
}

// Event Listeners for Inputs & Pickers
hexInput.addEventListener('input', (e) => {
    const val = e.target.value;
    if (/^#[0-9A-F]{6}$/i.test(val)) {
        const rgb = hexToRgb(val);
        setMainColorRgb(rgb.r, rgb.g, rgb.b);
    }
});

[rInput, gInput, bInput].forEach(input => {
    input.addEventListener('input', () => {
        setMainColorRgb(
            parseInt(rInput.value) || 0,
            parseInt(gInput.value) || 0,
            parseInt(bInput.value) || 0
        );
    });
});

autoGenToggle.addEventListener('change', (e) => {
    state.autoGenerate = e.target.checked;
    if (state.autoGenerate) {
        generateAutomaticPalette();
        renderUI();
    }
});

// Responsive Hue & Color Area Dragging (Support Touch & Mouse)
function updateHueFromEvent(e) {
    const clientX = e.touches ? e.touches[0].clientX : e.clientX;
    const rect = hueSlider.getBoundingClientRect();
    let x = clientX - rect.left;
    x = Math.max(0, Math.min(rect.width, x));
    const hue = Math.round((x / rect.width) * 360);
    const hsl = rgbToHsl(state.mainColor.r, state.mainColor.g, state.mainColor.b);
    const rgb = hslToRgb(hue, hsl.s || 80, hsl.l || 50);
    setMainColorRgb(rgb.r, rgb.g, rgb.b);
}

function updateColorAreaFromEvent(e) {
    const clientX = e.touches ? e.touches[0].clientX : e.clientX;
    const clientY = e.touches ? e.touches[0].clientY : e.clientY;
    const rect = colorArea.getBoundingClientRect();
    let x = clientX - rect.left;
    let y = clientY - rect.top;
    x = Math.max(0, Math.min(rect.width, x));
    y = Math.max(0, Math.min(rect.height, y));
    
    const s = Math.round((x / rect.width) * 100);
    const l = Math.round(100 - (y / rect.height) * 100);
    const hsl = rgbToHsl(state.mainColor.r, state.mainColor.g, state.mainColor.b);
    const rgb = hslToRgb(hsl.h, s, l);
    setMainColorRgb(rgb.r, rgb.g, rgb.b);
}

// Mouse events
let isDraggingHue = false;
let isDraggingColorArea = false;

hueSlider.addEventListener('mousedown', (e) => { isDraggingHue = true; updateHueFromEvent(e); });
colorArea.addEventListener('mousedown', (e) => { isDraggingColorArea = true; updateColorAreaFromEvent(e); });

window.addEventListener('mousemove', (e) => {
    if (isDraggingHue) updateHueFromEvent(e);
    if (isDraggingColorArea) updateColorAreaFromEvent(e);
});

window.addEventListener('mouseup', () => {
    isDraggingHue = false;
    isDraggingColorArea = false;
});

// Touch events for mobile responsiveness
hueSlider.addEventListener('touchstart', (e) => { isDraggingHue = true; updateHueFromEvent(e); });
colorArea.addEventListener('touchstart', (e) => { isDraggingColorArea = true; updateColorAreaFromEvent(e); });

window.addEventListener('touchmove', (e) => {
    if (isDraggingHue) updateHueFromEvent(e);
    if (isDraggingColorArea) updateColorAreaFromEvent(e);
});

window.addEventListener('touchend', () => {
    isDraggingHue = false;
    isDraggingColorArea = false;
});

// Search Functionality
searchInput.addEventListener('input', (e) => {
    state.searchQuery = e.target.value;
    renderUI();
});

// Shortcut Ctrl+K
window.addEventListener('keydown', (e) => {
    if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        searchInput.focus();
    }
});

// View Mode Switching
gridViewBtn.addEventListener('click', () => {
    state.viewMode = 'grid';
    gridViewBtn.classList.add('active');
    listViewBtn.classList.remove('active');
    paletteCardsGrid.classList.remove('list-view');
});

listViewBtn.addEventListener('click', () => {
    state.viewMode = 'list';
    listViewBtn.classList.add('active');
    gridViewBtn.classList.remove('active');
    paletteCardsGrid.classList.add('list-view');
});

// Copy & Edit actions via Event Delegation on Grid
paletteCardsGrid.addEventListener('click', (e) => {
    const copyHexBtn = e.target.closest('.copy-hex-btn');
    const copyRgbBtn = e.target.closest('.copy-rgb-btn');
    const editBtn = e.target.closest('.card-edit-btn');

    if (copyHexBtn) {
        const hex = copyHexBtn.getAttribute('data-hex');
        navigator.clipboard.writeText(hex);
        showToast(`Copied HEX: ${hex}`);
    }

    if (copyRgbBtn) {
        const rgb = copyRgbBtn.getAttribute('data-rgb');
        navigator.clipboard.writeText(rgb);
        showToast(`Copied RGB: ${rgb}`);
    }

    if (editBtn) {
        const index = parseInt(editBtn.getAttribute('data-index'));
        openEditModal(index);
    }
});

// Modal Logic
function openEditModal(index) {
    state.editingIndex = index;
    const item = state.palette[index];
    modalTitle.textContent = `Edit Color: ${item.name}`;
    modalColorPreview.style.backgroundColor = item.hex;
    modalColorPicker.value = item.hex;
    modalHexInput.value = item.hex;
    editModal.classList.add('open');
}

closeModalBtn.addEventListener('click', closeModal);
modalCancelBtn.addEventListener('click', closeModal);

function closeModal() {
    editModal.classList.remove('open');
    state.editingIndex = null;
}

modalColorPicker.addEventListener('input', (e) => {
    modalHexInput.value = e.target.value.toUpperCase();
    modalColorPreview.style.backgroundColor = e.target.value;
});

modalHexInput.addEventListener('input', (e) => {
    const val = e.target.value;
    if (/^#[0-9A-F]{6}$/i.test(val)) {
        modalColorPicker.value = val;
        modalColorPreview.style.backgroundColor = val;
    }
});

modalSaveBtn.addEventListener('click', () => {
    if (state.editingIndex !== null) {
        const hex = modalHexInput.value;
        if (/^#[0-9A-F]{6}$/i.test(hex)) {
            const rgb = hexToRgb(hex);
            state.palette[state.editingIndex].hex = hex;
            state.palette[state.editingIndex].r = rgb.r;
            state.palette[state.editingIndex].g = rgb.g;
            state.palette[state.editingIndex].b = rgb.b;
            renderUI();
            closeModal();
            showToast('Color updated successfully!');
        } else {
            alert('Please enter a valid HEX code (e.g. #E89623)');
        }
    }
});

editIndividualGlobalBtn.addEventListener('click', () => {
    openEditModal(0);
});

// Export JSON
exportBtn.addEventListener('click', () => {
    const exportObj = {};
    state.palette.forEach(item => {
        exportObj[item.key] = `rgb(${item.r},${item.g},${item.b})`;
    });

    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(exportObj, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute("href", dataStr);
    downloadAnchor.setAttribute("download", "roblox_ui_palette.json");
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
    showToast('Palette exported as JSON!');
});

// Init App
renderUI();

// LOADING SCREEN 15 SECONDS PROGRESS & SMOOTH FADE OUT
window.addEventListener('load', () => {
    const loadingScreen = document.getElementById('loadingScreen');
    const progressBarFill = document.getElementById('progressBarFill');
    const progressPercentage = document.getElementById('progressPercentage');
    
    if (loadingScreen && progressBarFill && progressPercentage) {
        const totalDuration = 15000; // 15 Detik
        const intervalTime = 50;     // Update setiap 50ms agar mulus
        let currentProgress = 0;
        
        const increment = (intervalTime / totalDuration) * 100;

        const progressTimer = setInterval(() => {
            currentProgress += increment;
            
            if (currentProgress >= 100) {
                currentProgress = 100;
                clearInterval(progressTimer);
                
                // Sembunyikan loading screen setelah 15 detik penuh
                setTimeout(() => {
                    loadingScreen.classList.add('fade-out');
                }, 300);
            }
            
            // Perbarui tampilan bar dan teks persentase
            const roundedProgress = Math.round(currentProgress);
            progressBarFill.style.width = `${roundedProgress}%`;
            progressPercentage.textContent = `${roundedProgress}%`;
            
        }, intervalTime);
    }
});
