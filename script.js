// Game variables
const gridWidth = 10;
const gridHeight = 20;
const gridElement = document.getElementById("grid");
const scoreElement = document.getElementById("score");
let grid = Array.from({ length: gridHeight }, () => Array(gridWidth).fill(null));
let currentTetrimino = null;
let score = 0;

// Tetrimino shapes (in a 4x4 grid format)
const TETROMINOS = {
    I: [
        [[1, 1, 1, 1]]
    ],
    O: [
        [[1, 1],
         [1, 1]]
    ],
    T: [
        [[0, 1, 0],
         [1, 1, 1]]
    ],
    S: [
        [[0, 1, 1],
         [1, 1, 0]]
    ],
    Z: [
        [[1, 1, 0],
         [0, 1, 1]]
    ],
    J: [
        [[1, 0, 0],
         [1, 1, 1]]
    ],
    L: [
        [[0, 0, 1],
         [1, 1, 1]]
    ]
};

const COLORS = {
    I: 'cyan',
    O: 'yellow',
    T: 'purple',
    S: 'green',
    Z: 'red',
    J: 'blue',
    L: 'orange'
};

// Create an empty grid
function createGrid() {
    gridElement.innerHTML = ''; // Clear existing grid
    grid.forEach((row, rowIndex) => {
        row.forEach((cell, colIndex) => {
            const cellElement = document.createElement("div");
            cellElement.classList.add("grid-cell");
            gridElement.appendChild(cellElement);
        });
    });
}

// Generate a random Tetrimino
function generateTetrimino() {
    const shapes = Object.keys(TETROMINOS);
    const shape = shapes[Math.floor(Math.random() * shapes.length)];
    const blocks = TETROMINOS[shape];
    return {
        shape,
        color: COLORS[shape],
        blocks: blocks[0],  // Start with the first rotation
        x: Math.floor(gridWidth / 2) - 1,  // Start position (centered)
        y: 0,  // Start at the top
    };
}

// Draw the current Tetrimino on the grid
function drawTetrimino() {
    const blocks = currentTetrimino.blocks;
    blocks.forEach((row, y) => {
        row.forEach((cell, x) => {
            if (cell === 1) {
                const cellIndex = (currentTetrimino.y + y) * gridWidth + (currentTetrimino.x + x);
                gridElement.children[cellIndex].style.backgroundColor = currentTetrimino.color;
            }
        });
    });
}

// Remove the Tetrimino from the grid
function removeTetrimino() {
    const blocks = currentTetrimino.blocks;
    blocks.forEach((row, y) => {
        row.forEach((cell, x) => {
            if (cell === 1) {
                const cellIndex = (currentTetrimino.y + y) * gridWidth + (currentTetrimino.x + x);
                gridElement.children[cellIndex].style.backgroundColor = '#222';  // Reset the cell color
            }
        });
    });
}

// Move the Tetrimino down by one step
function moveTetriminoDown() {
    removeTetrimino();
    currentTetrimino.y++;
    if (checkCollision()) {
        currentTetrimino.y--;  // Undo the move
        placeTetrimino();
        return true;
    }
    drawTetrimino();
    return false;
}

// Place the Tetrimino on the grid
function placeTetrimino() {
    const blocks = currentTetrimino.blocks;
    blocks.forEach((row, y) => {
        row.forEach((cell, x) => {
            if (cell === 1) {
                const cellIndex = (currentTetrimino.y + y) * gridWidth + (currentTetrimino.x + x);
                gridElement.children[cellIndex].style.backgroundColor = currentTetrimino.color;
                grid[currentTetrimino.y + y][currentTetrimino.x + x] = currentTetrimino.color;
            }
        });
    });
    checkLines();
    currentTetrimino = generateTetrimino();
}

// Rotate the Tetrimino
function rotateTetrimino() {
    const rotatedBlocks = [];
    for (let y = 0; y < currentTetrimino.blocks[0].length; y++) {
        rotatedBlocks[y] = [];
        for (let x = 0; x < currentTetrimino.blocks.length; x++) {
            rotatedBlocks[y][x] = currentTetrimino.blocks[currentTetrimino.blocks.length - 1 - x][y];
        }
    }
    currentTetrimino.blocks = rotatedBlocks;
    if (checkCollision()) {
        currentTetrimino.blocks = currentTetrimino.blocks; // Undo rotation if collision
    }
}

// Move the Tetrimino left
function moveTetriminoLeft() {
    removeTetrimino();
    currentTetrimino.x--;
    if (checkCollision()) {
        currentTetrimino.x++;  // Undo move
    }
    drawTetrimino();
}

// Move the Tetrimino right
function moveTetriminoRight() {
    removeTetrimino();
    currentTetrimino.x++;
    if (checkCollision()) {
        currentTetrimino.x--;  // Undo move
    }
    drawTetrimino();
}

// Check for collision with other blocks or the grid boundaries
function checkCollision() {
    const blocks = currentTetrimino.blocks;
    for (let y = 0; y < blocks.length; y++) {
        for (let x = 0; x < blocks[y].length; x++) {
            if (blocks[y][x] === 1) {
                const gridX = currentTetrimino.x + x;
                const gridY = currentTetrimino.y + y;
                if (gridX < 0 || gridX >= gridWidth || gridY >= gridHeight || grid[gridY][gridX]) {
                    return true;
                }
            }
        }
    }
    return false;
}

// Check for and clear any full lines
function checkLines() {
    for (let row = gridHeight - 1; row >= 0; row--) {
        if (grid[row].every(cell => cell !== null)) {
            // Clear the line
            score += 100;
            scoreElement.textContent = `Score: ${score}`;
            grid.splice(row, 1);
            grid.unshift(Array(gridWidth).fill(null));
            updateGrid();
        }
    }
}

// Update the grid display after clearing lines
function updateGrid() {
    gridElement.innerHTML = '';
    grid.forEach((row, rowIndex) => {
        row.forEach((cell, colIndex) => {
            const cellElement = document.createElement("div");
            cellElement.classList.add("grid-cell");
            if (cell !== null) {
                cellElement.style.backgroundColor = cell;
            }
            gridElement.appendChild(cellElement);
        });
    });
}

// Handle key presses
document.addEventListener('keydown', (e) => {
    if (e.key === 'w') {
        rotateTetrimino();
    } else if (e.key === 'a') {
        moveTetriminoLeft();
    } else if (e.key === 's') {
        if (moveTetriminoDown()) {
            placeTetrimino();
        }
    } else if (e.key === 'd') {
        moveTetriminoRight();
    }
});

// Game loop
function gameLoop() {
    if (moveTetriminoDown()) {
        placeTetrimino();
    }
    setTimeout(gameLoop, 500);
}

// Start the game
createGrid();
currentTetrimino = generateTetrimino();
gameLoop();
