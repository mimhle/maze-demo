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

function getGenAlg() {
    const alg = document.getElementById("generateAlgorithm").value;
    switch (alg) {
        case "0":
            return randomizedDfs;
        case "1":
            return randomizedPrims;
        case "2":
            return wilsons;
        default:
            throw new Error("Invalid algorithm");
    }
}

function getSolverAlg() {
    const alg = document.getElementById("solveAlgorithm").value;
    switch (alg) {
        case "0":
            return dfsSolve;
        case "1":
            return bfsSolve;
        case "2":
            return aStar;
        default:
            throw new Error("Invalid algorithm");
    }
}


function* randomizedDfs(maze, x, y) {
    let stack = [];
    stack.push([x, y]);
    maze.visited[x][y] = true;

    while (stack.length > 0) {
        let [x, y] = stack.pop();
        let neighbors = maze.getUnvisitedNeighbors(x, y);
        if (neighbors.length > 0) {
            stack.push([x, y]);
            let randomNeighbor = neighbors[Math.floor(Math.random() * neighbors.length)];
            maze.connectCells(x, y, randomNeighbor[0], randomNeighbor[1]);
            maze.visited[randomNeighbor[0]][randomNeighbor[1]] = true;
            stack.push(randomNeighbor);
            yield maze;
        }
    }
    return maze;
}

function* randomizedPrims(maze, x, y) {
    let walls = [];
    maze.visited[x][y] = true;
    const neighbors = maze.getUnvisitedNeighbors(x, y);
    for (let neighbor of neighbors) {
        walls.push([x, y, neighbor[0], neighbor[1]]);
    }

    while (walls.length > 0) {
        let randomWall = walls[Math.floor(Math.random() * walls.length)];
        let [x1, y1, x2, y2] = randomWall;
        if (maze.visited[x1][y1] !== maze.visited[x2][y2]) {
            maze.connectCells(x1, y1, x2, y2);
            maze.visited[x1][y1] = true;
            maze.visited[x2][y2] = true;
            const neighbors = maze.getUnvisitedNeighbors(x2, y2);
            for (let neighbor of neighbors) {
                walls.push([x2, y2, neighbor[0], neighbor[1]]);
            }
            yield maze;
        }
        walls = walls.filter(wall => {
            return maze.visited[wall[0]][wall[1]] !== maze.visited[wall[2]][wall[3]];
        });
    }
    return maze;
}

function* wilsons(maze, x, y) {
    // random work from x, y
    // let randomX = Math.floor(Math.random() * maze.size.width);
    // let randomY = Math.floor(Math.random() * maze.size.height);
    // maze.visited[randomX][randomY] = true;
}

function* dfsSolve(maze, startX, startY, endX = maze.size.width - 1, endY = maze.size.height - 1) {
    let stack = [];
    stack.push([startX, startY]);
    maze.visited[startX][startY] = true;

    while (stack.length > 0) {
        let [x, y] = stack.at(-1);
        if (x === endX && y === endY) break;

        let connectedNeighbors = maze.getConnectedNeighbors(x, y);
        let foundUnvisitedNeighbor = false;

        for (let neighbor of connectedNeighbors) {
            if (!maze.visited[neighbor[0]][neighbor[1]]) {
                stack.push(neighbor);
                maze.visited[neighbor[0]][neighbor[1]] = true;
                maze.path.push([x, y, neighbor[0], neighbor[1]]);
                foundUnvisitedNeighbor = true;
                break;
            }
        }

        if (!foundUnvisitedNeighbor) {
            stack.pop();
            maze.path.pop();
        }

        yield maze;
    }
    return maze;
}

function* bfsSolve(maze, startX, startY, endX = maze.size.width - 1, endY = maze.size.height - 1) {
    let queue = [];
    queue.push([startX, startY]);
    maze.visited[startX][startY] = true;

    while (queue.length > 0) {
        let [x, y] = queue.shift();
        if (x === endX && y === endY) break;
        let connectedNeighbors = maze.getConnectedNeighbors(x, y);
        for (let neighbor of connectedNeighbors) {
            if (!maze.visited[neighbor[0]][neighbor[1]]) {
                queue.push(neighbor);
                maze.visited[neighbor[0]][neighbor[1]] = true;
                maze.path.push([x, y, neighbor[0], neighbor[1]]);
            }
        }
        yield maze;
    }
    return maze;
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
    // rect(x * pixelSize, y * pixelSize, pixelSize, pixelSize);
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