function getGenAlg() {
    const alg = document.getElementById("generateAlgorithm").value;
    switch (alg) {
        case "0":
            return randomizedDfs;
        case "1":
            return randomizedPrims;
        case "2":
            return wilsons;
        case "3":
            return aldousBroder;
        default:
            throw new Error("Invalid algorithm");
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
    value?.resetVisited();
    drawMaze(value);
    return value;
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
    // TODO: Implement
}

function* aldousBroder(maze, x, y) {
    maze.visited[x][y] = true;
    let unvisitedCells = maze.getUnvisitedCells();
    while (unvisitedCells.length > 0) {
        // let [x, y] = unvisitedCells[Math.floor(Math.random() * unvisitedCells.length)];
        let neighbors = maze.getNeighbors(x, y);
        let randomNeighbor = neighbors[Math.floor(Math.random() * neighbors.length)];
        if (!maze.visited[randomNeighbor[0]][randomNeighbor[1]]) {
            maze.connectCells(x, y, randomNeighbor[0], randomNeighbor[1]);
            maze.visited[randomNeighbor[0]][randomNeighbor[1]] = true;
            yield maze;
        }
        [x, y] = randomNeighbor;
        unvisitedCells = maze.getUnvisitedCells();
    }
    return maze;
}

function* recursiveDivision(maze, x, y) {
    // TODO: Implement
}