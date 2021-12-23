import * as R from 'ramda';
import {A, F, N, D, pipe, S} from '@mobily/ts-belt';

import {loadInput} from '../util';

enum PacketVersion {}

enum PacketTypeId {
    LiteralValue = 4,
}

enum LengthTypeId {
    Type0 = 0,
    Type1 = 1,
}

type Packet = {
    packetVersion: number;
} & (
    | {
          packetType: 'LiteralValue';
          value: number;
      }
    | {
          packetType: number;
          packets: Packet[];
      }
);

const extractLiteralValue = (input: string): string => {
    const [prefix, ...bits] = S.slice(input, 0, 5);
    const group = A.join(bits, '');

    switch (prefix) {
        case '0':
            return group;
        case '1':
            return group + pipe(input, S.sliceToEnd(5), extractLiteralValue);
        default:
            throw new Error('Bad data!');
    }
};

const getNecessaryPadding = (input: string) => {
    return Math.ceil(input.length / 4) * 4;
};

const padStart = (input: string) => {
    return input.padStart(getNecessaryPadding(input), '0');
};

const parsePacket = (input: string) => {
    const rawPackageVersion = pipe(input, S.slice(0, 3), parseBinary);
    const rawPackageTypeId = pipe(input, S.slice(3, 6), parseBinary);

    switch (rawPackageTypeId) {
        case PacketTypeId.LiteralValue: {
            const literalValueBits = pipe(
                input,
                S.sliceToEnd(6),
                extractLiteralValue,
            );

            const bitStringLengthSoFar =
                3 + 3 + literalValueBits.length + literalValueBits.length / 4;
            const totalPackageSize = Math.ceil(bitStringLengthSoFar / 4) * 4;
            const unlabeledBits = totalPackageSize - bitStringLengthSoFar;

            // TODO: SOMETHING HERE
            // console.log({
            //     bitStringLengthSoFar,
            //     totalPackageSize,
            //     unlabeledBits,
            // });
        }
        // An operator package
        default: {
            const lengthTypeId = pipe(input, S.slice(6, 7), parseBinary);

            switch (lengthTypeId) {
                case LengthTypeId.Type0:
                    const lengthOfSubpacketBits = pipe(
                        input,
                        S.slice(7, 22),
                        parseBinary,
                    );
                    console.log({lengthTypeId, lengthOfSubpacketBits});

                    return;
                case LengthTypeId.Type1:
                    const numberOfSubpackets = pipe(
                        input,
                        S.slice(7, 18),
                        parseBinary,
                    );
                    // TODO: SOMETHING HERE
                    return;
                default:
                    throw new Error('Bad LengthTypeId');
            }
        }
    }
};

export const part1 = (input: string) => {
    parsePacket(input);
    return input;
};

const parseHex = (number: string) => Number.parseInt(number, 16);
const parseBinary = (number: string) => Number.parseInt(number, 2);

export const parse = (input: string[]) => {
    return pipe(
        input,
        A.getUnsafe(0),

        // Parse to binary
        S.split(''),
        A.splitEvery(32),
        A.map(chunk => {
            return pipe(chunk, A.join(''), parseHex, parsedHex =>
                parsedHex.toString(2),
            );
        }),
        A.join(''),
        padStart,

        // Lose suffixed zeros - or should we?? 🤔
        // S.replaceByRe(/0*$/, ''),
    );
};

export const run = () => {
    const input = loadInput('2021-16');

    // console.log('Part 1:', part1(parse(literalValueTestInput)));
    console.log('Part 1:', part1(parse(operatorTestInput)));
};

const literalValueTestInput = 'D2FE28'.split('\n');
const operatorTestInput = '38006F45291200'.split('\n');
