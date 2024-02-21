noise.seed(Math.random());

// Adjustable values
const cellSize = 10;
const colors = ['red', 'orange', 'yellow'];
const rules = {
    // orange beats red, etc..
    'orange': 'red',
    'red': 'yellow',
    'yellow': 'orange',
};
const noiseFactor = 20; // determines the size of the Perlin noise.
let simulationSteps = 300; // After 300 steps we almost always have a stable situation.

// Stable values
const canvasWidth = 800;
const canvasHeight = 600;
const gridWidth = canvasWidth / cellSize;
const gridHeight = canvasHeight / cellSize;

// Create the grid
let grid = [];
for (let row = 0; row < gridHeight; row++) {
    grid[row] = [];
    for (let col = 0; col < gridWidth; col++) {
        const noiseValue = Math.abs(noise.simplex2(row / noiseFactor, col / noiseFactor));
        // const noiseValue = Math.random();
        const color = colors[Math.floor(noiseValue * colors.length)];
        grid[row][col] = {row, col, color, battles: false};
    }
}

// Setup board canvas
const canvas = document.getElementById('board');
canvas.width = canvasWidth;
canvas.height = canvasHeight;
const ctx = canvas.getContext('2d');

// Draw the grid
function draw() {
    for (let row = 0; row < gridHeight; row++) {
        for (let col = 0; col < gridWidth; col++) {
            const cell = grid[row][col];
            ctx.beginPath();
            ctx.rect(cell.col * cellSize, cell.row * cellSize, cellSize, cellSize);
            ctx.fillStyle = cell.color;
            ctx.fill();
        }
    }
}

// battle two cells
function battle(a, b, nextGrid) {
    if ( ! a.battles) {
        return;
    }

    nextGrid[b.row][b.col].battles = true;

    if (rules[a.color] === b.color) {
        nextGrid[b.row][b.col].color = a.color;
    } else {
        nextGrid[a.row][a.col].color = b.color;
    }
}

function next() {
    let nextGrid = JSON.parse(JSON.stringify(grid));

    // To change right, we move from right to left.
    for (let row = 0; row < gridHeight; row++) {
        for (let col = gridWidth-2; col >= 0; col--) {
            const right = grid[row][col+1];
            battle(grid[row][col], right, nextGrid);
        }
    }

    // To change bottom, we move from bottom to top.
    for (let col = 0; col < gridWidth; col++) {
        for (let row = gridHeight-2; row >= 0; row--) {
            const bottom = grid[row+1][col];
            battle(grid[row][col], bottom, nextGrid);
        }
    }

    // left
    for (let row = 0; row < gridHeight; row++) {
        for (let col = 1; col < gridWidth; col++) {
            const left = grid[row][col-1];
            battle(grid[row][col], left, nextGrid);
        }
    }

    // top
    for (let col = 0; col < gridWidth; col++) {
        for (let row = 1; row < gridHeight; row++) {
            const top = grid[row-1][col];
            battle(grid[row][col], top, nextGrid);
        }
    }

    return nextGrid;
}

// Start at the center
let rowCenter = Math.floor(grid.length / 2);
let colCenter = Math.floor(grid[0].length / 2);
grid[rowCenter][colCenter].battles = true;
draw();

// run the simulation for count times.
const intervalID = setInterval(function() {
    grid = next();
    draw();

    if (--simulationSteps <= 0) {
        clearInterval(intervalID);
    }
}, 100);
