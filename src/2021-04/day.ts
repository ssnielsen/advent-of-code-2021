import * as R from 'ramda';
import {hasValue, loadInput} from '../util';

type State = {
    numbers: string[];
    previousNumbers: string[];
    boards: string[][];
    winners: number[];
};

const markBoard = (number: string) => (board: string[]) => {
    return R.map(
        boardNumber =>
            boardNumber === number ? `-${boardNumber}` : boardNumber,
        board,
    );
};

const winnerPatterns = [
    // Horizontal
    R.range(0, 5),
    R.range(5, 10),
    R.range(10, 15),
    R.range(15, 20),
    R.range(20, 25),

    // Vertical
    ...R.map(col => {
        return R.range(0, 5).map(row => row * 5 + col);
    }, R.range(0, 5)),
];

const isBoardWinner = (board: string[]) => {
    const hasWinner = R.any(winnerPattern => {
        return R.all(pos => board[pos].startsWith('-'), winnerPattern);
    }, winnerPatterns);

    return hasWinner;
};

const nextState = (state: State): State => {
    const number = state.numbers[0]!;

    const newBoards = R.map(markBoard(number), state.boards);

    const winnersInRound = newBoards
        .map((board, index) => {
            return {
                isWinner: isBoardWinner(board),
                index,
            };
        })
        .filter(({isWinner}) => isWinner)
        .map(({index}) => index);

    return {
        numbers: R.tail(state.numbers),
        previousNumbers: [number, ...state.previousNumbers],
        boards: newBoards,
        winners: R.uniq([...state.winners, ...winnersInRound]),
    };
};

const runGame = (
    state: State,
    findWinner: (state: State) => number | null,
): number => {
    const winnerIndex = findWinner(state);

    if (hasValue(winnerIndex)) {
        const winnerOnNumber = state.previousNumbers[0]!;

        const result = R.pipe(
            R.filter((n: string) => !n.startsWith('-')),
            R.sum,
            R.multiply(Number(winnerOnNumber)),
        )(state.boards[winnerIndex]);

        return result;
    }

    return runGame(nextState(state), findWinner);
};

export const part1 = (state: State) => {
    // First winner is the winner
    const findWinner = (state: State): number | null => {
        return state.winners[0] ?? null;
    };

    return runGame(state, findWinner);
};

export const part2 = (state: State) => {
    // Winner is the last to win
    const findWinner = (state: State): number | null => {
        if (state.winners.length < state.boards.length) {
            return null;
        }

        const lastWinner = state.winners[state.winners.length - 1];

        return lastWinner!;
    };

    return runGame(state, findWinner);
};

export const parse = (input: string[]): State => {
    const numbers = R.pipe(R.head, R.split(','))(input)!;
    const boards = R.pipe(
        R.drop(2),
        R.join('\n'),
        R.split('\n\n'),
        R.map(R.pipe(R.split('\n'), R.join(' '), R.split(/\s+/))),
    )(input);

    return {
        numbers,
        previousNumbers: [],
        boards,
        winners: [],
    };
};

export const run = () => {
    const input = loadInput('2021-04');

    console.log('Part 1:', part1(parse(input)));
    console.log('Part 2:', part2(parse(input)));
};
