// --- Utility Functions ---

/**
 * Displays a temporary message in a box at the top of the screen.
 * @param {string} message - The message to display.
 * @param {number} duration - How long the message should be visible in milliseconds.
 */
function showMessage(message, duration = 3000) {
    const messageBox = document.getElementById('messageBox');
    messageBox.textContent = message;
    messageBox.classList.add('show');
    setTimeout(() => {
        messageBox.classList.remove('show');
    }, duration);
}

/**
 * Generates a random integer within a specified range (inclusive).
 * @param {number} min - The minimum value.
 * @param {number} max - The maximum value.
 * @returns {number} A random integer.
 */
function getRandomInt(min, max) {
    min = Math.ceil(min);
    max = Math.floor(max);
    return Math.floor(Math.random() * (max - min + 1)) + min;
}

/**
 * Generates an HSL color string from hue, saturation, and lightness ranges.
 * @param {number[]} hueRange - [minHue, maxHue]
 * @param {number[]} satRange - [minSaturation, maxSaturation]
 * @param {number[]} ligRange - [minLightness, maxLightness]
 * @returns {string} An HSL color string (e.g., "hsl(120, 50%, 70%)").
 */
function generateHSLColor(hueRange, satRange, ligRange) {
    const h = getRandomInt(hueRange[0], hueRange[1]);
    const s = getRandomInt(satRange[0], satRange[1]);
    const l = getRandomInt(ligRange[0], ligRange[1]);
    return `hsl(${h}, ${s}%, ${l}%)`;
}

// --- Canvas and Game Setup ---

const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');

// Define the size of each "pixel" in our simulation grid
const PIXEL_SIZE = 4;
let GRID_WIDTH;  // Will be calculated based on canvas width
let GRID_HEIGHT; // Will be calculated based on canvas height

// Define material types using numerical constants for efficiency
// Assign unique, sequential IDs starting from 0
const EMPTY = 0;
const SAND = 1;
const STONE = 2;
const METAL = 3;
const GLASS = 4;
const SALT = 5;
const CORN_STARCH = 6;
const WATER = 7;
const OIL = 8;
const LAVA = 9;
const SLIME = 10;
const ACID = 11;
const STEAM = 12;
const HELIUM = 13;
const SMOKE = 14;
const CLOUD = 15;
const FIRE = 16;
const EXPLOSIVE = 17;
const ICE = 18;
const SNOW = 19;
const BOUNCY = 20;
const ELECTRICITY = 21;
const MAGNET = 22;
const ANTIMATTER = 23;
const SAND_CLONE = 24;
const PLANT = 25;

// Define material properties including color ranges, weight, stickiness, solid, selfSticky
const MATERIALS = {
    [EMPTY]: {
        name: "Eraser",
        hueRange: [0, 0], satRange: [0, 0], ligRange: [6, 7], // Matches canvas background #0d1117
        solid: false, weight: 0, stickiness: 0,
        buttonColor: '#e2e8f0', buttonTextColor: '#2d3748',
        category: 'tools'
    },
    // Solids
    [STONE]: {
        name: "Stone",
        hueRange: [215, 248], satRange: [8, 31], ligRange: [45, 55],
        solid: true, weight: Infinity, stickiness: Infinity,
        buttonColor: 'hsl(230, 20%, 50%)', buttonTextColor: '#e2e8f0',
        category: 'solids'
    },
    [METAL]: {
        name: "Metal",
        hueRange: [200, 210], satRange: [5, 15], ligRange: [30, 40],
        solid: true, weight: Infinity, stickiness: Infinity,
        buttonColor: 'hsl(205, 10%, 35%)', buttonTextColor: '#e2e8f0',
        category: 'solids'
    },
    [GLASS]: {
        name: "Glass",
        hueRange: [180, 200], satRange: [5, 10], ligRange: [70, 80],
        solid: true, weight: Infinity, stickiness: Infinity,
        buttonColor: 'hsl(190, 7%, 75%)', buttonTextColor: '#2d3748',
        category: 'solids'
    },
    // Powders
    [SAND]: {
        name: "Sand",
        hueRange: [38, 38], satRange: [66, 88], ligRange: [60, 70],
        solid: false, weight: 1, stickiness: 0.5,
        buttonColor: '#f6ad55', buttonTextColor: '#2d3748',
        category: 'powders'
    },
    [SALT]: {
        name: "Salt",
        hueRange: [0, 0], satRange: [0, 5], ligRange: [90, 95],
        solid: false, weight: 0.9, stickiness: 0.4, // Slightly lighter/less sticky than sand
        buttonColor: 'hsl(0, 2%, 92%)', buttonTextColor: '#2d3748',
        category: 'powders'
    },
    [CORN_STARCH]: {
        name: "Corn Starch",
        hueRange: [38, 47], satRange: [60, 88], ligRange: [79, 80],
        solid: false, weight: 1, stickiness: 0.8, // More sticky than sand
        buttonColor: 'hsl(40, 70%, 79%)', buttonTextColor: '#2d3748',
        category: 'powders'
    },
    [SAWDUST]: {
        name: "Sawdust",
        hueRange: [20, 30], satRange: [30, 40], ligRange: [50, 60],
        solid: false, weight: 0.8, stickiness: 0.6, // Lighter than sand, slightly stickier
        buttonColor: 'hsl(25, 35%, 55%)', buttonTextColor: '#e2e8f0',
        category: 'powders'
    },
    // Liquids
    [WATER]: {
        name: "Water",
        hueRange: [200, 220], satRange: [70, 90], ligRange: [50, 60],
        solid: false, weight: 0.7, stickiness: 0, // Very fluid
        buttonColor: 'hsl(210, 80%, 55%)', buttonTextColor: '#e2e8f0',
        category: 'liquids'
    },
    [OIL]: {
        name: "Oil",
        hueRange: [40, 60], satRange: [80, 90], ligRange: [20, 30],
        solid: false, weight: 0.6, stickiness: 0.1, // Slightly less dense than water, still fluid
        buttonColor: 'hsl(50, 85%, 25%)', buttonTextColor: '#e2e8f0',
        category: 'liquids'
    },
    [LAVA]: {
        name: "Lava",
        hueRange: [0, 30], satRange: [90, 100], ligRange: [40, 60],
        solid: false, weight: 1.5, stickiness: 0.3, // Heavy, flows
        buttonColor: 'hsl(15, 95%, 50%)', buttonTextColor: '#e2e8f0',
        category: 'liquids'
    },
    [SLIME]: {
        name: "Slime",
        hueRange: [100, 120], satRange: [70, 90], ligRange: [50, 60],
        solid: false, weight: 0.9, stickiness: 0.7, // Sticky liquid
        buttonColor: 'hsl(110, 80%, 55%)', buttonTextColor: '#2d3748',
        category: 'liquids'
    },
    [ACID]: {
        name: "Acid",
        hueRange: [70, 90], satRange: [80, 95], ligRange: [40, 50],
        solid: false, weight: 0.7, stickiness: 0, // Fluid, corrosive (no reaction logic)
        buttonColor: 'hsl(80, 85%, 45%)', buttonTextColor: '#2d3748',
        category: 'liquids'
    },
    [GLUE]: {
        name: "Glue",
        hueRange: [20, 39], satRange: [20, 28], ligRange: [80, 90],
        solid: false, weight: 0.5, stickiness: 0.9, // Lighter, very sticky (for diagonal flow)
        selfSticky: true, // New property for sticking to itself in the air
        buttonColor: 'hsl(30, 24%, 85%)', buttonTextColor: '#2d3748',
        category: 'liquids'
    },
    // Gases
    [STEAM]: {
        name: "Steam",
        hueRange: [200, 220], satRange: [5, 15], ligRange: [80, 90],
        solid: false, weight: -0.1, stickiness: 0, // Floats upwards
        buttonColor: 'hsl(210, 10%, 85%)', buttonTextColor: '#2d3748',
        category: 'gases'
    },
    [HELIUM]: {
        name: "Helium",
        hueRange: [20, 40], satRange: [5, 10], ligRange: [90, 95],
        solid: false, weight: -0.5, stickiness: 0, // Floats rapidly upwards
        buttonColor: 'hsl(30, 7%, 92%)', buttonTextColor: '#2d3748',
        category: 'gases'
    },
    [SMOKE]: {
        name: "Smoke",
        hueRange: [0, 0], satRange: [0, 10], ligRange: [20, 30],
        solid: false, weight: -0.05, stickiness: 0, // Drifts upwards slowly
        buttonColor: 'hsl(0, 5%, 25%)', buttonTextColor: '#e2e8f0',
        category: 'gases'
    },
    [CLOUD]: {
        name: "Cloud",
        hueRange: [0, 0], satRange: [0, 5], ligRange: [85, 95],
        solid: false, weight: -0.02, stickiness: 0, // Drifts very slowly upwards
        buttonColor: 'hsl(0, 2%, 90%)', buttonTextColor: '#2d3748',
        category: 'gases'
    },
    // Misc
    [FIRE]: {
        name: "Fire",
        hueRange: [0, 60], satRange: [90, 100], ligRange: [50, 70],
        solid: false, weight: -0.2, stickiness: 0, // Floats upwards, consumes (no consumption logic)
        buttonColor: 'hsl(30, 95%, 60%)', buttonTextColor: '#2d3748',
        category: 'misc'
    },
    [EXPLOSIVE]: {
        name: "Explosive",
        hueRange: [0, 10], satRange: [50, 70], ligRange: [20, 30],
        solid: true, weight: Infinity, stickiness: Infinity, // Solid, but could explode (no explosion logic)
        buttonColor: 'hsl(5, 60%, 25%)', buttonTextColor: '#e2e8f0',
        category: 'misc'
    },
    [ICE]: {
        name: "Ice",
        hueRange: [200, 220], satRange: [10, 20], ligRange: [75, 85],
        solid: true, weight: Infinity, stickiness: Infinity, // Solid, melts into water (no melting logic)
        buttonColor: 'hsl(210, 15%, 80%)', buttonTextColor: '#2d3748',
        category: 'misc'
    },
    [SNOW]: {
        name: "Snow",
        hueRange: [0, 0], satRange: [0, 5], ligRange: [95, 100],
        solid: false, weight: 0.3, stickiness: 0.7, // Powder, melts (no melting logic)
        buttonColor: 'hsl(0, 2%, 97%)', buttonTextColor: '#2d3748',
        category: 'misc'
    },
    [BOUNCY]: {
        name: "Bouncy",
        hueRange: [120, 140], satRange: [80, 90], ligRange: [50, 60],
        solid: true, weight: Infinity, stickiness: Infinity, // Solid, makes things bounce (no bounce logic)
        buttonColor: 'hsl(130, 85%, 55%)', buttonTextColor: '#2d3748',
        category: 'misc'
    },
    [ELECTRICITY]: {
        name: "Electricity",
        hueRange: [40, 60], satRange: [90, 100], ligRange: [70, 80],
        solid: false, weight: 0, stickiness: 0, // Instantaneous effect (no electrical logic)
        buttonColor: 'hsl(50, 95%, 75%)', buttonTextColor: '#2d3748',
        category: 'misc'
    },
    [MAGNET]: {
        name: "Magnet",
        hueRange: [240, 260], satRange: [10, 20], ligRange: [20, 30],
        solid: true, weight: Infinity, stickiness: Infinity, // Solid, attracts metal (no magnetic logic)
        buttonColor: 'hsl(250, 15%, 25%)', buttonTextColor: '#e2e8f0',
        category: 'misc'
    },
    [ANTIMATTER]: {
        name: "Antimatter",
        hueRange: [300, 320], satRange: [90, 100], ligRange: [50, 60],
        solid: false, weight: 0.1, stickiness: 0, // Reacts with everything (no reaction logic)
        buttonColor: 'hsl(310, 95%, 55%)', buttonTextColor: '#e2e8f0',
        category: 'misc'
    },
    [SAND_CLONE]: {
        name: "Sand Clone",
        hueRange: [38, 38], satRange: [66, 88], ligRange: [60, 70], // Same as sand
        solid: false, weight: 1, stickiness: 0.5,
        buttonColor: '#f6ad55', buttonTextColor: '#2d3748',
        category: 'misc' // Could be used for a "copy" tool
    },
    [PLANT]: {
        name: "Plant",
        hueRange: [90, 110], satRange: [40, 60], ligRange: [30, 40],
        solid: true, weight: Infinity, stickiness: Infinity, // Solid, grows (no growth logic)
        buttonColor: 'hsl(100, 50%, 35%)', buttonTextColor: '#e2e8f0',
        category: 'misc'
    },
    [UNICORN_FLESH]: {
        name: "Unicorn Flesh",
        hueRange: [330, 350], satRange: [80, 88], ligRange: [68, 80],
        solid: false, weight: 1, stickiness: 0.2, // More fluid
        buttonColor: 'hsl(340, 84%, 74%)', buttonTextColor: '#2d3748',
        category: 'misc'
    },
};


let grid = []; // The 2D array representing our game world
let currentMaterial = SAND; // Default material to draw with
let isDrawing = false;      // Flag to track if the user is currently drawing
let lastX = -1, lastY = -1; // Stores the last drawn grid coordinates for line drawing
let brushSize = 1;          // Initial brush size

let frameCount = 0; // Used to alternate horizontal iteration direction for physics simulation

/**
 * Resizes the canvas to fit the window and reinitializes the grid if dimensions change.
 */
function resizeCanvas() {
    // Calculate max dimensions for the canvas, leaving space for the sidebar
    const gameContainer = document.querySelector('.game-container');
    const sidebarWidth = 250; // Fixed sidebar width from CSS

    // Determine canvas dimensions based on available space and pixel size
    let canvasWidth = Math.floor((window.innerWidth * 0.9 - sidebarWidth) / PIXEL_SIZE) * PIXEL_SIZE;
    let canvasHeight = Math.floor((window.innerHeight * 0.9) / PIXEL_SIZE) * PIXEL_SIZE;

    // Ensure minimum canvas size
    if (canvasWidth < PIXEL_SIZE * 50) canvasWidth = PIXEL_SIZE * 50;
    if (canvasHeight < PIXEL_SIZE * 50) canvasHeight = PIXEL_SIZE * 50;

    canvas.width = canvasWidth;
    canvas.height = canvasHeight;

    // Update grid dimensions
    GRID_WIDTH = canvas.width / PIXEL_SIZE;
    GRID_HEIGHT = canvas.height / PIXEL_SIZE;

    // Reinitialize grid if it's the first time or if canvas dimensions have changed
    if (grid.length === 0 || grid.length !== GRID_HEIGHT || grid[0].length !== GRID_WIDTH) {
        initGrid();
    }
    drawGrid(); // Redraw the grid after resizing
}

/**
 * Initializes the grid with all EMPTY pixels.
 * Each pixel will store its material type and a dynamically generated color.
 */
function initGrid() {
    grid = Array(GRID_HEIGHT).fill(0).map(() => Array(GRID_WIDTH).fill(0).map(() => ({
        type: EMPTY,
        // Use the exact canvas background color for empty pixels for seamless clearing
        color: '#0d1117'
    })));
}

/**
 * Draws the current state of the grid onto the canvas.
 */
function drawGrid() {
    for (let y = 0; y < GRID_HEIGHT; y++) {
        for (let x = 0; x < GRID_WIDTH; x++) {
            // Use the stored color for each pixel
            ctx.fillStyle = grid[y][x].color;
            ctx.fillRect(x * PIXEL_SIZE, y * PIXEL_SIZE, PIXEL_SIZE, PIXEL_SIZE); // Draw the pixel
        }
    }
}

/**
 * Sets the material of a specific pixel in the grid.
 * Ensures coordinates are within bounds.
 * Dynamically generates a color for the pixel based on the material's HSL ranges.
 * @param {number} gx - Grid X coordinate.
 * @param {number} gy - Grid Y coordinate.
 * @param {number} materialType - The material type (EMPTY, SAND, SOLID, etc.).
 */
function setPixel(gx, gy, materialType) {
    if (gx >= 0 && gx < GRID_WIDTH && gy >= 0 && gy < GRID_HEIGHT) {
        const materialProps = MATERIALS[materialType];
        let pixelColor;

        if (materialProps.hueRange) {
            // Generate a random color from the material's spectrum
            pixelColor = generateHSLColor(
                materialProps.hueRange,
                materialProps.satRange,
                materialProps.ligRange
            );
        } else {
            // For materials without hueRange (like EMPTY), use their fixed 'color' property
            pixelColor = materialProps.color;
        }

        grid[gy][gx] = {
            type: materialType,
            color: pixelColor
        };
    }
}

/**
 * Draws a pixel or a square of pixels based on brushSize.
 * @param {number} gx - Grid X coordinate.
 * @param {number} gy - Grid Y coordinate.
 * @param {number} material - The material to draw.
 * @param {number} size - The brush size.
 */
function drawBrush(gx, gy, material, size) {
    const halfSize = Math.floor(size / 2);
    for (let yOffset = -halfSize; yOffset <= halfSize; yOffset++) {
        for (let xOffset = -halfSize; xOffset <= halfSize; xOffset++) {
            setPixel(gx + xOffset, gy + yOffset, material);
        }
    }
}

/**
 * Implements Bresenham's Line Algorithm to draw a line of pixels.
 * This creates smoother drawing when dragging the mouse/finger.
 * @param {number} x0 - Starting X grid coordinate.
 * @param {number} y0 - Starting Y grid coordinate.
 * @param {number} x1 - Ending X grid coordinate.
 * @param {number} y1 - Ending Y grid coordinate.
 * @param {number} material - The material to draw.
 * @param {number} size - The brush size.
 */
function drawLine(x0, y0, x1, y1, material, size) {
    const dx = Math.abs(x1 - x0);
    const dy = Math.abs(y1 - y0);
    const sx = (x0 < x1) ? 1 : -1;
    const sy = (y0 < y1) ? 1 : -1;
    let err = dx - dy; // Error term

    while (true) {
        drawBrush(x0, y0, material, size); // Draw current pixel with brush size
        if (x0 === x1 && y0 === y1) break; // End of line

        const e2 = 2 * err;
        if (e2 > -dy) { err -= dy; x0 += sx; } // Move along X
        if (e2 < dx) { err += dx; y0 += sy; } // Move along Y
    }
}

// --- User Interaction (Drawing) ---

/**
 * Handles the start of drawing (mouse down or touch start).
 * @param {MouseEvent|TouchEvent} event - The event object.
 */
function startDrawing(event) {
    isDrawing = true;
    const rect = canvas.getBoundingClientRect(); // Get canvas position and size
    let clientX, clientY;

    // Differentiate between mouse and touch events
    if (event.touches) {
        clientX = event.touches[0].clientX;
        clientY = event.touches[0].clientY;
    } else {
        clientX = event.clientX;
        clientY = event.clientY;
    }

    // Convert screen coordinates to grid coordinates
    const gx = Math.floor((clientX - rect.left) / PIXEL_SIZE);
    const gy = Math.floor((clientY - rect.top) / PIXEL_SIZE);

    drawBrush(gx, gy, currentMaterial, brushSize); // Draw the initial pixel with brush size
    lastX = gx; // Store for line drawing
    lastY = gy;
}

/**
 * Handles drawing while the mouse/touch is moving.
 * @param {MouseEvent|TouchEvent} event - The event object.
 */
function draw(event) {
    if (!isDrawing) return; // Only draw if drawing is active
    event.preventDefault(); // Prevent default browser actions (like scrolling on touch)

    const rect = canvas.getBoundingClientRect();
    let clientX, clientY;

    if (event.touches) {
        clientX = event.touches[0].clientX;
        clientY = event.touches[0].clientY;
    } else {
        clientX = event.clientX;
        clientY = event.clientY;
    }

    const gx = Math.floor((clientX - rect.left) / PIXEL_SIZE);
    const gy = Math.floor((clientY - rect.top) / PIXEL_SIZE);

    // Draw a line if the current position is different from the last
    if (gx !== lastX || gy !== lastY) {
        drawLine(lastX, lastY, gx, gy, currentMaterial, brushSize);
        lastX = gx;
        lastY = gy;
    }
}

/**
 * Handles the end of drawing (mouse up or touch end).
 */
function stopDrawing() {
    isDrawing = false;
    lastX = -1; // Reset last coordinates
    lastY = -1;
}

// --- Sand Physics Logic ---

/**
 * Updates the state of sand pixels based on gravity and collision rules.
 * Iterates from bottom-up to ensure correct falling behavior.
 * Alternates horizontal iteration direction to prevent bias in spreading.
 */
function updatePhysics() {
    // Determine horizontal iteration direction based on frame count
    const startX = (frameCount % 2 === 0) ? 0 : GRID_WIDTH - 1;
    const endX = (frameCount % 2 === 0) ? GRID_WIDTH : -1;
    const stepX = (frameCount % 2 === 0) ? 1 : -1;

    // Create a new grid for the next state to avoid reading from partially updated cells
    let nextGrid = JSON.parse(JSON.stringify(grid)); // Deep copy the grid

    // Iterate through the grid from bottom to top
    for (let y = GRID_HEIGHT - 1; y >= 0; y--) {
        for (let x = startX; x !== endX; x += stepX) {
            const currentPixel = grid[y][x]; // Read from current grid state
            const currentPixelType = currentPixel.type;

            // Only apply physics to materials that are not EMPTY or SOLID (immovable)
            if (currentPixelType !== EMPTY && MATERIALS[currentPixelType].solid === false) {
                const materialProperties = MATERIALS[currentPixelType];
                const currentWeight = materialProperties.weight;
                const currentStickiness = materialProperties.stickiness;
                const isSelfSticky = materialProperties.selfSticky || false;

                let moved = false;
                let targetY = y;
                let targetX = x;

                // 1. Check for self-sticky behavior (e.g., Glue)
                if (isSelfSticky) {
                    let isSupported = false;
                    // Check directly below
                    if (y + 1 < GRID_HEIGHT && nextGrid[y+1][x].type !== EMPTY) {
                        isSupported = true;
                    }
                    // Check left neighbor for self-sticky support
                    if (!isSupported && x > 0 && nextGrid[y][x-1].type === currentPixelType) {
                        if (y + 1 < GRID_HEIGHT && nextGrid[y+1][x-1].type !== EMPTY) {
                            isSupported = true;
                        }
                    }
                    // Check right neighbor for self-sticky support
                    if (!isSupported && x < GRID_WIDTH - 1 && nextGrid[y][x+1].type === currentPixelType) {
                        if (y + 1 < GRID_HEIGHT && nextGrid[y+1][x+1].type !== EMPTY) {
                            isSupported = true;
                        }
                    }

                    if (isSupported) {
                        // This pixel is supported by a solid or another sticky pixel, so it doesn't fall.
                        continue; // Skip further physics for this pixel in this frame
                    }
                }

                // 2. Try to fall straight down (gravity)
                // Always try to fall at least 1 pixel if empty below
                if (y + 1 < GRID_HEIGHT && nextGrid[y+1][x].type === EMPTY) {
                    let actualFallDistance = 1;
                    if (currentWeight >= 1) { // Only heavier materials gain "velocity"
                        for (let i = 2; i <= currentWeight; i++) { // Check for extra fall distance
                            if (y + i < GRID_HEIGHT && nextGrid[y+i][x].type === EMPTY) {
                                actualFallDistance = i;
                            } else {
                                break; // Path blocked
                            }
                        }
                    }
                    targetY = y + actualFallDistance;
                    moved = true;
                }

                // 3. If not moved straight down, try to move sideways/diagonally
                if (!moved && y + 1 < GRID_HEIGHT) {
                    // Alternate check order to prevent horizontal bias
                    const checkOrder = (frameCount % 2 === 0) ? [-1, 1] : [1, -1]; // dx: -1 for left, 1 for right

                    for (const dx of checkOrder) {
                        const newX = x + dx;

                        // Check if new diagonal position is within bounds and empty
                        if (newX >= 0 && newX < GRID_WIDTH && nextGrid[y+1][newX].type === EMPTY) {
                            // Apply stickiness rule:
                            // If stickiness is 0 (water-like), it can flow even if the side cell is occupied.
                            // If stickiness > 0 (sand-like), it requires the side cell (grid[y][newX]) to be empty to flow diagonally.
                            if (currentStickiness === 0 || nextGrid[y][newX].type === EMPTY) {
                                targetY = y + 1;
                                targetX = newX;
                                moved = true;
                                break; // Stop after finding a valid move
                            }
                        }
                    }
                }

                // 4. Handle gases (negative weight - float upwards)
                if (materialProperties.weight < 0) {
                    let floatDistance = 0;
                    for (let i = 1; i <= Math.abs(materialProperties.weight * 10); i++) { // Scale negative weight for speed
                        if (y - i >= 0 && nextGrid[y-i][x].type === EMPTY) {
                            floatDistance = i;
                        } else {
                            break;
                        }
                    }
                    if (floatDistance > 0) {
                        targetY = y - floatDistance;
                        targetX = x; // Gases typically don't move sideways unless blocked
                        moved = true;
                    }
                }


                // Apply the movement to the nextGrid
                if (moved) {
                    nextGrid[targetY][targetX] = currentPixel;
                    nextGrid[y][x] = { type: EMPTY, color: MATERIALS[EMPTY].color };
                }
            }
        }
    }
    grid = nextGrid; // Update the main grid with the new state
    frameCount++; // Increment frame count for alternating direction
}

// --- Main Game Loop ---

/**
 * The main game loop that continuously updates physics and redraws the grid.
 */
function gameLoop() {
    updatePhysics(); // Apply sand physics
    drawGrid();      // Redraw the entire grid
    requestAnimationFrame(gameLoop); // Request next frame
}

// --- UI Interaction ---

/**
 * Dynamically creates and attaches buttons for each material.
 */
function createMaterialButtons() {
    const categories = {
        solids: document.getElementById('solids-content'),
        powders: document.getElementById('powders-content'),
        liquids: document.getElementById('liquids-content'),
        gases: document.getElementById('gases-content'),
        misc: document.getElementById('misc-content')
    };

    // Iterate through MATERIALS and create buttons for each category
    for (const type in MATERIALS) {
        const material = MATERIALS[type];
        if (material.category && categories[material.category]) {
            // Skip EMPTY as it's handled by the Eraser tool button
            if (material.type === EMPTY) continue;

            const button = document.createElement('div');
            button.id = `${material.name.replace(/\s/g, '')}Btn`;
            button.className = 'material-button';
            button.setAttribute('data-material', type); // Store material type as data attribute

            const swatch = document.createElement('div');
            swatch.className = 'material-color-swatch';
            // For material buttons, use the fixed buttonColor for consistent UI
            swatch.style.backgroundColor = material.buttonColor;

            const nameSpan = document.createElement('span');
            nameSpan.textContent = material.name;

            button.appendChild(swatch);
            button.appendChild(nameSpan);

            button.addEventListener('click', () => {
                currentMaterial = parseInt(type); // Ensure type is number
                updateSelectedButton(button.id);
                showMessage(`Selected: ${material.name}`);
            });

            categories[material.category].appendChild(button);
        }
    }
}

/**
 * Updates the visual state of the material selection buttons.
 * @param {string} selectedId - The ID of the button that should appear selected.
 */
function updateSelectedButton(selectedId) {
    // Remove 'selected' class from all material buttons
    document.querySelectorAll('.material-button').forEach(button => {
        button.classList.remove('selected');
    });
    // Remove 'selected' class from tool buttons (Eraser)
    document.querySelectorAll('.tool-button').forEach(button => {
        button.classList.remove('selected');
    });

    const selectedButton = document.getElementById(selectedId);
    if (selectedButton) {
        selectedButton.classList.add('selected'); // Add 'selected' to the chosen button
    }
}

/**
 * Handles collapsible section headers.
 */
function setupCollapsibleSections() {
    document.querySelectorAll('.section-header').forEach(header => {
        header.addEventListener('click', () => {
            const content = header.nextElementSibling;
            header.classList.toggle('collapsed');
            content.classList.toggle('collapsed');
        });
        // Collapse all sections by default except Solids and Powders
        const sectionId = header.getAttribute('data-section');
        if (sectionId !== 'solids' && sectionId !== 'powders' && sectionId !== 'tools') {
             header.classList.add('collapsed');
             header.nextElementSibling.classList.add('collapsed');
        }
    });
}

// --- Event Listeners ---

// Mouse events for drawing
canvas.addEventListener('mousedown', startDrawing);
canvas.addEventListener('mousemove', draw);
canvas.addEventListener('mouseup', stopDrawing);
canvas.addEventListener('mouseleave', stopDrawing); // Stop drawing if mouse leaves canvas

// Touch events for mobile drawing
canvas.addEventListener('touchstart', (e) => {
    e.preventDefault(); // Prevent default browser actions like scrolling
    startDrawing(e);
}, { passive: false }); // Use passive: false to allow preventDefault
canvas.addEventListener('touchmove', (e) => {
    e.preventDefault(); // Prevent default browser actions like scrolling
    draw(e);
}, { passive: false });
canvas.addEventListener('touchend', stopDrawing);
canvas.addEventListener('touchcancel', stopDrawing); // Handle touch cancellation

// Tool button event listeners
document.getElementById('emptyBtn').addEventListener('click', () => {
    currentMaterial = EMPTY;
    updateSelectedButton('emptyBtn');
    showMessage('Selected: Eraser');
});
document.getElementById('clearBtn').addEventListener('click', () => {
    initGrid(); // Reset the grid to empty
    drawGrid(); // Redraw the cleared grid
    showMessage('Canvas Cleared!');
});

// Brush size slider listener
const brushSizeSlider = document.getElementById('brushSize');
const brushSizeValueSpan = document.getElementById('brushSizeValue');
brushSizeSlider.addEventListener('input', (event) => {
    brushSize = parseInt(event.target.value);
    brushSizeValueSpan.textContent = brushSize;
    showMessage(`Brush Size: ${brushSize}`);
});


// --- Initialization ---

// Listen for window resize events to make the canvas responsive
window.addEventListener('resize', resizeCanvas);

// Start the game when the window has fully loaded
window.onload = function() {
    resizeCanvas(); // Set initial canvas size and grid dimensions
    initGrid();     // Initialize the grid with empty pixels
    drawGrid();     // Draw the initial empty grid
    createMaterialButtons(); // Create dynamic buttons for materials
    setupCollapsibleSections(); // Make sections collapsible
    gameLoop();     // Start the main game simulation loop
    updateSelectedButton('SandBtn'); // Set the initial selected drawing tool
};
