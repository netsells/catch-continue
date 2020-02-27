/**
 * Catch, retry or continue code blocks.
 */
class CatchContinue {
    /**
     * Setup the class.
     */
    constructor() {
        this.segments = [];
        this.pointer = 0;
    }

    /**
     * Wrap a class instance to generate a class continue for every function
     * call. Uses proxies to store each call until the segments are ran.
     *
     * @param {Function} funcInstance
     * @returns {Proxy}
     */
    asyncWrap(funcInstance) {
        return new Proxy({}, {
            get: (_, prop) => {
                return (...args) => {
                    let retVal;

                    this.add(async () => {
                        const instance = funcInstance();

                        retVal = await instance[prop](...args);
                    });

                    return this.asyncWrap(() => retVal);
                };
            },
        });
    }

    /**
     * Same as asyncWrap but wraps the instance in a function.
     *
     * @param {object} instance
     * @returns {Proxy}
     */
    wrap(instance) {
        return this.asyncWrap(() => instance);
    }

    /**
     * Add a segment.
     *
     * @param {Function} func
     */
    add(func) {
        this.segments = [
            ...this.segments,
            func,
        ];
    }

    /**
     * Run the segments.
     *
     * @param {any[]} args - Arguments to pass to each segment.
     * @throws {any}
     */
    async run(...args) {
        this.args = args;

        for (; this.pointer < this.segments.length; this.pointer++) {
            await this.segments[this.pointer](...this.args);
        }
    }

    /**
     * Retry the failed segment.
     */
    async retry() {
        await this.run(...this.args);
    }

    /**
     * Continue, skipping the failed segment.
     */
    async continue() {
        this.pointer++;

        await this.run(...this.args);
    }
}

export default CatchContinue;
