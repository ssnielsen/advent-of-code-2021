import * as R from 'ramda';
import {loadInput} from '../util';

type Binary = '0' | '1';

type Number = Binary[];

type Count = {
    '0': number;
    '1': number;
};

const count = (number: Number): Count => {
    return R.countBy(R.identity, number) as Count;
};

const flip: (number: string) => string = R.pipe(
    R.split(''),
    R.map(R.pipe(Number, R.subtract(1), R.toString)),
    R.join(''),
);

export const part1 = (input: Number[]) => {
    const gammaRate = R.pipe(
        (input: Number[]) => R.transpose<Binary>(input),
        R.map(
            R.pipe(
                count,
                R.toPairs,
                // @ts-ignore
                R.reduce(
                    // @ts-ignore
                    R.maxBy(([, occ]) => occ),
                    ['0', Number.MIN_VALUE],
                ),
                R.map(R.head),
                R.head,
            ),
        ),
        R.join(''),
    )(input);

    const epsilonRate = flip(gammaRate);

    return parseInt(gammaRate, 2) * parseInt(epsilonRate, 2);
};

const calculate = (
    numbers: Number[],
    method: (numberOf0s: number, numberOf1s: number) => '0' | '1',
    position: number = 0,
): Number => {
    if (numbers.length === 1) {
        return numbers[0];
    }

    const distribution = R.reduce(
        (acc, number) => {
            const digit = number[position];

            switch (digit) {
                case '0':
                    return {...acc, '0': acc[0] + 1};
                case '1':
                    return {...acc, '1': acc[1] + 1};
            }
        },
        {'0': 0, '1': 0},
        numbers,
    );

    const decidedDigit = method(distribution[0], distribution[1]);

    const remainingNumbers = numbers.filter(
        number => number[position] === decidedDigit,
    );

    return calculate(remainingNumbers, method, position + 1);
};

const calculateOxygenGeneratorRating = (numbers: Number[]) => {
    return calculate(numbers, (numberOf0s, numberOf1s) => {
        if (numberOf0s === numberOf1s) {
            return '1';
        } else if (numberOf0s < numberOf1s) {
            return '1';
        } else {
            return '0';
        }
    });
};

const calculateCO2ScrubberRating = (numbers: Number[]) => {
    return calculate(numbers, (numberOf0s, numberOf1s) => {
        if (numberOf0s === numberOf1s) {
            return '0';
        } else if (numberOf0s < numberOf1s) {
            return '0';
        } else {
            return '1';
        }
    });
};

const part2 = (input: Number[]) => {
    const oxygenGeneratorRating = calculateOxygenGeneratorRating(input);
    const CO2ScrubberRating = calculateCO2ScrubberRating(input);

    return (
        parseInt(oxygenGeneratorRating.join(''), 2) *
        parseInt(CO2ScrubberRating.join(''), 2)
    );
};

export const parse = (input: string[]) => {
    return input.map(line => line.split('').map(digit => digit as Binary));
};

export const run = () => {
    const input = loadInput('2021-03');

    console.log('Part 1:', part1(parse(input)));
    console.log('Part 2:', part2(parse(input)));
};
