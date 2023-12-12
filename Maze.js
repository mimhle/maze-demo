class Maze {
    constructor(width, height, walls = true) {
        this.start = [0, 0];
        this.end = [width - 1, height - 1];
        this.size = {
            width: width,
            height: height
        };

        this.maze = new Array(width).fill(0).map(
            () => new Array(height).fill(0).map(
                () => walls ? [1, 1, 1, 1] : [0, 0, 0, 0] // [top, right, bottom, left]
            )
        );
        this.visited = new Array(width).fill(0).map(
            () => new Array(height).fill(false)
        );
        this.path = [];
    }

    getMaze(x, y) {
        return this.maze[x][y];
    }

    setMaze(x, y, value) {
        this.maze[x][y] = value;
    }

    resetVisited() {
        this.visited = new Array(this.size.width).fill(0).map(
            () => new Array(this.size.height).fill(false)
        );
    }

    resetPath() {
        this.path = [];
    }

    reset(walls = true) {
        this.resetVisited();
        this.resetPath();
        this.maze = new Array(this.size.width).fill(0).map(
            () => new Array(this.size.height).fill(0).map(
                () => walls ? [1, 1, 1, 1] : [0, 0, 0, 0] // [top, right, bottom, left]
            )
        );
    }

    connectCells(x1, y1, x2, y2) {
        if (x1 === x2 && y1 > y2) {
            // neighbor is on the top
            this.maze[x1][y1][0] = 0;
            this.maze[x2][y2][2] = 0;
        } else if (x1 === x2 && y1 < y2) {
            // neighbor is on the bottom
            this.maze[x1][y1][2] = 0;
            this.maze[x2][y2][0] = 0;
        } else if (x1 > x2 && y1 === y2) {
            // neighbor is on the left
            this.maze[x1][y1][3] = 0;
            this.maze[x2][y2][1] = 0;
        } else if (x1 < x2 && y1 === y2) {
            // neighbor is on the right
            this.maze[x1][y1][1] = 0;
            this.maze[x2][y2][3] = 0;
        }
    };

    disconnectCells(x1, y1, x2, y2) {
        if (x1 === x2 && y1 > y2) {
            // neighbor is on the top
            this.maze[x1][y1][0] = 1;
            this.maze[x2][y2][2] = 1;
        } else if (x1 === x2 && y1 < y2) {
            // neighbor is on the bottom
            this.maze[x1][y1][2] = 1;
            this.maze[x2][y2][0] = 1;
        } else if (x1 > x2 && y1 === y2) {
            // neighbor is on the left
            this.maze[x1][y1][3] = 1;
            this.maze[x2][y2][1] = 1;
        } else if (x1 < x2 && y1 === y2) {
            // neighbor is on the right
            this.maze[x1][y1][1] = 1;
            this.maze[x2][y2][3] = 1;
        }
    };

    isConnected(x1, y1, x2, y2) {
        if (x1 < 0 || x1 >= this.size.width || y1 < 0 || y1 >= this.size.height) return false;
        // neighbor is on the top
        if (x1 === x2 && y1 > y2) {
            return this.maze[x1][y1][0] === 0 && this.maze[x2][y2][2] === 0;
        }
        // neighbor is on the bottom
        else if (x1 === x2 && y1 < y2) {
            return this.maze[x1][y1][2] === 0 && this.maze[x2][y2][0] === 0;
        }
        // neighbor is on the left
        else if (x1 > x2 && y1 === y2) {
            return this.maze[x1][y1][3] === 0 && this.maze[x2][y2][1] === 0;
        }
        // neighbor is on the right
        else if (x1 < x2 && y1 === y2) {
            return this.maze[x1][y1][1] === 0 && this.maze[x2][y2][3] === 0;
        }
        return false;
    };

    getUnvisitedCells() {
        let unvisited = [];
        for (let i = 0; i < this.size.width; i++) {
            for (let j = 0; j < this.size.height; j++) {
                if (!this.visited[i][j]) {
                    unvisited.push([i, j]);
                }
            }
        }
        return unvisited;
    }

    getNeighbors(x, y) {
        let neighbors = [];
        if (x > 0) {
            neighbors.push([x - 1, y]);
        }
        if (x < this.size.width - 1) {
            neighbors.push([x + 1, y]);
        }
        if (y > 0) {
            neighbors.push([x, y - 1]);
        }
        if (y < this.size.height - 1) {
            neighbors.push([x, y + 1]);
        }
        return neighbors;
    }

    getConnectedNeighbors(x, y) {
        let neighbors = [];
        if (x > 0 && this.isConnected(x, y, x - 1, y)) {
            neighbors.push([x - 1, y]);
        }
        if (x < this.size.width - 1 && this.isConnected(x, y, x + 1, y)) {
            neighbors.push([x + 1, y]);
        }
        if (y > 0 && this.isConnected(x, y, x, y - 1)) {
            neighbors.push([x, y - 1]);
        }
        if (y < this.size.height - 1 && this.isConnected(x, y, x, y + 1)) {
            neighbors.push([x, y + 1]);
        }
        return neighbors;
    }

    getUnvisitedNeighbors(x, y) {
        let neighbors = [];
        if (x > 0 && !this.visited[x - 1][y]) {
            neighbors.push([x - 1, y]);
        }
        if (x < this.size.width - 1 && !this.visited[x + 1][y]) {
            neighbors.push([x + 1, y]);
        }
        if (y > 0 && !this.visited[x][y - 1]) {
            neighbors.push([x, y - 1]);
        }
        if (y < this.size.height - 1 && !this.visited[x][y + 1]) {
            neighbors.push([x, y + 1]);
        }
        return neighbors;
    }

    getVisitedNeighbors(x, y) {
        let neighbors = [];
        if (x > 0 && this.visited[x - 1][y]) {
            neighbors.push([x - 1, y]);
        }
        if (x < this.size.width - 1 && this.visited[x + 1][y]) {
            neighbors.push([x + 1, y]);
        }
        if (y > 0 && this.visited[x][y - 1]) {
            neighbors.push([x, y - 1]);
        }
        if (y < this.size.height - 1 && this.visited[x][y + 1]) {
            neighbors.push([x, y + 1]);
        }
        return neighbors;
    }
}
