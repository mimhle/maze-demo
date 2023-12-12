class PriorityQueue {
    constructor() {
        this.queue = [];
    }

    enqueue(element, priority) {
        let obj = {element, priority};
        let added = false;
        for (let i = 0; i < this.queue.length; i++) {
            if (priority < this.queue[i].priority) {
                this.queue.splice(i, 0, obj);
                added = true;
                break;
            }
        }
        if (!added) {
            this.queue.push(obj);
        }
    }

    dequeue() {
        return this.queue.shift();
    }

    front() {
        return this.queue[0];
    }

    isEmpty() {
        return this.queue.length === 0;
    }
}
