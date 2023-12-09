const width = 500;
const height = 500;
const pixelSize = 25;

if (width % pixelSize !== 0 || height % pixelSize !== 0) {
    throw new Error("width and height must be divisible by pixelSize");
}

let maze = new Maze(width / pixelSize, height / pixelSize)
let generator = null

function setup() {
    pixelDensity(1);
    let canvas = createCanvas(width, height);
    canvas.parent("canvas");
    frameRate(60);
    noLoop();
}

function draw() {
    background(255);
    let done = generator?.next().done;
    if (done) {
        noLoop();
        generator = null;
    }
}

function btnGenerate_Click() {
    loop();
    if (generator?.next().done || generator === null) {
        maze = new Maze(width / pixelSize, height / pixelSize);
        generator = visualize(
            getGenAlg(),
            maze,
            0,
            0,
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




function* visualize(alg, maze, x, y, fast = false) {
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

function highlightCell(x, y, color = color(255, 0, 0)) {
    fill(color);
    strokeWeight(0);
    rect(x * pixelSize, y * pixelSize, pixelSize, pixelSize);
}

function drawMaze(maze) {
    for (let i = 0; i < maze.size.width; i++) {
        for (let j = 0; j < maze.size.height; j++) {
            const cell = maze.getMaze(i, j);
            drawCell(i * pixelSize, j * pixelSize, cell);
        }
    }
}
