const width = 500;
const height = 500;
const pixelSize = 25;

if (width % pixelSize !== 0 || height % pixelSize !== 0) {
    throw new Error("width and height must be divisible by pixelSize");
}

let placeStart = false;
let placeEnd = false;

let maze = new Maze(width / pixelSize, height / pixelSize)
let generator = null
let solver = null

let live = false;

function setup() {
    pixelDensity(1);
    let canvas = createCanvas(width, height);
    canvas.parent("canvas");
    document.getElementById("canvas").oncontextmenu = () => false;
    frameRate(60);

    document.getElementById("status").innerHTML = `Visited: ${maze.visited.flat().filter(x => x).length} / ${maze.size.width * maze.size.height}`;
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
        if (done && !live) {
            solver = null;
        } else if (done && live) {
            if (mouseIsPressed) live = false;
            if (!(mouseX < 0 || mouseX >= width || mouseY < 0 || mouseY >= height))
                maze.end = [Math.floor(mouseX / pixelSize), Math.floor(mouseY / pixelSize)];
            drawStartEnd();
            maze.resetVisited();
            maze.resetPath();
            solver = visualizeSolve(
                getSolverAlg(),
                maze,
                !document.getElementById("animateCheckbox").checked
            );
        }
    } else {
        drawMaze(maze);
        drawVisited(maze);
        drawPath(maze);

        const x = Math.floor(mouseX / pixelSize);
        const y = Math.floor(mouseY / pixelSize);
        if (placeStart) {
            highlightCell(x, y, color(0, 255, 0));
            if (mouseIsPressed && mouseButton === LEFT && x >= 0 && x < maze.size.width && y >= 0 && y < maze.size.height) {
                maze.start = [x, y];
                placeStart = false;
            }
        } else if (placeEnd) {
            highlightCell(x, y, color(255, 0, 0));
            if (mouseIsPressed && mouseButton === LEFT && x >= 0 && x < maze.size.width && y >= 0 && y < maze.size.height) {
                maze.end = [x, y];
                placeEnd = false;
            }
        } else {
            drawWallHighlight();
        }

        document.getElementById("btnPlaceStart").disabled = placeEnd;
        document.getElementById("btnPlaceEnd").disabled = placeStart;
    }
    drawStartEnd();

    if (maze.visited.flat().filter(x => x).length !== 0) {
        // document.getElementById("status").innerHTML = `Visited: ${maze.visited.flat().filter(x => x).length} / ${maze.size.width * maze.size.height}`;
        let status = `Visited: ${maze.visited.flat().filter(x => x).length} / ${maze.size.width * maze.size.height}`;
        status += `<br>Path Length: ${maze.path.length}`;
        document.getElementById("status").innerHTML = status;
    }
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
        if (i === maze.path.length - 1) stroke(0, 255, 255);
        else stroke(255, 0, 0);
        line(x1 * pixelSize + pixelSize / 2, y1 * pixelSize + pixelSize / 2, x2 * pixelSize + pixelSize / 2, y2 * pixelSize + pixelSize / 2);
    }
}

function btnGenerate_Click() {
    if ((generator?.next().done || generator === null) && (solver?.next().done || solver === null)) {
        maze.reset();
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
    maze.reset(false);
    generator = null;
    solver = null;
}

function btnFill_Click() {
    maze.reset();
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

function btnLive_Click() {
    document.getElementById("animateCheckbox").checked = false;
    live = !live;
    btnSolve_Click();
}

function btnGenerateAndSolve_Click() {
    const initialAnimateCheckbox = document.getElementById("animateCheckbox").checked;
    document.getElementById("animateCheckbox").checked = false;
    btnGenerate_Click();
    while (!generator?.next().done) { }
    document.getElementById("animateCheckbox").checked = initialAnimateCheckbox;

    btnSolve_Click();
}

function btnPlaceStart_Click() {
    if (generator || solver) return;

    placeStart = !placeStart;
    placeEnd = false;
}

function btnPlaceEnd_Click() {
    if (generator || solver) return;

    placeEnd = !placeEnd;
    placeStart = false;
}