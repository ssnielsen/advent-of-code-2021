import fs from 'fs';
import * as R from 'ramda';

export const loadInput = (day: string) =>
    R.pipe(
        R.tap(filename => console.log(`Reading file from ${filename}`)),
        (filename: string) => fs.readFileSync(filename, 'utf-8'),
        R.trim,
        R.split('\n'),
    )(`${__dirname}/${day}/input`);

export const loadRawInput = (day: string) =>
    R.pipe(
        R.tap(filename => console.log(`Reading file from ${filename}`)),
        (filename: string) => fs.readFileSync(filename, 'utf-8'),
        R.trim,
    )(`${__dirname}/${day}/input`);

export const hasValue = <T>(thing: T | undefined | null): thing is T =>
    Boolean(thing);
