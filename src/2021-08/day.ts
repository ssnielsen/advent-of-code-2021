import * as R from 'ramda';
import {forceUnwrap, loadInput} from '../util';

// Input is only the right side of the '|'
export const part1 = R.pipe(
    (_: string[]) => R.map(R.length, _),
    R.filter((x: number) => [2, 3, 4, 7].includes(x)),
    R.length,
);

export const parsePart1 = R.pipe(
    R.map(R.pipe(R.split(' | '), R.nth(1), forceUnwrap, R.split(' '))),
    R.flatten,
);

const findKnownDigits = (input: string[]) => {
    return R.map(
        (output): {output: string; knownDigit: 1 | 7 | 4 | 8 | 'unknown'} => {
            switch (output.length) {
                case 2:
                    return {output, knownDigit: 1};
                case 3:
                    return {output, knownDigit: 7};
                case 4:
                    return {output, knownDigit: 4};
                case 7:
                    return {output, knownDigit: 8};
                default:
                    return {output, knownDigit: 'unknown' as const};
            }
        },
        input,
    );
};

const mapWiring = (patterns: string[], outputs: string[]) => {
    const parsedPatterns = findKnownDigits(patterns);
    const easys = R.filter(x => x.knownDigit !== 'unknown', parsedPatterns);

    const one = R.find(d => d.knownDigit === 1, easys)!;
    const four = R.find(d => d.knownDigit === 4, easys)!;
    const seven = R.find(d => d.knownDigit === 7, easys)!;
    const eight = R.find(d => d.knownDigit === 8, easys)!;

    const segmentA = R.difference(
        seven.output.split(''),
        one.output.split(''),
    ).join('');

    const nine = R.find(
        pattern =>
            pattern.length === 6 &&
            R.intersection(pattern.split(''), four.output.split('')).length ===
                4,
        patterns,
    )!;
    const segmentG = R.difference(
        nine.split(''),
        R.concat(four.output.split(''), seven.output.split('')),
    ).join('');

    const segmentE = R.difference(eight.output.split(''), nine.split('')).join(
        '',
    );

    const three = R.find(
        pattern =>
            pattern.length === 5 &&
            R.intersection(pattern.split(''), one.output.split('')).length ===
                2,
        patterns,
    )!;

    const segmentB = R.difference(
        R.split('', eight.output),
        R.union(R.split('', three), [segmentE]),
    ).join('');

    const zero = R.find(
        pattern =>
            pattern.length === 6 &&
            R.intersection(pattern.split(''), one.output.split('')).length ===
                2 &&
            pattern !== nine,
        patterns,
    )!;

    const segmentD = R.difference(
        R.split('', eight.output),
        R.split('', zero),
    ).join('');

    const six = R.find(
        pattern => pattern.length === 6 && pattern !== nine && pattern !== zero,
        patterns,
    )!;

    const segmentC = R.difference(
        R.split('', eight.output),
        R.split('', six),
    ).join('');

    const segmentF = R.difference('abcdefg'.split(''), [
        segmentA,
        segmentB,
        segmentC,
        segmentD,
        segmentE,
        segmentG,
    ]).join('');

    const assigments = {
        [segmentA]: 'a',
        [segmentB]: 'b',
        [segmentC]: 'c',
        [segmentD]: 'd',
        [segmentE]: 'e',
        [segmentF]: 'f',
        [segmentG]: 'g',
    };

    const result = outputs
        .map(output => {
            const mappedOutput = output
                .split('')
                .map(segment => assigments[segment]!)
                .sort()
                .join('');

            const number = numbers.find(
                ({segments}) => segments === mappedOutput,
            )!.number;

            return number;
        })
        .join('');

    return Number(result);
};

const _0 = 'abcefg';
const _1 = 'cf';
const _2 = 'acdeg';
const _3 = 'acdfg';
const _4 = 'bcdf';
const _5 = 'abdfg';
const _6 = 'abdefg';
const _7 = 'acf';
const _8 = 'abcdefg';
const _9 = 'abcdfg';

const numbers = [_0, _1, _2, _3, _4, _5, _6, _7, _8, _9].map(
    (segments, index) => {
        return {segments, number: index};
    },
);

//   0:      1:      2:      3:      4:
//  aaaa    ....    aaaa    aaaa    ....
// b    c  .    c  .    c  .    c  b    c
// b    c  .    c  .    c  .    c  b    c
//  ....    ....    dddd    dddd    dddd
// e    f  .    f  e    .  .    f  .    f
// e    f  .    f  e    .  .    f  .    f
//  gggg    ....    gggg    gggg    ....

//   5:      6:      7:      8:      9:
//  aaaa    aaaa    aaaa    aaaa    aaaa
// b    .  b    .  .    c  b    c  b    c
// b    .  b    .  .    c  b    c  b    c
//  dddd    dddd    ....    dddd    dddd
// .    f  e    f  .    f  e    f  .    f
// .    f  e    f  .    f  e    f  .    f
//  gggg    gggg    ....    gggg    gggg

//  aaaa
// b    c
// b    c
//  dddd
// e    f
// e    f
//  gggg

export const part2 = (input: {patterns: string[]; outputs: string[]}[]) => {
    return R.pipe(
        R.map(({patterns, outputs}) => mapWiring(patterns, outputs)),
        R.sum,
    )(input);
};

export const parse = (input: string[]) => {
    return R.map(
        R.pipe(R.split(' | '), R.map(R.split(' ')), ([patterns, outputs]) => ({
            patterns,
            outputs,
        })),
    )(input);
};

export const run = () => {
    const input = loadInput('2021-08');

    console.log('Part 1:', part1(parsePart1(input)));
    console.log('Part 2:', part2(parse(input)));
};
