class CatchContinue {
    constructor() {
        this.segments = [];
        this.pointer = 0;
        this.args = [];
    }

    add(func) {
        this.segments = [
            ...this.segments,
            func,
        ];
    }

    async run(...args) {
        this.args = args;

        for (; this.pointer < this.segments.length; this.pointer++) {
            await this.segments[this.pointer](...this.args);
        }
    }

    retry() {
        return this.run(...this.args);
    }

    continue() {
        this.pointer++;

        return this.run(...this.args);
    }
}

export default CatchContinue;
