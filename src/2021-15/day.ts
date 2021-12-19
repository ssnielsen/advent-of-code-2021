import * as R from 'ramda';
import {A, F, N, D, pipe, S} from '@mobily/ts-belt';

import {loadInput} from '../util';

type Grid = ReturnType<typeof parse>;
type Point = {x: number; y: number};
type Mask = readonly {deltaX: number; deltaY: number}[];

const defaultMask = [
    // {deltaX: -1, deltaY: 0},
    {deltaX: 1, deltaY: 0},
    // {deltaX: 0, deltaY: -1},
    {deltaX: 0, deltaY: 1},
];

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

// function Dijkstra(Graph, source):
//  2
//  3      create vertex set Q
//  4
//  5      for each vertex v in Graph:
//  6          dist[v] ← INFINITY
//  7          prev[v] ← UNDEFINED
//  8          add v to Q
//  9      dist[source] ← 0
// 10
// 11      while Q is not empty:
// 12          u ← vertex in Q with min dist[u]
// 13
// 14          remove u from Q
// 15
// 16          for each neighbor v of u still in Q:
// 17              alt ← dist[u] + length(u, v)
// 18              if alt < dist[v]:
// 19                  dist[v] ← alt
// 20                  prev[v] ← u
// 21
// 22      return dist[], prev[]

const dijkstra = (grid: Grid, source: Point, target: Point) => {
    var Q: Point[] = R.xprod(
        A.range(0, grid.length - 1),
        A.range(0, grid[0].length - 1),
    ).map(([x, y]) => ({x, y}));

    var dist = pipe(
        A.repeat(grid.length, A.repeat(grid[0].length, Number.MAX_VALUE)),
        A.updateAt(source.x, A.updateAt(source.y, F.always(0))),
    ) as number[][];

    var prev = A.repeat(
        grid.length,
        A.repeat<Point | undefined>(grid[0].length, undefined),
    ) as (Point | undefined)[][];

    while (Q.length > 0) {
        const [u] = A.sort(Q, (p1, p2) => dist[p1.x][p1.y] - dist[p2.x][p2.y]);

        Q = A.reject(Q, ({x, y}) => x === u.x && y === u.y) as Point[];

        if (u.x === target.x && u.y === target.y) {
            return {dist, prev};
        }

        const neighborsNotInQ = A.filter(surrounding(u, grid), ({x, y}) =>
            A.some(Q, q => x === q.x && y === q.y),
        );

        neighborsNotInQ.forEach(v => {
            const alt = dist[u.x][u.y] + grid[v.x][v.y];

            if (alt < dist[v.x][v.y]) {
                dist = A.updateAt(
                    dist,
                    v.x,
                    line => A.updateAt(line, v.y, () => alt) as number[],
                ) as number[][];

                prev = A.updateAt(
                    prev,
                    v.x,
                    line =>
                        A.updateAt(line, v.y, () => ({...u})) as (
                            | Point
                            | undefined
                        )[],
                ) as (Point | undefined)[][];
            }
        });
    }

    return {dist, prev};
};

const shortestPath = (grid: Grid, source: Point, target: Point) => {
    const {dist, prev} = dijkstra(grid, source, target);

    let path = [target];

    while (!(path[0].x === source.x && path[0].y === source.y)) {
        const current = path[0];

        path = [prev[current.x][current.y]!, ...path];
    }

    return path;
};

export const part1 = (grid: Grid) => {
    return pipe(
        grid,
        grid =>
            shortestPath(
                grid,
                {x: 0, y: 0},
                {x: grid.length - 1, y: grid[0].length - 1},
            ),
        A.map(point => grid[point.x][point.y]),
        A.reduce(0, N.add),
        N.subtract(grid[0][0]),
    );
};

export const parse = (input: string[]) => {
    return pipe(
        input,
        A.map(line => {
            return pipe(line, S.split(''), A.map(Number));
        }),
    );
};

export const run = () => {
    const input = loadInput('2021-15');

    console.log('Part 1:', part1(parse(input)));
};

const testInput = `
1163751742
1381373672
2136511328
3694931569
7463417111
1319128137
1359912421
3125421639
1293138521
2311944581
`
    .trim()
    .split('\n');
