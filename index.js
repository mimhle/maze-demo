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
    document.getElementById("canvas").oncontextmenu = () => false;
    frameRate(60);
}

function draw() {
    background(255);
    if (generator) {
        const done = generator?.next().done;
        if (done) {
            generator = null;
        }
    } else if (solver) {
        const done = solver?.next().done;
        if (done) {
            solver = null;
        }
    } else {
        drawMaze(maze);
        drawVisited(maze);
        drawPath(maze);
        drawWallHighlight();
    }
    drawStartEnd();
}

function drawWallHighlight() {
    stroke(0, 0, 100, 100);
    strokeWeight(pixelSize / 4);
    const leftWall = Math.floor(mouseX / pixelSize) * pixelSize;
    const topWall = Math.floor(mouseY / pixelSize) * pixelSize;
    const rightWall = leftWall + pixelSize;
    const bottomWall = topWall + pixelSize;
    const x = Math.floor(mouseX / pixelSize);
    const y = Math.floor(mouseY / pixelSize);
    const tolerance = pixelSize / 3;
    if (!(x < 0 || x >= maze.size.width || y < 0 || y >= maze.size.height)) {
        if (
            mouseX - leftWall < rightWall - mouseX
            && mouseX - leftWall < tolerance
            && x - 1 >= 0
            && x - 1 < maze.size.width
        ) {
            // line(x * pixelSize, y * pixelSize + pixelSize, x * pixelSize + pixelSize, y * pixelSize + pixelSize);
            line(x * pixelSize, y * pixelSize, x * pixelSize, y * pixelSize + pixelSize);
            if (mouseIsPressed && mouseButton === RIGHT) maze.connectCells(x, y, x - 1, y);
            else if (mouseIsPressed && mouseButton === LEFT) maze.disconnectCells(x, y, x - 1, y);
        }
        // if mouse is closer to right wall than left wall
        else if (
            rightWall - mouseX < mouseX - leftWall
            && rightWall - mouseX < tolerance
            && x + 1 < maze.size.width
            && x + 1 >= 0
        ) {
            // line(x * pixelSize, y * pixelSize + pixelSize, x * pixelSize + pixelSize, y * pixelSize + pixelSize);
            line(x * pixelSize + pixelSize, y * pixelSize, x * pixelSize + pixelSize, y * pixelSize + pixelSize);
            if (mouseIsPressed && mouseButton === RIGHT) maze.connectCells(x, y, x + 1, y);
            else if (mouseIsPressed && mouseButton === LEFT) maze.disconnectCells(x, y, x + 1, y);

        }
        // if mouse is closer to top wall than bottom wall
        else if (
            mouseY - topWall < bottomWall - mouseY
            && mouseY - topWall < tolerance
            && y - 1 >= 0
            && y - 1 < maze.size.height
        ) {
            line(x * pixelSize, y * pixelSize, x * pixelSize + pixelSize, y * pixelSize);
            if (mouseIsPressed && mouseButton === RIGHT) maze.connectCells(x, y, x, y - 1);
            else if (mouseIsPressed && mouseButton === LEFT) maze.disconnectCells(x, y, x, y - 1);
        }
        // if mouse is closer to bottom wall than top wall
        else if (
            bottomWall - mouseY < mouseY - topWall
            && bottomWall - mouseY < tolerance
            && y + 1 < maze.size.height
            && y + 1 >= 0
        ) {
            line(x * pixelSize, y * pixelSize + pixelSize, x * pixelSize + pixelSize, y * pixelSize + pixelSize);
            if (mouseIsPressed && mouseButton === RIGHT) maze.connectCells(x, y, x, y + 1);
            else if (mouseIsPressed && mouseButton === LEFT) maze.disconnectCells(x, y, x, y + 1);
        }
    }
}

function drawStartEnd() {
    const [startX, startY] = maze.start;
    const [endX, endY] = maze.end;
    highlightCell(startX, startY, color(0, 255, 0));
    highlightCell(endX, endY, color(255, 0, 0));
}

function btnGenerate_Click() {
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

function btnClear_Click() {
    maze = new Maze(width / pixelSize, height / pixelSize, false);
    generator = null;
    solver = null;
}

function btnFill_Click() {
    maze = new Maze(width / pixelSize, height / pixelSize, true);
    generator = null;
    solver = null;
}

function btnSolve_Click() {
    if ((solver?.next().done || solver === null) && (generator?.next().done || generator === null)) {
        maze.resetVisited();
        maze.resetPath();
        solver = visualizeSolve(
            getSolverAlg(),
            maze,
            !document.getElementById("animateCheckbox")?.checked
        );
    }
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
    stroke(color);
    strokeWeight(pixelSize / 3);
    point(x * pixelSize + pixelSize / 2, y * pixelSize + pixelSize / 2);
}

function drawMaze() {
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
                highlightCell(i, j, color(200));
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