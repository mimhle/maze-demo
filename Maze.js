class Maze {
    constructor(width, height) {
        this.start = null;
        this.end = null;
        this.size = {
            width: width,
            height: height
        };

        this.maze = new Array(width).fill(0).map(
            () => new Array(height).fill(0).map(
                () => [1, 1, 1, 1] // [top, right, bottom, left]
            )
        );
        this.visited = new Array(width).fill(0).map(
            () => new Array(height).fill(false)
        );
    }

    getMaze(x, y) {
        return this.maze[x][y];
    }

    setMaze(x, y, value) {
        this.maze[x][y] = value;
    }

    connectCells(x1, y1, x2, y2) {
        // neighbor is on the top
        if (x1 === x2 && y1 > y2) {
            this.maze[x1][y1][0] = 0;
            this.maze[x2][y2][2] = 0;
        }
        // neighbor is on the bottom
        else if (x1 === x2 && y1 < y2) {
            this.maze[x1][y1][2] = 0;
            this.maze[x2][y2][0] = 0;
        }
        // neighbor is on the left
        else if (x1 > x2 && y1 === y2) {
            this.maze[x1][y1][3] = 0;
            this.maze[x2][y2][1] = 0;
        }
        // neighbor is on the right
        else if (x1 < x2 && y1 === y2) {
            this.maze[x1][y1][1] = 0;
            this.maze[x2][y2][3] = 0;
        }
        return maze;
    };

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
    };
}
