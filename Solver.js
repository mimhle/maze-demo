function getSolverAlg() {
    const alg = document.getElementById("solveAlgorithm").value;
    switch (alg) {
        case "0":
            return dfsSolve;
        case "1":
            return bfsSolve;
        case "2":
            return dfsWithHeuristicSolve;
        case "3":
            return dfsRandomizedSolve;
        default:
            throw new Error("Invalid algorithm");
    }
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

function* dfsWithHeuristicSolve(maze, startX, startY, endX = maze.size.width - 1, endY = maze.size.height - 1) {
    const heuristic = (x1, y1, x2, y2) => {
        return Math.abs(x1 - x2) + Math.abs(y1 - y2);
    }

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

function* dfsRandomizedSolve(maze, startX, startY, endX = maze.size.width - 1, endY = maze.size.height - 1) {
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

function* aStar(maze, startX, startY, endX = maze.size.width - 1, endY = maze.size.height - 1) {
    // TODO: Implement
}