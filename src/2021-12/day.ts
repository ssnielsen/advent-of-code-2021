import {A, pipe, S} from '@mobily/ts-belt';

import {loadInput} from '../util';

type Node = {size: 'big' | 'small'; name: string; edges: readonly string[]};

type Graph = Map<string, Node>;

const getCaveSize = (name: string) => {
    return S.match(name, /[A-Z]+/) ? 'big' : 'small';
};

const makeNode = (name: string): Node => {
    return {
        name,
        size: getCaveSize(name),
        edges: [],
    };
};

const insertEdge = (node: Node, edgeTo: string): Node => {
    return {
        ...node,
        edges: A.append(node.edges, edgeTo),
    };
};

const findPaths = (
    graph: Graph,
    start: string,
    end: string,
    path: string[] = [],
    canNotVisitNode: (node: Node, currentPath: string[]) => boolean,
) => {
    const pathWithStart = [...path, start];

    if (start === end) {
        return [pathWithStart];
    }

    const paths = new Array<string[]>();

    graph.get(start)!.edges.forEach(to => {
        const toNode = graph.get(to)!;

        if (canNotVisitNode(toNode, path)) {
            return;
        }

        const newPaths = findPaths(
            graph,
            to,
            end,
            pathWithStart,
            canNotVisitNode,
        );
        newPaths.forEach(newPath => {
            paths.push(newPath);
        });
    });

    return paths;
};

const printPaths = (paths: readonly string[][]) => {
    pipe(
        paths,
        A.forEach(path => {
            console.log(path.join(','));
        }),
    );
};

export const part1 = (graph: Graph) => {
    return pipe(
        findPaths(
            graph,
            'start',
            'end',
            [],
            (node, path) => node.size === 'small' && path.includes(node.name),
        ),
        A.length,
    );
};

export const part2 = (graph: Graph) => {
    const smallNodes = [...graph.keys()].filter(
        name => S.match(name, /[a-z]+/) && name !== 'start' && name !== 'end',
    );

    return pipe(
        findPaths(graph, 'start', 'end', [], (node, path) => {
            switch (node.size) {
                case 'big':
                    return false;
                case 'small': {
                    const isStartOrEnd =
                        node.name === 'start' || node.name === 'end';
                    const alreadyVisitedOnce = path.includes(node.name);
                    const hasVisitedAnySmallTwice = smallNodes.some(
                        smallNode =>
                            path.filter(stop => stop === smallNode).length ===
                            2,
                    );

                    return (
                        (isStartOrEnd && alreadyVisitedOnce) ||
                        (hasVisitedAnySmallTwice && alreadyVisitedOnce)
                    );
                }
            }
        }),
        A.filter(path => {
            const counts = A.reduce(
                path,
                {} as {[k: string]: number},
                (counts, elem) => {
                    return {
                        ...counts,
                        [elem]: (counts[elem] ?? 0) + 1,
                    };
                },
            );

            const smallCavesVisitedTwice = Object.entries(counts).filter(
                ([name, counts]) => {
                    return S.match(name, /[a-z]+/) && counts === 2;
                },
            );

            return smallCavesVisitedTwice.length <= 1;
        }),
        A.length,
    );
};

export const parse = (input: string[]) => {
    return pipe(
        input,
        A.reduce(new Map<string, Node>(), (graphl, edge) => {
            const [from, to] = S.split(edge, '-');
            const nodeFrom = graphl.get(from) ?? makeNode(from);
            const nodeTo = graphl.get(to) ?? makeNode(to);

            const updatedFrom = insertEdge(nodeFrom, to);
            const updatedTo = insertEdge(nodeTo, from);

            return pipe(
                graphl,
                g => g.set(from, updatedFrom),
                g => g.set(to, updatedTo),
            );
        }),
    );
};

export const run = () => {
    const input = loadInput('2021-12');

    console.log('Part 1:', part1(parse(input)));
    // console.log('Part 2:', part2(parse(testInput1)));
    // console.log('Part 2:', part2(parse(testInput2)));
    console.log('Part 2:', part2(parse(input)));
};

const testInput1 = `
start-A
start-b
A-c
A-b
b-d
A-end
b-end
`
    .trim()
    .split('\n');
const testInput2 = `
dc-end
HN-start
start-kj
dc-start
dc-HN
LN-dc
HN-end
kj-sa
kj-HN
kj-dc
`
    .trim()
    .split('\n');
