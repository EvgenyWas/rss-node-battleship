import { WebSocket } from 'ws';

import { BOARD_MAX_POSITION, BOARD_MIN_POSITION } from '@/config';
import {
  isAuthorizedClient,
  isNumber,
  isPositionWithinBoard,
  isString,
} from '@/utils/validators';

describe('utils/validators', () => {
  it.each`
    value        | expected
    ${5}         | ${true}
    ${-10}       | ${true}
    ${3.14}      | ${true}
    ${NaN}       | ${false}
    ${Infinity}  | ${false}
    ${'string'}  | ${false}
    ${null}      | ${false}
    ${undefined} | ${false}
    ${{}}        | ${false}
  `(
    'should return $expected when checking if $value is a number',
    ({ value, expected }) => {
      expect(isNumber(value)).toBe(expected);
    },
  );

  it.each`
    value           | expected
    ${'hello'}      | ${true}
    ${''}           | ${true}
    ${String('hi')} | ${true}
    ${123}          | ${false}
    ${null}         | ${false}
    ${undefined}    | ${false}
    ${true}         | ${false}
    ${{}}           | ${false}
  `(
    'should return $expected when checking if $value is a string',
    ({ value, expected }) => {
      expect(isString(value)).toBe(expected);
    },
  );

  it.each`
    client                                             | expected
    ${{ id: 'user123', readyState: WebSocket.OPEN }}   | ${true}
    ${{ id: '', readyState: WebSocket.CONNECTING }}    | ${false}
    ${{ id: 'user123', readyState: WebSocket.CLOSED }} | ${false}
    ${{ id: 123, readyState: WebSocket.OPEN }}         | ${false}
    ${{}}                                              | ${false}
  `(
    'should return $expected when checking if $client is an authorized client',
    ({ client, expected }) => {
      expect(isAuthorizedClient(client as WebSocket)).toBe(expected);
    },
  );

  it.each`
    position                                                | expected
    ${{ x: BOARD_MIN_POSITION, y: BOARD_MIN_POSITION }}     | ${true}
    ${{ x: BOARD_MAX_POSITION, y: BOARD_MAX_POSITION }}     | ${true}
    ${{ x: BOARD_MIN_POSITION - 1, y: BOARD_MIN_POSITION }} | ${false}
    ${{ x: BOARD_MAX_POSITION + 1, y: BOARD_MAX_POSITION }} | ${false}
    ${{ x: 5, y: BOARD_MIN_POSITION - 1 }}                  | ${false}
    ${{ x: BOARD_MAX_POSITION + 1, y: 5 }}                  | ${false}
  `(
    'should return $expected when checking if $position is within board',
    ({ position, expected }) => {
      expect(isPositionWithinBoard(position)).toBe(expected);
    },
  );
});
