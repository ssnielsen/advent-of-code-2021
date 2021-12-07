import * as R from 'ramda';
import {loadInput} from '../util';

type Fish = {
    daysUntilNew: number;
};

export const part1 = (school: Fish[]): number => {
    const nextDay =
        (resetValue: number, initialPenalty: number) => (school: Fish[]) =>
            R.pipe(
                R.map((fish: Fish) => {
                    return fish.daysUntilNew === 0
                        ? [
                              {daysUntilNew: resetValue},
                              {daysUntilNew: resetValue + initialPenalty},
                          ]
                        : [{daysUntilNew: fish.daysUntilNew - 1}];
                }),
                R.flatten,
            )(school);

    const RESET = 6;
    const INITIAL_PENALTY = 2;

    const result = R.range(0, 80).reduce(
        nextDay(RESET, INITIAL_PENALTY),
        school,
    );

    return result.length;
};

export const part2 = (school: Fish[]): number => {
    const RESET = 6;
    const INITIAL_PENALTY = 2;

    const next =
        (daysLeft: number) =>
        (fishesForDay: number[]): number => {
            if (daysLeft === 0) {
                return R.sum(fishesForDay);
            }

            const zeros = R.head(fishesForDay)!;

            const updated = R.pipe(
                () => R.move(0, -1, fishesForDay),
                R.adjust(RESET, R.add(zeros)),
            )();

            return next(daysLeft - 1)(updated);
        };

    const initialValue = R.pipe(
        R.countBy((fish: Fish) => fish.daysUntilNew),
        R.toPairs,
        R.reduce((arr: number[], [index, value]: [string, number]) => {
            return R.update(Number(index), value, arr);
        }, R.repeat(0, RESET + INITIAL_PENALTY + 1)),
    )(school);

    return next(256)(initialValue);
};

export const parse = (input: string[]): Fish[] => {
    const fish = R.pipe(
        R.head,
        R.split(','),
        R.map(R.pipe(Number, R.objOf('daysUntilNew'))),
    )(input);

    return fish;
};

export const run = () => {
    const input = loadInput('2021-06');

    console.log('Part 1:', part1(parse(input)));
    console.log('Part 2:', part2(parse(input)));
};
