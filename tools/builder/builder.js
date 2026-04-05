const form = document.querySelector('.grid-controls');
const gridCanvas = document.getElementById('grid-canvas');
const gridPlaceholder = document.querySelector('.grid-placeholder');
const gridPanel = document.querySelector('.grid-panel');
const colorInput = form.querySelector('input[name="current-color"]');
const nativeColorInput = form.querySelector('input[name="native-color"]');
const eraserButton = form.querySelector('.eraser-button');
const nightVisionButton = form.querySelector('.night-vision-button');
const colorPopover = document.getElementById('color-popover');
const colorHistory = document.querySelector('.color-history');
const translateButton = document.querySelector('.translate-button');
const reverseButton = document.querySelector('.reverse-button');
const trimButton = document.querySelector('.trim-button');
const matrixInput = document.getElementById('matrix-input');
const matrixOutput = document.getElementById('matrix-output');
const matrixPlaceholder = document.getElementById('matrix-placeholder');
const insertColIndexInput = form.querySelector('input[name="insert-col-index"]');
const insertRowIndexInput = form.querySelector('input[name="insert-row-index"]');
const insertColLeftButton = form.querySelector('.insert-col-left-button');
const insertColRightButton = form.querySelector('.insert-col-right-button');
const insertRowAboveButton = form.querySelector('.insert-row-above-button');
const insertRowBelowButton = form.querySelector('.insert-row-below-button');
let currentColor = null;
let currentGridSize = null;
const recentColors = [];

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
        const normalized = normalizeHex(value);
        currentColor = normalized;
        colorInput.style.backgroundColor = hexToRgba(normalized, 0.25);
        nativeColorInput.value = normalized;
    } else {
        currentColor = null;
        colorInput.style.backgroundColor = 'transparent';
    }
});

colorInput.addEventListener('keydown', (event) => {
    if (event.key === 'Enter') {
        event.preventDefault();
    }
});

colorInput.addEventListener('change', () => {
    if (currentColor) addToHistory(currentColor);
});

nativeColorInput.addEventListener('input', () => {
    const value = nativeColorInput.value;
    currentColor = value;
    colorInput.value = value;
    colorInput.style.backgroundColor = hexToRgba(value, 0.25);
});

nativeColorInput.addEventListener('change', () => {
    if (currentColor) addToHistory(currentColor);
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
    nativeColorInput.value = normalizeHex(value);
    addToHistory(value);
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
    addToHistory(currentColor);
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

reverseButton.addEventListener('click', () => {
    const source = matrixInput.value.trim();
    if (!source) return;
    const { matrix, palette } = parseMatrixInput(source);
    if (!matrix.length) return;
    applyMatrixToGrid(matrix, palette);
});

trimButton.addEventListener('click', () => {
    const { matrix, palette } = buildColorMatrix();
    const trimmed = trimMatrix(matrix);
    matrixOutput.textContent = formatMatrixOutput(trimmed, palette);
    matrixPlaceholder.style.display = 'none';
    matrixOutput.style.display = 'block';
});

insertColLeftButton.addEventListener('click', () => {
    insertColumnAtIndex(getInsertIndex(insertColIndexInput, currentGridSize?.width ?? 1), 'left');
});

insertColRightButton.addEventListener('click', () => {
    insertColumnAtIndex(getInsertIndex(insertColIndexInput, currentGridSize?.width ?? 1), 'right');
});

insertRowAboveButton.addEventListener('click', () => {
    insertRowAtIndex(getInsertIndex(insertRowIndexInput, currentGridSize?.height ?? 1), 'above');
});

insertRowBelowButton.addEventListener('click', () => {
    insertRowAtIndex(getInsertIndex(insertRowIndexInput, currentGridSize?.height ?? 1), 'below');
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

function addToHistory(color) {
    const normalized = normalizeHex(color);
    const existingIndex = recentColors.indexOf(normalized);
    if (existingIndex !== -1) {
        recentColors.splice(existingIndex, 1);
    }
    recentColors.unshift(normalized);
    if (recentColors.length > 8) recentColors.length = 8;
    renderColorHistory();
}

function renderColorHistory() {
    colorHistory.innerHTML = '';
    recentColors.forEach((color) => {
        const button = document.createElement('button');
        button.type = 'button';
        button.style.background = color;
        button.title = color;
        button.addEventListener('click', () => {
            currentColor = color;
            colorInput.value = color;
            colorInput.style.backgroundColor = hexToRgba(color, 0.25);
            nativeColorInput.value = color;
        });
        colorHistory.appendChild(button);
    });
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

function getInsertIndex(input, maxValue) {
    const raw = parseInt(input.value, 10);
    if (!Number.isFinite(raw)) return 0;
    const zeroBased = raw - 1;
    if (zeroBased < 0) return 0;
    if (zeroBased >= maxValue) return Math.max(0, maxValue - 1);
    return zeroBased;
}

function insertColumnAtIndex(index, side) {
    const { matrix, palette } = buildColorMatrix();
    if (!matrix.length) return;
    const insertAt = side === 'left' ? index : index + 1;
    matrix.forEach((row) => {
        row.splice(insertAt, 0, 0);
    });
    applyMatrixToGrid(matrix, palette);
}

function insertRowAtIndex(index, side) {
    const { matrix, palette } = buildColorMatrix();
    if (!matrix.length) return;
    const width = matrix[0].length || 1;
    const newRow = new Array(width).fill(0);
    const insertAt = side === 'above' ? index : index + 1;
    matrix.splice(insertAt, 0, newRow);
    applyMatrixToGrid(matrix, palette);
}

function parseMatrixInput(text) {
    const palette = parsePaletteBlock(text);
    const gridBlock = extractNamedBlock(text, 'grid');
    const matrix = gridBlock ? parseGridBlock(gridBlock) : parseGridBlock(text);
    return { matrix, palette };
}

function parsePaletteBlock(text) {
    const paletteBlock = extractNamedBlock(text, 'palette', '{', '}');
    if (!paletteBlock) return {};
    const palette = {};
    const entryRegex = /([0-9]+)\s*:\s*["']([^"']+)["']/g;
    let match;
    while ((match = entryRegex.exec(paletteBlock)) !== null) {
        palette[parseInt(match[1], 10)] = match[2];
    }
    return palette;
}

function extractNamedBlock(text, name, openChar = '[', closeChar = ']') {
    const lower = text.toLowerCase();
    const markerIndex = lower.indexOf(`${name.toLowerCase()}:`);
    if (markerIndex === -1) return '';
    const startIndex = text.indexOf(openChar, markerIndex);
    if (startIndex === -1) return '';
    return extractBracketBlock(text, startIndex, openChar, closeChar);
}

function extractBracketBlock(text, startIndex, openChar, closeChar) {
    let depth = 0;
    for (let i = startIndex; i < text.length; i += 1) {
        const char = text[i];
        if (char === openChar) depth += 1;
        if (char === closeChar) depth -= 1;
        if (depth === 0) {
            return text.slice(startIndex, i + 1);
        }
    }
    return text.slice(startIndex);
}

function parseGridBlock(block) {
    const tokens = [];
    let i = 0;
    while (i < block.length) {
        const char = block[i];
        if (/\s/.test(char)) {
            i += 1;
            continue;
        }
        if (char === '[' || char === ']' || char === ',') {
            tokens.push(char);
            i += 1;
            continue;
        }
        if (char === '-' || /[0-9]/.test(char)) {
            let j = i + 1;
            while (j < block.length && /[0-9]/.test(block[j])) j += 1;
            const numberText = block.slice(i, j);
            tokens.push(Number.parseInt(numberText, 10));
            i = j;
            continue;
        }
        i += 1;
    }

    let index = 0;
    function parseArray() {
        if (tokens[index] !== '[') return [];
        index += 1;
        const arr = [];
        while (index < tokens.length && tokens[index] !== ']') {
            const token = tokens[index];
            if (token === '[') {
                arr.push(parseArray());
                continue;
            }
            if (typeof token === 'number') {
                arr.push(token);
                index += 1;
                continue;
            }
            if (token === ',') {
                index += 1;
                continue;
            }
            index += 1;
        }
        if (tokens[index] === ']') index += 1;
        return arr;
    }

    const parsed = parseArray();
    return Array.isArray(parsed[0]) ? parsed : [];
}

function applyMatrixToGrid(matrix, palette) {
    const height = matrix.length;
    const width = Math.max(...matrix.map((row) => row.length), 0);
    if (!width || !height) return;

    const widthInput = form.querySelector('input[name="grid-width"]');
    const heightInput = form.querySelector('input[name="grid-height"]');
    widthInput.value = width;
    heightInput.value = height;

    renderGrid(width, height);
    currentGridSize = { width, height };

    const defaultColor = '#000000';
    const cells = Array.from(gridCanvas.children);
    for (let y = 0; y < height; y += 1) {
        for (let x = 0; x < width; x += 1) {
            const cell = cells[y * width + x];
            const value = matrix[y]?.[x] ?? 0;
            if (!value) {
                cell.style.backgroundColor = '';
                cell.dataset.color = '';
                continue;
            }
            const color = palette[value] || defaultColor;
            cell.style.backgroundColor = color;
            cell.dataset.color = color;
        }
    }
}

function trimMatrix(matrix) {
    if (!matrix.length) return matrix;
    const rowCount = matrix.length;
    const colCount = matrix[0].length || 0;

    let top = 0;
    while (top < rowCount && matrix[top].every((value) => value === 0)) {
        top += 1;
    }

    if (top === rowCount) {
        return matrix;
    }

    let bottom = rowCount - 1;
    while (bottom >= 0 && matrix[bottom].every((value) => value === 0)) {
        bottom -= 1;
    }

    let left = 0;
    while (left < colCount) {
        const hasValue = matrix.slice(top, bottom + 1).some((row) => row[left] !== 0);
        if (hasValue) break;
        left += 1;
    }

    let right = colCount - 1;
    while (right >= 0) {
        const hasValue = matrix.slice(top, bottom + 1).some((row) => row[right] !== 0);
        if (hasValue) break;
        right -= 1;
    }

    return matrix.slice(top, bottom + 1).map((row) => row.slice(left, right + 1));
}

function isValidHexColor(value) {
    return /^#([0-9a-fA-F]{6}|[0-9a-fA-F]{3})$/.test(value);
}

function normalizeHex(value) {
    if (!value) return value;
    if (value.length === 4) {
        return `#${value[1]}${value[1]}${value[2]}${value[2]}${value[3]}${value[3]}`.toLowerCase();
    }
    return value.toLowerCase();
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
