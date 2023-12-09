const width = 500;
const height = 500;
const pixelSize = 25;

if (width % pixelSize !== 0 || height % pixelSize !== 0) {
    throw new Error("width and height must be divisible by pixelSize");
}

let maze = new Array(width / pixelSize).fill(0).map(
    () => new Array(height / pixelSize).fill(0).map(
        () => [1, 1, 1, 1] // [top, right, bottom, left]
    )
);

function setup() {
    pixelDensity(1);
    let canvas = createCanvas(width, height);
    canvas.parent("canvas");
    frameRate(60);

    drawMaze(maze);
    noLoop();
}

let currentAlgorithm = visualizeDfs;
let generator = null

function draw() {
    background(255);
    if (generator === null) {
        generator = currentAlgorithm(JSON.parse(JSON.stringify(maze)), 0, 0);
        return;
    }
    let {value, done} = generator.next();
    if (done) {
        noLoop();
        generator = null;
    }
}

function btnGenerate_Click() {
    loop();
}

function* randomizedDfs(maze, x, y) {

    const connectCells = (maze, x1, y1, x2, y2) => {
        // neighbor is on the top
        if (x1 === x2 && y1 > y2) {
            maze[x1][y1][0] = 0;
            maze[x2][y2][2] = 0;
        }
        // neighbor is on the bottom
        else if (x1 === x2 && y1 < y2) {
            maze[x1][y1][2] = 0;
            maze[x2][y2][0] = 0;
        }
        // neighbor is on the left
        else if (x1 > x2 && y1 === y2) {
            maze[x1][y1][3] = 0;
            maze[x2][y2][1] = 0;
        }
        // neighbor is on the right
        else if (x1 < x2 && y1 === y2) {
            maze[x1][y1][1] = 0;
            maze[x2][y2][3] = 0;
        }
        return maze;
    };

    const getUnvisitedNeighbors = (maze, x, y, visited) => {
        let neighbors = [];
        if (x > 0 && !visited[x - 1][y]) {
            neighbors.push([x - 1, y]);
        }
        if (x < maze.length - 1 && !visited[x + 1][y]) {
            neighbors.push([x + 1, y]);
        }
        if (y > 0 && !visited[x][y - 1]) {
            neighbors.push([x, y - 1]);
        }
        if (y < maze[0].length - 1 && !visited[x][y + 1]) {
            neighbors.push([x, y + 1]);
        }
        return neighbors;
    };


    let visited = new Array(maze.length).fill(0).map(() => new Array(maze[0].length).fill(false));
    let stack = [];
    stack.push([x, y]);
    visited[x][y] = true;

    while (stack.length > 0) {
        let [x, y] = stack.pop();
        let neighbors = getUnvisitedNeighbors(maze, x, y, visited);
        if (neighbors.length > 0) {
            stack.push([x, y]);
            let randomNeighbor = neighbors[Math.floor(Math.random() * neighbors.length)];
            maze = connectCells(maze, x, y, randomNeighbor[0], randomNeighbor[1]);
            visited[randomNeighbor[0]][randomNeighbor[1]] = true;
            stack.push(randomNeighbor);
            yield maze;
        }
    }
    return maze;
}


function* visualizeDfs(maze, x, y) {
    const generator = randomizedDfs(maze, x, y);
    // let {value, done} = generator.next();
    let done = false;
    let value = null;
    while (!done) {
        const obj = generator.next();
        done = obj.done;
        value = obj.value;
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
    for (let i = 0; i < maze.length; i++) {
        const row = maze[i];
        for (let j = 0; j < row.length; j++) {
            const cell = row[j];
            drawCell(i * pixelSize, j * pixelSize, cell);
        }
    }
}
