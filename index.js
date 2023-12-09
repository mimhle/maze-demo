const width = 500;
const height = 500;
const pixelSize = 25;

if (width % pixelSize !== 0 || height % pixelSize !== 0) {
    throw new Error("width and height must be divisible by pixelSize");
}

let maze = new Maze(width / pixelSize, height / pixelSize)
let generator = null
let solver = null

function setup() {
    pixelDensity(1);
    let canvas = createCanvas(width, height);
    canvas.parent("canvas");
    frameRate(60);
    noLoop();
}

function draw() {
    background(255);
    if (generator) {
        const done = generator?.next().done;
        if (done) {
            noLoop();
            generator = null;
        }
    } else if (solver) {
        drawMaze(maze);
        const done = solver?.next().done;
        if (done) {
            noLoop();
            solver = null;
        }
    }
}

function btnGenerate_Click() {
    loop();
    if ((generator?.next().done || generator === null) && (solver?.next().done || solver === null)) {
        maze = new Maze(width / pixelSize, height / pixelSize);
        generator = visualizeGenerate(
            getGenAlg(),
            maze,
            Math.floor(Math.random() * maze.size.width),
            Math.floor(Math.random() * maze.size.height),
            !document.getElementById("animateCheckbox")?.checked
        );
    }
}

function btnSolve_Click() {
    loop();
    if ((solver?.next().done || solver === null) && (generator?.next().done || generator === null)) {
        maze.resetVisited();
        maze.resetPath();
        solver = visualizeSolve(
            getSolverAlg(),
            maze,
            0,
            0,
            maze.size.width - 1,
            maze.size.height - 1,
            !document.getElementById("animateCheckbox")?.checked
        );
    }
}

function* visualizeGenerate(alg, maze, x, y, fast = false) {
    const generator = alg(maze, x, y);
    let done = false;
    let value = null;
    while (!done) {
        const obj = generator.next();
        done = obj.done;
        value = obj.value;
        if (fast) continue;
        drawMaze(value);
        yield value;
    }
    drawMaze(value);
    return value;
}

function* visualizeSolve(alg, maze, startX, startY, endX = maze.size.width - 1, endY = maze.size.height - 1, fast = false) {
    const solver = alg(maze, startX, startY, endX, endY);
    let done = false;
    let value = null;
    while (!done) {
        const obj = solver.next();
        done = obj.done;
        value = obj.value;
        if (fast) continue;
        drawVisited(value);
        drawPath(value);
        yield value;
    }
    drawVisited(value);
    drawPath(value);
    return value;
}

function drawCell(x, y, cell) {
    const [top, right, bottom, left] = cell;
    strokeWeight(1);
    stroke(0);
    if (top === 1) {
        line(x, y, x + pixelSize, y);
    }
    if (right === 1) {
        line(x + pixelSize, y, x + pixelSize, y + pixelSize);
    }
    if (bottom === 1) {
        line(x, y + pixelSize, x + pixelSize, y + pixelSize);
    }
    if (left === 1) {
        line(x, y, x, y + pixelSize);
    }
}

function highlightCell(x, y, color) {
    fill(color);
    strokeWeight(2);
    point(x * pixelSize + pixelSize / 2, y * pixelSize + pixelSize / 2);
}

function drawMaze(maze) {
    stroke(0);
    for (let i = 0; i < maze.size.width; i++) {
        for (let j = 0; j < maze.size.height; j++) {
            const cell = maze.getMaze(i, j);
            drawCell(i * pixelSize, j * pixelSize, cell);
        }
    }
}

function drawVisited(maze) {
    for (let i = 0; i < maze.size.width; i++) {
        for (let j = 0; j < maze.size.height; j++) {
            if (maze.visited[i][j]) {
                highlightCell(i, j, color(0, 0, 255));
            }
        }
    }
}

function drawPath(maze) {
    for (let i = 0; i < maze.path.length; i++) {
        const [x1, y1, x2, y2] = maze.path[i];
        strokeWeight(2);
        stroke(255, 0, 0);
        line(x1 * pixelSize + pixelSize / 2, y1 * pixelSize + pixelSize / 2, x2 * pixelSize + pixelSize / 2, y2 * pixelSize + pixelSize / 2);
    }
}