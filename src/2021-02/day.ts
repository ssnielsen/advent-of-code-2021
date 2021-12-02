import * as R from 'ramda';
import {loadInput} from '../util';

type Instruction = {
    direction: 'forward' | 'down' | 'up';
    distance: number;
};

type State = {
    horizontal: number;
    depth: number;
    aim: number;
};

const nextStatePart1 = (state: State, instruction: Instruction): State => {
    switch (instruction.direction) {
        case 'forward':
            return {
                ...state,
                horizontal: state.horizontal + instruction.distance,
            };
        case 'down': {
            return {
                ...state,
                depth: state.depth + instruction.distance,
            };
        }
        case 'up': {
            return {
                ...state,
                depth: state.depth - instruction.distance,
            };
        }
    }
};

export const part1: (instructions: Instruction[]) => number = R.pipe(
    R.reduce(nextStatePart1, {horizontal: 0, depth: 0, aim: 0}),
    ({horizontal, depth}) => horizontal * depth,
);

const nextStatePart2 = (state: State, instruction: Instruction): State => {
    switch (instruction.direction) {
        case 'forward':
            return {
                ...state,
                horizontal: state.horizontal + instruction.distance,
                depth: state.depth + state.aim * instruction.distance,
            };
        case 'down': {
            return {
                ...state,
                aim: state.aim + instruction.distance,
            };
        }
        case 'up': {
            return {
                ...state,
                aim: state.aim - instruction.distance,
            };
        }
    }
};

export const part2: (instructions: Instruction[]) => number = R.pipe(
    R.reduce(nextStatePart2, {horizontal: 0, depth: 0, aim: 0}),
    ({horizontal, depth}) => horizontal * depth,
);

export const parse: (input: ReturnType<typeof loadInput>) => Instruction[] =
    R.pipe(
        R.map(
            R.pipe(R.split(' '), ([direction, distance]) => {
                return {
                    direction: direction as Instruction['direction'],
                    distance: Number(distance),
                };
            }),
        ),
    );

export const run = () => {
    const input = loadInput('2021-02');

    console.log('Part 1:', part1(parse(input)));
    console.log('Part 2:', part2(parse(input)));
};
