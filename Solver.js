function getSolverAlg() {
    const alg = document.getElementById("solveAlgorithm").value;
    switch (alg) {
        case "0":
            return dfsSolve;
        case "1":
            return dfsWithHeuristicEuclideanSolve;
        case "2":
            return dfsWithHeuristicManhattanSolve;
        case "3":
            return dfsRandomizedSolve;
        case "4":
            return bfsSolve;
        case "5":
            return aStarEuclideanSolve;
        case "6":
            return aStarManhattanSolve;
        default:
            throw new Error("Invalid algorithm");
    }
}

function* visualizeSolve(alg, maze, fast = false) {
    const solver = alg(maze);
    let done = false;
    let value = null;
    while (!done) {
        const obj = solver.next();
        done = obj.done;
        value = obj.value;
        if (fast) continue;
        drawMaze(value);
        drawVisited(value);
        drawPath(maze);
        yield value;
    }
    drawMaze(value);
    drawVisited(value);
    drawPath(maze);
    return value;
}

function* dfsSolve(maze) {
    const [startX, startY] = maze.start;
    const [endX, endY] = maze.end;

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

function* dfsWithHeuristicEuclideanSolve(maze) {
    const heuristic = (x1, y1, x2, y2) => {
        return Math.sqrt(Math.pow(x1 - x2, 2) + Math.pow(y1 - y2, 2));
    }

    const [startX, startY] = maze.start;
    const [endX, endY] = maze.end;

    let stack = [];
    stack.push([startX, startY]);
    maze.visited[startX][startY] = true;

    while (stack.length > 0) {
        let [x, y] = stack.at(-1);
        if (x === endX && y === endY) break;

        let connectedNeighbors = maze.getConnectedNeighbors(x, y);
        let foundUnvisitedNeighbor = false;

        connectedNeighbors.sort((a, b) => {
            let h1 = heuristic(a[0], a[1], endX, endY);
            let h2 = heuristic(b[0], b[1], endX, endY);
            return h1 - h2;
        });

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

function* dfsWithHeuristicManhattanSolve(maze) {
    const heuristic = (x1, y1, x2, y2) => {
        return Math.abs(x1 - x2) + Math.abs(y1 - y2);
    }

    const [startX, startY] = maze.start;
    const [endX, endY] = maze.end;

    let stack = [];
    stack.push([startX, startY]);
    maze.visited[startX][startY] = true;

    while (stack.length > 0) {
        let [x, y] = stack.at(-1);
        if (x === endX && y === endY) break;

        let connectedNeighbors = maze.getConnectedNeighbors(x, y);
        let foundUnvisitedNeighbor = false;

        connectedNeighbors.sort((a, b) => {
            let h1 = heuristic(a[0], a[1], endX, endY);
            let h2 = heuristic(b[0], b[1], endX, endY);
            return h1 - h2;
        });

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

function* dfsRandomizedSolve(maze) {
    const [startX, startY] = maze.start;
    const [endX, endY] = maze.end;

    let stack = [];
    stack.push([startX, startY]);
    maze.visited[startX][startY] = true;

    while (stack.length > 0) {
        let [x, y] = stack.at(-1);
        if (x === endX && y === endY) break;

        let connectedNeighbors = maze.getConnectedNeighbors(x, y);
        let foundUnvisitedNeighbor = false;

        connectedNeighbors.sort((a, b) => {
            return Math.random() - 0.5;
        });

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

function* bfsSolve(maze) {
    const [startX, startY] = maze.start;
    const [endX, endY] = maze.end;

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

function* aStarEuclideanSolve(maze) {
    const heuristic = (x1, y1, x2, y2) => {
        return Math.sqrt(Math.pow(x1 - x2, 2) + Math.pow(y1 - y2, 2));
    }

    const [startX, startY] = maze.start;
    const [endX, endY] = maze.end;

    let queue = new PriorityQueue();
    queue.enqueue([startX, startY], 0);
    maze.visited[startX][startY] = true;

    while (!queue.isEmpty()) {
        let [x, y] = queue.dequeue().element;
        if (x === endX && y === endY) break;
        let connectedNeighbors = maze.getConnectedNeighbors(x, y);
        for (let neighbor of connectedNeighbors) {
            if (!maze.visited[neighbor[0]][neighbor[1]]) {
                queue.enqueue(neighbor, heuristic(neighbor[0], neighbor[1], endX, endY));
                maze.visited[neighbor[0]][neighbor[1]] = true;
                maze.path.push([x, y, neighbor[0], neighbor[1]]);
            }
        }
        yield maze;
    }
    return maze;
}

function* aStarManhattanSolve(maze) {
    const heuristic = (x1, y1, x2, y2) => {
        return Math.abs(x1 - x2) + Math.abs(y1 - y2);
    }

    const [startX, startY] = maze.start;
    const [endX, endY] = maze.end;

    let queue = new PriorityQueue();
    queue.enqueue([startX, startY], 0);
    maze.visited[startX][startY] = true;

    while (!queue.isEmpty()) {
        let [x, y] = queue.dequeue().element;
        if (x === endX && y === endY) break;
        let connectedNeighbors = maze.getConnectedNeighbors(x, y);
        for (let neighbor of connectedNeighbors) {
            if (!maze.visited[neighbor[0]][neighbor[1]]) {
                queue.enqueue(neighbor, heuristic(neighbor[0], neighbor[1], endX, endY));
                maze.visited[neighbor[0]][neighbor[1]] = true;
                maze.path.push([x, y, neighbor[0], neighbor[1]]);
            }
        }
        yield maze;
    }
    return maze;
}
