import * as R from 'ramda';
import {A, F, D, pipe, S} from '@mobily/ts-belt';

import {loadRawInput} from '../util';

type Dot = {x: number; y: number};
type Fold = {axis: 'x' | 'y'; position: number};
type Grid = readonly (readonly boolean[])[];
type Input = {dots: readonly Dot[]; folds: readonly Fold[]; grid: Grid};

const performVerticalFold = (
    position: number,
    grid: Grid,
    dotsInGrid: readonly Dot[],
) => {
    const dotsBelow = dotsInGrid.filter(({y}) => y > position);

    return A.reduce(dotsBelow, grid, (grid, {x, y}) => {
        const distance = y - position;
        const gridAfterFolding = A.updateAt(
            grid,
            x,
            A.updateAt(position - distance, F.always(true)),
        );
        return A.updateAt(gridAfterFolding, x, A.updateAt(y, F.always(false)));
    });
};

const performHorizontalFold = (
    position: number,
    grid: Grid,
    dotsInGrid: readonly Dot[],
) => {
    const dotsToTheLeft = dotsInGrid.filter(({x}) => x > position);

    return A.reduce(dotsToTheLeft, grid, (grid, {x, y}) => {
        const distance = x - position;
        const gridAfterFolding = A.updateAt(
            grid,
            position - distance,
            A.updateAt(y, F.always(true)),
        );
        return A.updateAt(gridAfterFolding, x, A.updateAt(y, F.always(false)));
    });
};

const getAllCurrentDots = (grid: Grid) => {
    const maxX = grid.length;
    const maxY = grid[0].length;

    return pipe(
        R.xprod(A.range(0, maxX - 1), A.range(0, maxY - 1)),
        A.filter(([x, y]) => grid[x][y]),
        A.map(([x, y]) => ({x, y})),
    );
};

const performFold = (fold: Fold, grid: Grid) => {
    const allDots = getAllCurrentDots(grid);

    switch (fold.axis) {
        case 'x':
            return performHorizontalFold(fold.position, grid, allDots);
        case 'y':
            return performVerticalFold(fold.position, grid, allDots);
    }
};

export const part1 = (input: Input) => {
    const result = pipe(
        input.folds,
        A.take(1), // Only do a single fold...
        A.reduce(input.grid, (grid, fold) => {
            const newGrid = performFold(fold, grid);
            return newGrid;
        }),
        getAllCurrentDots,
        A.length,
    );

    return result;
};

export const part2 = (input: Input) => {
    const result = pipe(
        input.folds,
        A.reduce(input.grid, (grid, fold) => {
            const newGrid = performFold(fold, grid);
            return newGrid;
        }),
        finalGrid => {
            const dotsInFinalGrid = getAllCurrentDots(finalGrid);
            const xs = pipe(dotsInFinalGrid, A.map(D.getUnsafe('x')));
            const ys = pipe(dotsInFinalGrid, A.map(D.getUnsafe('y')));
            const maxX = A.reduce(xs, Number.MIN_VALUE, Math.max);
            const maxY = A.reduce(ys, Number.MIN_VALUE, Math.max);

            // Cut the grid such that it fit the dots
            return pipe(
                A.take(finalGrid, maxX + 1),
                A.map(line => A.take(line, maxY + 1)),
            );
        },
    );

    return result;
};

const printGrid = (grid: Grid) => {
    pipe(
        grid,
        // @ts-ignore
        R.transpose,
        A.map(line => {
            pipe(
                line,
                A.map(dot => (dot ? '#' : '.')),
                A.join(''),
                F.tap(console.log),
            );
        }),
        F.tap(() => {
            console.log('');
            console.log('------------------');
            console.log('');
        }),
    );
};

export const parse = (input: string) => {
    const [rawDots, rawFolds] = pipe(input, S.split('\n\n'));

    const dots = pipe(
        rawDots,
        S.split('\n'),
        A.map(line =>
            pipe(line, S.split(','), A.map(Number), ([x, y]) => ({
                x,
                y,
            })),
        ),
    );

    const folds = pipe(
        rawFolds,
        S.split('\n'),
        A.map(fold =>
            pipe(
                fold,
                S.replace('fold along ', ''),
                S.split('='),
                ([axis, position]) => ({
                    axis: axis as 'x' | 'y',
                    position: Number(position),
                }),
            ),
        ),
    );

    const grid = pipe(dots, dots => {
        const xs = pipe(dots, A.map(D.getUnsafe('x')));
        const ys = pipe(dots, A.map(D.getUnsafe('y')));
        const maxX = A.reduce(xs, Number.MIN_VALUE, Math.max);
        const maxY = A.reduce(ys, Number.MIN_VALUE, Math.max);

        const bareGrid = A.repeat(maxX + 1, A.repeat(maxY + 1, false));

        return A.reduce(dots, bareGrid, (grid, {x, y}) => {
            return A.updateAt(grid, x, A.updateAt(y, F.always(true)));
        });
    });

    return {dots, folds, grid};
};

export const run = () => {
    const input = loadRawInput('2021-13');

    console.log('Part 1:', part1(parse(input)));
    console.log('Part 2:');
    printGrid(part2(parse(input)));
};

const testInput = `
6,10
0,14
9,10
0,3
10,4
4,11
6,0
6,12
4,1
0,13
10,12
3,4
3,0
8,4
1,10
2,14
8,10
9,0

fold along y=7
fold along x=5
`.trim();
