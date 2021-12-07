import * as R from 'ramda';
import {loadInput} from '../util';

export const part1 = (strings: string[]) => {
    // const regex = /(\w)((?!\1)[\w])\2\1.*\[|\](\w)((?!\3)[\w])\4\3.*/;
    const regex = /(\w)((?!\1)[\w])\2\1.*\[|\](\w)((?!\3)[\w])\4\3/;

    const squareRegex = /\[.*(\w)((?!\1)[\w])\2\1.*\]/;

    return strings.filter(s => regex.test(s) && !squareRegex.test(s)).length;
};

export const part2 = (strings: string[]) => {
    const regex =
        /(\w)((?!\1)[\w])\1.*\[.*\2\1\2.*\]|\[.*(\w)((?!\3)[\w])\3.*\].*\4\3\4.*/;

    return R.filter(R.test(regex), strings).length;
};

export const parse = (input: string[]) => input;

export const run = () => {
    const input = loadInput('2021-07');

    console.log('Part 1:', part1(input));
    console.log('Part 1:', part2(input));
};
