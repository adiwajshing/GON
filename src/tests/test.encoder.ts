import fs from 'fs';
import { Terminals } from "../types";
import GON from "..";

const terms: Terminals = {
  arrayStart: 0xF0,
  arrayEnd: 0xF1,

  objectStart: 0xF2,
  objectEnd: 0xF3,
  
  byte: 0xFA,
  short: 0xFB,
  int: 0xFC,
  long: 0xFD,

  double: 0xFE,
  float: 0xFF,

  booleanTrue: 0xF4,
  booleanFalse: 0xF5,

  string: 0xF6,

  null: 0xD0,
  backspace: 0xD8,
  htab: 0xD9,
  linefeed: 0xDA,
  formfeed: 0xDC,
  carriagereturn: 0xDD
};

let parser;

beforeAll(() => {
  parser = GON({
    terminals: terms
  });
});

describe('Encoder', () => {
  it('Should encode null', () => {
    let inputData = null;
    const expected = Buffer.from([terms.null]);
    const actual = parser.encode(inputData);

    const path = __dirname + '/../../build/';
    fs.writeFileSync(path + "null_test.bin", actual, 'binary');
    
    expect(actual).toEqual(expected);
  });

  it('Should encode boolean true', () => {
    let inputData = true;
    const expected = Buffer.from([terms.booleanTrue]);
    const actual = parser.encode(inputData);

    const path = __dirname + '/../../build/';
    fs.writeFileSync(path + "true_test.bin", actual, 'binary');
    
    expect(actual).toEqual(expected);
  });

  it('Should encode boolean false', () => {
    let inputData = false;
    const expected = Buffer.from([terms.booleanFalse]);
    const actual = parser.encode(inputData);

    const path = __dirname + '/../../build/';
    fs.writeFileSync(path + "false_test.bin", actual, 'binary');
    
    expect(actual).toEqual(expected);
  });
});
