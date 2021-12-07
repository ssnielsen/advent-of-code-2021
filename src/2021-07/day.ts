import * as R from 'ramda';
import {loadInput} from '../util';

type Crab = number;

const cost =
    (
        crabs: Crab[],
        calculateCost: (moveNumber: number) => number,
        cache: {[K: number]: number} = {},
    ) =>
    (position: number): number => {
        return R.pipe(
            R.map(
                R.pipe(R.subtract(position), Math.abs, distance => {
                    const cached = cache[distance];

                    if (cached !== undefined) {
                        return cached;
                    } else {
                        const costOfDistance = R.pipe(
                            () => R.times(R.add(1), distance),
                            R.map(calculateCost),
                            R.sum,
                        )();

                        cache[distance] = costOfDistance;

                        return costOfDistance;
                    }
                }),
            ),
            R.sum,
        )(crabs);
    };

const calculate = (
    crabs: Crab[],
    calculateCost: (moveNumber: number) => number,
) => {
    const min = R.reduce<number, number>(R.min, Number.MAX_VALUE, crabs);
    const max = R.reduce<number, number>(R.max, Number.MIN_VALUE, crabs);

    return R.pipe(
        () => R.range(min, max + 1),
        R.map(cost(crabs, calculateCost)),
        R.reduce<number, number>(R.min, Number.MAX_VALUE),
    )();
};

export const part1 = (crabs: Crab[]): number => {
    return calculate(crabs, R.always(1));
};

export const part2 = (crabs: Crab[]): number => {
    return calculate(crabs, R.identity);
};

export const parse: (input: string[]) => Crab[] = R.pipe(
    R.head,
    R.split(','),
    R.map(Number),
);

export const run = () => {
    const input = loadInput('2021-07');

    console.log('Part 1:', part1(parse(input)));
    console.log('Part 2:', part2(parse(input)));
};
