import * as R from 'ramda';
import {loadInput} from '../util';

type Input = number[];

export const part1: (input: Input) => number = R.pipe(
    R.aperture(2),
    R.filter(([a, b]) => b > a),
    R.length,
);

export const part2: (input: Input) => number = R.pipe(
    R.aperture(3),
    R.map(R.sum),
    part1,
);

export const parse = R.map(Number);

export const run = () => {
    const input = loadInput('2021-01');

    const parsed = parse(input);

    console.log('Part 1:', part1(parsed));
    console.log('Part 2:', part2(parsed));
};
