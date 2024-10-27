import { parseMessage, prepareResponse, parseShip } from '@/utils/mappers';
import { MESSAGE_ID } from '@/config';
import { RESPONSE_MESSAGE_TYPES } from '@/types/message';

describe('utils/mappers', () => {
  it.each`
    data                                                         | expected
    ${Buffer.from(JSON.stringify({ data: '{}' }))}               | ${{ data: {} }}
    ${Buffer.from(JSON.stringify({ data: '{"key": "value"}' }))} | ${{ data: { key: 'value' } }}
    ${Buffer.from(JSON.stringify({ data: null }))}               | ${{ data: {} }}
  `('should parse $data and return $expected', ({ data, expected }) => {
    expect(parseMessage(data)).toMatchObject(expected);
  });

  it.each`
    type                             | data                   | expected
    ${RESPONSE_MESSAGE_TYPES.ATTACK} | ${{ key: 'value' }}    | ${JSON.stringify({ type: RESPONSE_MESSAGE_TYPES.ATTACK, data: JSON.stringify({ key: 'value' }), id: MESSAGE_ID })}
    ${RESPONSE_MESSAGE_TYPES.TURN}   | ${null}                | ${JSON.stringify({ type: RESPONSE_MESSAGE_TYPES.TURN, data: JSON.stringify(null), id: MESSAGE_ID })}
    ${RESPONSE_MESSAGE_TYPES.FINISH} | ${{ anotherKey: 123 }} | ${JSON.stringify({ type: RESPONSE_MESSAGE_TYPES.FINISH, data: JSON.stringify({ anotherKey: 123 }), id: MESSAGE_ID })}
  `(
    'should prepare response of type $type with data $data and return $expected',
    ({ type, data, expected }) => {
      expect(prepareResponse(type, data)).toBe(expected);
    },
  );

  it.each`
    inputShip                                                    | expectedPositions
    ${{ position: { x: 1, y: 2 }, length: 3, direction: true }}  | ${[{ x: 1, y: 2 }, { x: 1, y: 3 }, { x: 1, y: 4 }]}
    ${{ position: { x: 1, y: 2 }, length: 2, direction: false }} | ${[{ x: 1, y: 2 }, { x: 2, y: 2 }]}
    ${{ position: { x: 0, y: 0 }, length: 4, direction: true }}  | ${[{ x: 0, y: 0 }, { x: 0, y: 1 }, { x: 0, y: 2 }, { x: 0, y: 3 }]}
  `(
    'should parse ship $inputShip and return positions $expectedPositions',
    ({ inputShip, expectedPositions }) => {
      expect(parseShip(inputShip)).toEqual(expectedPositions);
    },
  );
});
