function getGenAlg() {
    const alg = document.getElementById("generateAlgorithm").value;
    switch (alg) {
        case "0":
            return randomizedDfs;
        case "1":
            return randomizedPrims;
        case "2":
            return aldousBroder;
        case "3":
            return huntAndKill;
        case "4":
            return recursiveDivision;
        case "5":
            return recursiveDivisionSparse;
        case "6":
            return binaryTree;
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

function* huntAndKill(maze, x, y) {
    maze.visited[x][y] = true;
    let unvisitedCells = maze.getUnvisitedCells();
    while (unvisitedCells.length > 0) {
        let neighbors = maze.getUnvisitedNeighbors(x, y);
        if (neighbors.length > 0) {
            let randomNeighbor = neighbors[Math.floor(Math.random() * neighbors.length)];
            maze.connectCells(x, y, randomNeighbor[0], randomNeighbor[1]);
            maze.visited[randomNeighbor[0]][randomNeighbor[1]] = true;
            [x, y] = randomNeighbor;
            yield maze;
        } else {
            const visitedCells = maze.getVisitedCells();
            let foundUnvisitedNeighbor = false;
            for (let visitedCell of visitedCells) {
                neighbors = maze.getNeighbors(visitedCell[0], visitedCell[1]);
                for (let neighbor of neighbors) {
                    if (!maze.visited[neighbor[0]][neighbor[1]]) {
                        foundUnvisitedNeighbor = true;
                        [x, y] = visitedCell;
                        break;
                    }
                }
                if (foundUnvisitedNeighbor) break;
            }
            if (!foundUnvisitedNeighbor) break;
        }
        unvisitedCells = maze.getUnvisitedCells();
    }
    return maze;
}

function* recursiveDivision(maze) {

    maze.reset(false);

    const stack = [[0, 0, maze.size.width - 1, maze.size.height - 1]];

    while (stack.length > 0) {
        const [x1, y1, x2, y2] = stack.shift(); // this looks cooler than pop()
        const width = x2 - x1;
        const height = y2 - y1;
        if (width <= 0 || height <= 0) continue;

        if (width > height) {
            const wallX = Math.floor(Math.random() * width) + x1;
            const holeY = Math.floor(Math.random() * height) + y1;
            for (let i = y1; i <= y2; i++) {
                if (i !== holeY) {
                    maze.disconnectCells(wallX, i, wallX + 1, i);
                }
            }
            stack.push([x1, y1, wallX, y2]);
            stack.push([wallX + 1, y1, x2, y2]);
        } else {
            const wallY = Math.floor(Math.random() * height) + y1;
            const holeX = Math.floor(Math.random() * width) + x1;
            for (let i = x1; i <= x2; i++) {
                if (i !== holeX) {
                    maze.disconnectCells(i, wallY, i, wallY + 1);
                }
            }
            stack.push([x1, y1, x2, wallY]);
            stack.push([x1, wallY + 1, x2, y2]);
        }
        console.log(width, height);
        yield maze;
    }

    return maze;
}

function* recursiveDivisionSparse(maze) {

    maze.reset(false);

    const stack = [[0, 0, maze.size.width - 1, maze.size.height - 1]];

    while (stack.length > 0) {
        const [x1, y1, x2, y2] = stack.shift(); // again, this looks cooler than pop()
        const width = x2 - x1;
        const height = y2 - y1;
        if (width <= 0 || height <= 0) continue;

        if (width > height) {
            const wallX = Math.floor(Math.random() * width) + x1;
            const holeY1 = Math.floor(Math.random() * height) + y1;
            const holeY2 = Math.floor(Math.random() * height) + y1;
            for (let i = y1; i <= y2; i++) {
                if (i !== holeY1 && i !== holeY2) {
                    maze.disconnectCells(wallX, i, wallX + 1, i);
                }
            }
            stack.push([x1, y1, wallX, y2]);
            stack.push([wallX + 1, y1, x2, y2]);
        } else {
            const wallY = Math.floor(Math.random() * height) + y1;
            const holeX1 = Math.floor(Math.random() * width) + x1;
            const holeX2 = Math.floor(Math.random() * width) + x1;
            for (let i = x1; i <= x2; i++) {
                if (i !== holeX1 && i !== holeX2) {
                    maze.disconnectCells(i, wallY, i, wallY + 1);
                }
            }
            stack.push([x1, y1, x2, wallY]);
            stack.push([x1, wallY + 1, x2, y2]);
        }
        console.log(width, height);
        yield maze;
    }

    return maze;
}

function* binaryTree(maze) {
    for (let i = 0; i < maze.size.width; i++) {
        for (let j = 0; j < maze.size.height; j++) {
            let right = Math.random() < 0.5;
            if (i === maze.size.width - 1) right = false;
            else if (j === maze.size.height - 1) right = true;

            if (right && i === maze.size.width - 1) continue;
            if (!right && j === maze.size.height - 1) continue;

            if (right) {
                maze.connectCells(i, j, i + 1, j);
            } else {
                maze.connectCells(i, j, i, j + 1);
            }
            yield maze;
        }
    }

    return maze;
}
