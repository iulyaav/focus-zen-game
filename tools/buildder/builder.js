const form = document.querySelector('.grid-controls');
const gridCanvas = document.getElementById('grid-canvas');
const gridPlaceholder = document.querySelector('.grid-placeholder');
const gridPanel = document.querySelector('.grid-panel');
const colorInput = form.querySelector('input[name="current-color"]');
const eraserButton = form.querySelector('.eraser-button');
const nightVisionButton = form.querySelector('.night-vision-button');
const colorPopover = document.getElementById('color-popover');
const translateButton = document.querySelector('.translate-button');
const matrixOutput = document.getElementById('matrix-output');
const matrixPlaceholder = document.getElementById('matrix-placeholder');
let currentColor = null;
let currentGridSize = null;

form.addEventListener('submit', (event) => {
    event.preventDefault();
    const widthInput = form.querySelector('input[name="grid-width"]');
    const heightInput = form.querySelector('input[name="grid-height"]');
    const width = Math.max(1, parseInt(widthInput.value, 10) || 1);
    const height = Math.max(1, parseInt(heightInput.value, 10) || 1);

    renderGrid(width, height);
    currentGridSize = { width, height };
});

colorInput.addEventListener('input', () => {
    const value = colorInput.value.trim();
    if (isValidHexColor(value)) {
        currentColor = value;
        colorInput.style.backgroundColor = hexToRgba(value, 0.25);
    } else {
        currentColor = null;
        colorInput.style.backgroundColor = 'transparent';
    }
});

colorInput.addEventListener('focus', () => {
    colorPopover.classList.add('is-open');
    colorPopover.setAttribute('aria-hidden', 'false');
});

colorInput.addEventListener('click', () => {
    colorPopover.classList.add('is-open');
    colorPopover.setAttribute('aria-hidden', 'false');
});

document.addEventListener('click', (event) => {
    if (event.target === colorInput || colorPopover.contains(event.target)) return;
    colorPopover.classList.remove('is-open');
    colorPopover.setAttribute('aria-hidden', 'true');
});

colorPopover.addEventListener('click', (event) => {
    const swatch = event.target.closest('.swatch');
    if (!swatch) return;
    const value = swatch.dataset.color;
    if (!value) return;
    currentColor = value;
    colorInput.value = value;
    colorInput.style.backgroundColor = hexToRgba(value, 0.25);
});

colorPopover.addEventListener('click', (event) => {
    const addButton = event.target.closest('.add-swatch');
    if (!addButton) return;
    if (!currentColor) return;
    const existing = colorPopover.querySelector(`[data-color="${currentColor}"]`);
    if (existing) return;
    const swatch = document.createElement('div');
    swatch.className = 'swatch';
    swatch.dataset.color = currentColor;
    swatch.style.background = currentColor;
    colorPopover.insertBefore(swatch, addButton);
});

eraserButton.addEventListener('click', () => {
    currentColor = null;
    colorInput.value = '';
    colorInput.style.backgroundColor = 'transparent';
});

nightVisionButton.addEventListener('click', () => {
    gridCanvas.classList.toggle('night-vision');
});

translateButton.addEventListener('click', () => {
    const { matrix, palette } = buildColorMatrix();
    matrixOutput.textContent = formatMatrixOutput(matrix, palette);
    matrixPlaceholder.style.display = 'none';
    matrixOutput.style.display = 'block';
});

function renderGrid(width, height) {
    gridCanvas.innerHTML = '';
    gridPlaceholder.style.display = 'none';
    gridCanvas.style.gridTemplateColumns = `repeat(${width}, 1fr)`;
    gridCanvas.style.gridTemplateRows = `repeat(${height}, 1fr)`;
    sizeGridCanvas(width, height);

    const cellCount = width * height;
    for (let i = 0; i < cellCount; i++) {
        const cell = document.createElement('div');
        cell.className = 'grid-cell';
        cell.addEventListener('click', () => {
            if (currentColor) {
                cell.style.backgroundColor = currentColor;
                cell.dataset.color = currentColor;
            } else {
                cell.style.backgroundColor = '';
                cell.dataset.color = '';
            }
        });
        gridCanvas.appendChild(cell);
    }
}

function sizeGridCanvas(columns, rows) {
    const panelRect = gridPanel.getBoundingClientRect();
    const padding = 32;
    const availableWidth = Math.max(1, panelRect.width - padding);
    const availableHeight = Math.max(1, panelRect.height - padding);
    const cellSize = Math.floor(Math.min(availableWidth / columns, availableHeight / rows));
    const gridWidth = cellSize * columns;
    const gridHeight = cellSize * rows;
    gridCanvas.style.width = `${gridWidth}px`;
    gridCanvas.style.height = `${gridHeight}px`;
}

function buildZeroMatrix() {
    if (!currentGridSize) return [];
    const rows = [];
    for (let y = 0; y < currentGridSize.height; y++) {
        const row = new Array(currentGridSize.width).fill(0);
        rows.push(row);
    }
    return rows;
}

function buildColorMatrix() {
    if (!currentGridSize) return { matrix: [], palette: {} };
    const palette = {};
    const colorToIndex = new Map();
    let nextIndex = 1;
    const matrix = [];

    const cells = Array.from(gridCanvas.children);
    for (let y = 0; y < currentGridSize.height; y++) {
        const row = [];
        for (let x = 0; x < currentGridSize.width; x++) {
            const cell = cells[y * currentGridSize.width + x];
            const color = cell?.dataset?.color || '';
            if (!color) {
                row.push(0);
                continue;
            }
            if (!colorToIndex.has(color)) {
                colorToIndex.set(color, nextIndex);
                palette[nextIndex] = color;
                nextIndex += 1;
            }
            row.push(colorToIndex.get(color));
        }
        matrix.push(row);
    }

    return { matrix, palette };
}

function formatMatrixOutput(matrix, palette) {
    const lines = [];
    lines.push('palette: {');
    const paletteEntries = Object.entries(palette);
    paletteEntries.forEach(([key, value], index) => {
        const comma = index === paletteEntries.length - 1 ? '' : ',';
        lines.push(`  ${key}: "${value}"${comma}`);
    });
    lines.push('}');
    lines.push('');
    lines.push('grid: [');
    matrix.forEach((row, index) => {
        const comma = index === matrix.length - 1 ? '' : ',';
        lines.push(`  [${row.join(', ')}]${comma}`);
    });
    lines.push(']');
    return lines.join('\n');
}

function isValidHexColor(value) {
    return /^#([0-9a-fA-F]{6}|[0-9a-fA-F]{3})$/.test(value);
}

function hexToRgba(hex, alpha) {
    const normalized = hex.length === 4
        ? `#${hex[1]}${hex[1]}${hex[2]}${hex[2]}${hex[3]}${hex[3]}`
        : hex;
    const r = parseInt(normalized.slice(1, 3), 16);
    const g = parseInt(normalized.slice(3, 5), 16);
    const b = parseInt(normalized.slice(5, 7), 16);
    return `rgba(${r}, ${g}, ${b}, ${alpha})`;
}
