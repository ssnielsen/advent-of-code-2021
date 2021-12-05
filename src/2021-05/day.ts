import * as R from 'ramda';
import {loadInput} from '../util';

type Coord = {
    x: number;
    y: number;
};

type Line = {
    from: Coord;
    to: Coord;
};

type Diagram = number[][];

type Direction = 'horizontal' | 'vertical' | 'diagonal';

const isHorizontal = (line: Line) => {
    return line.from.y === line.to.y;
};

const isVertical = (line: Line) => {
    return line.from.x === line.to.x;
};

const isStraight = (line: Line) => {
    return R.anyPass([isHorizontal, isVertical])(line);
};

const directionOfLine = (line: Line): Direction => {
    if (isHorizontal(line)) {
        return 'horizontal';
    } else if (isVertical(line)) {
        return 'vertical';
    } else {
        return 'diagonal';
    }
};

const pointsCoveredByLine = (line: Line): Coord[] => {
    switch (directionOfLine(line)) {
        case 'horizontal':
            return R.range(
                R.min(line.from.x, line.to.x),
                R.max(line.from.x, line.to.x) + 1,
            ).map(x => ({
                x,
                y: line.from.y,
            }));
        case 'vertical':
            return R.range(
                R.min(line.from.y, line.to.y),
                R.max(line.from.y, line.to.y) + 1,
            ).map(y => ({
                y,
                x: line.from.x,
            }));
        case 'diagonal': {
            const minX = R.min(line.from.x, line.to.x);
            const minY = R.min(line.from.y, line.to.y);
            const maxX = R.max(line.from.x, line.to.x);
            const maxY = R.max(line.from.y, line.to.y);

            const xs = R.range(minX, maxX + 1);
            const ys = R.range(minY, maxY + 1);

            const shouldReverseXs = minX === line.to.x;
            const shouldReverseYs = minY === line.to.y;

            const diagonal = R.zip(
                shouldReverseXs ? xs.reverse() : xs,
                shouldReverseYs ? ys.reverse() : ys,
            ).map(([x, y]) => ({x, y}));

            return diagonal;
        }
    }
};

// TODO: Make immutable...
const plotPoint = (diagram: Diagram, point: Coord): Diagram => {
    const line = diagram[point.x] ?? [];
    line[point.y] = (line[point.y] ?? 0) + 1;
    diagram[point.x] = line;

    return diagram;
};

const plotLine = (diagram: Diagram, line: Line): Diagram => {
    const points = pointsCoveredByLine(line);

    const newDiagram = points.reduce(plotPoint, diagram);

    return newDiagram;
};

const printDiagram = (diagram: Diagram) => {
    R.transpose(diagram).forEach(line => {
        console.log(
            line
                .map(a => a ?? '.')
                .join('')
                .padEnd(10, '.'),
        );
    });
    console.log();
    console.log(R.repeat('-', 20).join(''));
    console.log();
};

const countPointsWithOverlappingLines = (lines: Line[]): number => {
    const endState = R.reduce(plotLine, [], lines);

    const allPoints = R.flatten(endState);

    const pointsWithOverlaps = allPoints.filter(point => point >= 2);

    return pointsWithOverlaps.length;
};

export const part1 = (lines: Line[]) => {
    const onlyStraightLines = R.filter(isStraight, lines);

    return countPointsWithOverlappingLines(onlyStraightLines);
};

export const part2 = (lines: Line[]) => {
    return countPointsWithOverlappingLines(lines);
};

export const parse = (input: string[]): Line[] => {
    const result = R.map(
        R.pipe(
            R.split(' -> '),
            R.map(R.pipe(R.split(','), R.map(Number), ([x, y]) => ({x, y}))),
            ([from, to]) => ({from, to}),
        ),
    )(input);

    return result;
};

const testInput = `0,9 -> 5,9
8,0 -> 0,8
9,4 -> 3,4
2,2 -> 2,1
7,0 -> 7,4
6,4 -> 2,0
0,9 -> 2,9
3,4 -> 1,4
0,0 -> 8,8
5,5 -> 8,2`;

export const run = () => {
    const input = loadInput('2021-05');

    const _testInput = testInput.split('\n');

    console.log('Part 1:', part1(parse(input)));
    console.log('Part 2:', part2(parse(input)));
};
