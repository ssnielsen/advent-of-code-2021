import * as R from 'ramda';
import {loadInput} from '../util';

type Heightmap = number[][];
type Point = {x: number; y: number};
type Mask = {deltaX: number; deltaY: number}[];

const defaultMask = R.pipe(
    () => R.xprod([-1, 0, 1], [-1, 0, 1]),
    R.map(([deltaX, deltaY]) => ({
        deltaX,
        deltaY,
    })),
    R.filter(({deltaX, deltaY}) => deltaX !== 0 || deltaY !== 0),
)();

const basinMask = [
    {deltaX: -1, deltaY: 0},
    {deltaX: 1, deltaY: 0},
    {deltaX: 0, deltaY: 1},
    {deltaX: 0, deltaY: -1},
];

const surrounding = (
    point: Point,
    heightmap: Heightmap,
    mask: Mask = defaultMask,
) => {
    return R.pipe(
        R.map((mask: Mask[0]) => ({
            x: point.x + mask.deltaX,
            y: point.y + mask.deltaY,
        })),
        R.filter(
            ({x, y}) =>
                x >= 0 &&
                x < heightmap.length &&
                y >= 0 &&
                y < heightmap[0].length,
        ),
    )(mask);
};

const isLocalMinimum = (point: Point, heightmap: Heightmap) => {
    const localValue = heightmap[point.x][point.y];

    return R.pipe(
        point => surrounding(point, heightmap),
        R.map(({x, y}) => heightmap[x][y]),
        R.all(R.lt(localValue)),
    )(point);
};

const findAllLowPoints = (heightmap: Heightmap) => {
    const allPoints = R.xprod(
        R.range(0, heightmap.length),
        R.range(0, heightmap[0].length),
    ).map(([x, y]) => ({x, y}));

    const lowPoints = R.filter(
        point => isLocalMinimum(point, heightmap),
        allPoints,
    );

    return lowPoints;
};

const findBasin = (lowPoint: Point, heightmap: Heightmap): Point[] => {
    let visited: Point[] = [];
    let queue = [lowPoint];

    while (queue.length > 0) {
        const [point, ...newQueue] = queue;

        visited = [point, ...visited];

        const potentialBasinFriends = surrounding(point, heightmap, basinMask);

        const inBasin = R.filter(
            ({x, y}) =>
                heightmap[x][y] < 9 &&
                !R.any(v => v.x === x && v.y === y, visited),
            potentialBasinFriends,
        );

        queue = [...newQueue, ...inBasin];
    }

    return visited;
};

export const part1 = (heightmap: Heightmap) => {
    const lowPoints = findAllLowPoints(heightmap);

    const lowPointValues = R.map(({x, y}) => heightmap[x][y] + 1, lowPoints);

    return R.sum(lowPointValues);
};

export const part2 = (heightmap: Heightmap) => {
    return R.pipe(
        () => findAllLowPoints(heightmap),
        R.map(
            R.pipe(
                (point: Point) => findBasin(point, heightmap),
                R.uniqWith(
                    (p1: Point, p2: Point) => p1.x === p2.x && p1.y === p2.y,
                ),
                R.length,
            ),
        ),
        R.sort((a, b) => b - a),
        R.take(3),
        R.product,
    )();
};

export const parse = (input: string[]): Heightmap =>
    R.map(R.pipe(R.split(''), R.map(Number)), input);

export const run = () => {
    const input = loadInput('2021-09');

    console.log('Part 1:', part1(parse(input)));
    console.log('Part 2:', part2(parse(input)));
};
