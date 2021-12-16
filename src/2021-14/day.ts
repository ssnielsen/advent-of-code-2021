import * as R from 'ramda';
import {A, F, N, D, pipe, S, O} from '@mobily/ts-belt';

import {loadRawInput} from '../util';

type Template = string;
// type Rule = {adjacent: string; inbetween: string};
type Input = ReturnType<typeof parse>;

const stepNaive = (template: Template, rules: Input['rules']): string => {
    return pipe(
        template,
        S.split(''),
        R.aperture(2),
        A.map((pair: string[]) => {
            const joined = A.join(pair, '');
            const ruleMatch = rules[joined];

            const mappedRule = ruleMatch
                ? A.insertAt(pair, 1, ruleMatch)
                : pair;

            if (mappedRule.length === 2) {
                return mappedRule[0];
            } else if (mappedRule.length === 3) {
                return pipe(mappedRule, A.take(2), A.join(''));
            } else {
                throw new Error('Bad rule!');
            }
        }),
        A.append(template[template.length - 1]), // Add the last element back :smile:
        A.join(''),
    );
};

const runNTimesNaive = (input: Input, times: number) => {
    return pipe(
        A.range(1, times),
        A.reduce(input.template, template => stepNaive(template, input.rules)),
        S.split(''),
        A.groupBy(F.identity),
        D.values,
        A.sortBy(array => array?.length),
        a => {
            const leastCommon = A.getUnsafe(a, 0)!;
            const mostCommon = A.getUnsafe(a, a.length - 1)!;

            return mostCommon.length - leastCommon.length;
        },
    );
};

type PairCount = {[pair: string]: number};

const stepFast = (rules: Input['rules'], pairCount: PairCount) => {
    const result = Object.entries(pairCount).reduce(
        (pairCount, [pair, count]) => {
            const first = `${pair[0]}${rules[pair]}`;
            const second = `${rules[pair]}${pair[1]}`;

            return {
                ...pairCount,
                [first]: (pairCount[first] ?? 0) + count,
                [second]: (pairCount[second] ?? 0) + count,
            };
        },
        {} as PairCount,
    );

    return result;
};

const runNTimesFast = (input: Input, times: number) => {
    const initialPairCount = pipe(
        input.template,
        S.split(''),
        R.aperture(2),
        A.map(A.join('')),
        R.countBy(F.identity),
    );

    return pipe(
        A.range(1, times),
        A.reduce(initialPairCount, pairCount => {
            return stepFast(input.rules, pairCount);
        }),
        // @ts-ignore
        D.toPairs,
        A.map(
            ([pair, count]: [string, number]) =>
                [pair[0], count] as [string, number],
        ),
        A.groupBy(([letter]) => letter),
        D.toPairs,
        A.map(([letter, groups]: [string, [string, number][]]) => {
            return [
                letter,
                pipe(
                    groups,
                    A.map(([, count]) => count),
                    A.reduce(0, N.add),
                ),
            ];
        }),
        A.sortBy(([, counts]) => counts),
        a => {
            const lastLetter = input.template[input.template.length - 1];
            const updated = a.map(([letter, count]: any) => [
                letter,
                letter === lastLetter ? count + 1 : count,
            ]);

            const leastCommon = A.getUnsafe(updated, 0)![1];
            const mostCommon = A.getUnsafe(updated, updated.length - 1)![1];

            return mostCommon - leastCommon;
        },
    );
};

export const part1 = (input: Input) => runNTimesNaive(input, 10);
export const part2 = (input: Input) => runNTimesFast(input, 40);

export const parse = (input: string) => {
    return pipe(input, S.split('\n\n'), ([template, rules]) => {
        return {
            template,
            rules: pipe(
                rules,
                S.split('\n'),
                A.reduce({} as {[s: string]: string}, (object, rule) => {
                    const [adjacent, inbetween] = S.split(rule, ' -> ');

                    return {
                        ...object,
                        [adjacent]: inbetween,
                    };
                }),
            ),
        };
    });
};

export const run = () => {
    const input = loadRawInput('2021-14');

    console.log('Part 1:', part1(parse(input)));
    console.log('Part 2:', part2(parse(input)));
};

const testInput = `
NNCB

CH -> B
HH -> N
CB -> H
NH -> C
HB -> C
HC -> B
HN -> C
NN -> C
BH -> H
NC -> B
NB -> B
BN -> B
BB -> N
BC -> B
CC -> N
CN -> C
`.trim();
