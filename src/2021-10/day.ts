import * as R from 'ramda';
import {cast, loadInput} from '../util';

type OpeningChar = '(' | '[' | '{' | '<';
type ClosingChar = ')' | ']' | '}' | '>';
type AllowedChar = OpeningChar | ClosingChar;

type Result<T, E> = {tag: 'ok'; result: T} | {tag: 'error'; error: E};

const ok = <T>(result: T) => ({tag: 'ok' as const, result});
const error = <T>(error: T) => ({tag: 'error' as const, error});

type ProgramResult = Result<
    'ok',
    | {type: 'unexpected-end-of-program'; remaining: ClosingChar[]}
    | {
          type: 'unexpected-character';
          message: string;
          illegalCharacter: ClosingChar;
      }
>;

const runProgram = (
    program: AllowedChar[],
    expectedClosingChars: ClosingChar[] = [],
): ProgramResult => {
    if (R.isEmpty(program)) {
        if (R.isEmpty(expectedClosingChars)) {
            return ok('ok' as const);
        } else {
            return error({
                type: 'unexpected-end-of-program',
                remaining: expectedClosingChars,
            });
        }
    }

    const [char, ...restOfProgram] = program;
    const [nextAllowedClosingChar, ...restOfExpectedClosingChars] =
        expectedClosingChars;

    switch (char) {
        case '(':
            return runProgram(restOfProgram, [')', ...expectedClosingChars]);
        case '[':
            return runProgram(restOfProgram, [']', ...expectedClosingChars]);
        case '{':
            return runProgram(restOfProgram, ['}', ...expectedClosingChars]);
        case '<':
            return runProgram(restOfProgram, ['>', ...expectedClosingChars]);
        case ')':
        case ']':
        case '}':
        case '>':
            if (char === nextAllowedClosingChar) {
                return runProgram(restOfProgram, restOfExpectedClosingChars);
            } else {
                return error({
                    type: 'unexpected-character',
                    message: `Expected ${nextAllowedClosingChar}, but found ${char} instead.`,
                    illegalCharacter: char,
                });
            }
    }
};

const isIllegalCharError = (result: ProgramResult) => {
    switch (result.tag) {
        case 'ok':
            return false;
        case 'error': {
            switch (result.error.type) {
                case 'unexpected-character':
                    return true;
                default:
                    return false;
            }
        }
        default:
            return false;
    }
};

const isUnexpectedEndOfProgramError = (result: ProgramResult) => {
    switch (result.tag) {
        case 'ok':
            return false;
        case 'error': {
            switch (result.error.type) {
                case 'unexpected-end-of-program':
                    return true;
                default:
                    return false;
            }
        }
        default:
            return false;
    }
};

const getPointsPart1 = (closingChar: ClosingChar): number => {
    switch (closingChar) {
        case ')':
            return 3;
        case ']':
            return 57;
        case '}':
            return 1197;
        case '>':
            return 25137;
    }
};

const getPointsPart2 = (closingChar: ClosingChar): number => {
    switch (closingChar) {
        case ')':
            return 1;
        case ']':
            return 2;
        case '}':
            return 3;
        case '>':
            return 4;
    }
};

export const part1 = (programs: AllowedChar[][]) => {
    return R.pipe(
        R.map(runProgram),
        R.filter(isIllegalCharError),
        R.map((x: any) => getPointsPart1(x.error.illegalCharacter)),
        R.sum,
    )(programs);
};

export const part2 = (programs: AllowedChar[][]) => {
    return R.pipe(
        R.map(runProgram),
        R.filter(isUnexpectedEndOfProgramError),
        R.map(
            R.pipe(
                (x: any) => x.error.remaining,
                R.map((x: any) => getPointsPart2(x)),
                R.reduce((current, point) => current * 5 + point, 0),
            ),
        ),
        R.median,
    )(programs);
};

export const parse = R.map(
    R.pipe(R.split(''), R.map(cast<string, AllowedChar>())),
);

export const run = () => {
    const input = loadInput('2021-10');

    console.log('Part 1:', part1(parse(input)));
    console.log('Part 2:', part2(parse(input)));
};
