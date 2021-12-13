import * as R from 'ramda';
import {A, F, N, D, pipe, S} from '@mobily/ts-belt';

import {loadInput} from '../util';

type Grid = ReturnType<typeof parse>;

type Point = {x: number; y: number};
type Mask = readonly {deltaX: number; deltaY: number}[];

const mapGrid =
    <T>(f: (e: Grid[0][0]) => T) =>
    (grid: Grid) => {
        return pipe(
            grid,
            A.map(line => pipe(line, A.map(f))),
        );
    };

const increaseGridByOne = (grid: Grid) => mapGrid(N.add(1))(grid);

const defaultMask = pipe(
    R.xprod([-1, 0, 1], [-1, 0, 1]),
    A.map(([deltaX, deltaY]) => ({
        deltaX,
        deltaY,
    })),
    A.filter(({deltaX, deltaY}) => deltaX !== 0 || deltaY !== 0),
);

const allPoints = pipe(
    R.xprod(A.range(0, 9), A.range(0, 9)),
    A.map(([x, y]) => ({x, y})),
);

const surrounding = (point: Point, grid: Grid, mask: Mask = defaultMask) => {
    return pipe(
        mask,
        A.map((mask: Mask[0]) => ({
            x: point.x + mask.deltaX,
            y: point.y + mask.deltaY,
        })),
        A.filter(
            ({x, y}) =>
                x >= 0 && x < grid.length && y >= 0 && y < grid[0].length,
        ),
    );
};

const updatePointsInGrid = (
    grid: Grid,
    points: readonly Point[],
    f: (e: number) => number,
): Grid => {
    return pipe(
        points,
        A.reduce(grid, (grid, {x, y}) => {
            return A.updateAt(grid, x, line => A.updateAt(line, y, f));
        }),
    );
};

const increaseSurroundingByOne = (grid: Grid, point: Point): Grid => {
    const surroundingPoints = surrounding(point, grid);

    return updatePointsInGrid(grid, surroundingPoints, x =>
        x === -1 ? x : x + 1,
    );
};

const flashLoop = (grid: Grid, flashes = 0): {grid: Grid; flashes: number} => {
    // Find flashes
    const flashing = pipe(
        allPoints,
        A.filter(({x, y}) => grid[x][y] > 9),
    );

    // If no flashes, then we're done!
    if (flashing.length === 0) {
        return {
            grid,
            flashes,
        };
    }

    const resetFlashed = updatePointsInGrid(grid, flashing, F.always(-1));

    // Increase surrounding fields due to flashses
    const newGrid = pipe(
        flashing,
        A.reduce(resetFlashed, increaseSurroundingByOne),
    );

    return flashLoop(newGrid, flashes + flashing.length);
};

const iterateOnce = (grid: Grid, flashes: number) => {
    // Increase by one
    const increasedByOne = increaseGridByOne(grid);

    // Handle all the flashes
    const {grid: flashed, flashes: flashesAfterRound} = flashLoop(
        increasedByOne,
        flashes,
    );

    // Find the flashed points
    const pointsFlashedInRound = pipe(
        allPoints,
        A.filter(({x, y}) => flashed[x][y] === -1),
    );

    // Reset the points flashed in the iteration
    const newGrid = updatePointsInGrid(
        flashed,
        pointsFlashedInRound,
        F.always(0),
    );

    return {grid: newGrid, flashes: flashesAfterRound, pointsFlashedInRound};
};

export const part1 = (grid: Grid) => {
    return pipe(
        A.range(0, 99),
        A.reduce({grid, flashes: 0}, ({grid, flashes}, _) => {
            return iterateOnce(grid, flashes);
        }),
        D.get('flashes'),
    );
};

const runUntilAllFlashed = (grid: Grid, step = 1): number => {
    const {grid: newGrid, pointsFlashedInRound} = iterateOnce(grid, 0);

    if (pointsFlashedInRound.length === allPoints.length) {
        return step;
    }

    return runUntilAllFlashed(newGrid, step + 1);
};

const part2 = (grid: Grid) => {
    return runUntilAllFlashed(grid);
};

const printGrid = (grid: Grid) => {
    pipe(
        grid,
        A.map(grid => {
            console.log(grid.join(''));
        }),
        F.tap(() => console.log('----------')),
    );
};

export const parse = (input: string[]) =>
    pipe(
        input,
        A.map(line => pipe(line, S.split(''), A.map(Number))),
    );

export const run = () => {
    const input = loadInput('2021-11');

    console.log('Part 1:', part1(parse(input)));
    console.log('Part 2:', part2(parse(input)));
};
