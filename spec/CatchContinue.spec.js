import CatchContinue from '../src/CatchContinue';

describe('CatchContinue', () => {
    let cc;
    let finished;
    let error;
    let promise;
    let args;

    beforeEach(() => {
        cc = new CatchContinue();
        finished = false;
        args = [];
    });

    describe('with a single error', () => {
        beforeEach(() => {
            error = new Error('Foo');

            cc.add((...a) => {
                args.push(a);

                const foo = 5;

                return foo;
            });

            cc.add((...a) => {
                args.push(a);

                return new Promise(r => setTimeout(r, 500));
            });

            cc.add((...a) => {
                args.push(a);

                throw error;
            });

            cc.add((...a) => {
                args.push(a);
                finished = true;
            });

            promise = cc.run('foo', 5);
        });

        it('will throw the first error', async () => {
            await expect(promise).rejects.toBe(error);
        });

        describe('after first error', () => {
            beforeEach(async () => {
                await expect(promise).rejects.toBe(error);
            });

            it('calls the first segments with the same args', () => {
                expect(args).toEqual([
                    ['foo', 5],
                    ['foo', 5],
                    ['foo', 5],
                ]);
            });

            describe('after being retried', () => {
                let retryPromise;

                beforeEach(() => {
                    retryPromise = cc.retry();
                });

                it('errors again', async () => {
                    await expect(retryPromise).rejects.toBe(error);
                });

                describe('after erroring', () => {
                    beforeEach(async () => {
                        await expect(retryPromise).rejects.toBe(error);
                    });

                    it('is not finished', () => {
                        expect(finished).toBe(false);
                    });

                    it('calls the segment with the same args again', () => {
                        expect(args).toEqual([
                            ['foo', 5],
                            ['foo', 5],
                            ['foo', 5],
                            ['foo', 5],
                        ]);
                    });
                });
            });

            describe('after being continued', () => {
                beforeEach(async () => {
                    expect(finished).toBe(false);

                    await cc.continue();
                });

                it('can be finished', () => {
                    expect(finished).toBe(true);
                });

                it('calls the remaining segments with the same args', () => {
                    expect(args).toEqual([
                        ['foo', 5],
                        ['foo', 5],
                        ['foo', 5],
                        ['foo', 5],
                    ]);
                });
            });
        });
    });
});
