import { omit, pick } from '@/utils/helpers';

describe('utils/helpers', () => {
  it.each`
    obj                           | keys          | expected
    ${{ a: 1, b: 2, c: 3 }}       | ${['a']}      | ${{ b: 2, c: 3 }}
    ${{ a: 1, b: 2, c: 3 }}       | ${['a', 'c']} | ${{ b: 2 }}
    ${{ a: 1, b: 2, c: 3 }}       | ${[]}         | ${{ a: 1, b: 2, c: 3 }}
    ${{}}                         | ${['a']}      | ${{}}
    ${{ a: 1, b: 2, c: 3, d: 4 }} | ${['b', 'd']} | ${{ a: 1, c: 3 }}
    ${{ x: 10, y: 20 }}           | ${['z']}      | ${{ x: 10, y: 20 }}
  `(
    'should omit keys $keys from object $obj and return $expected',
    ({ obj, keys, expected }) => {
      expect(omit(obj, ...keys)).toEqual(expected);
    },
  );

  it.each`
    obj                           | keys          | expected
    ${{ a: 1, b: 2, c: 3 }}       | ${['a']}      | ${{ a: 1 }}
    ${{ a: 1, b: 2, c: 3 }}       | ${['a', 'c']} | ${{ a: 1, c: 3 }}
    ${{ a: 1, b: 2, c: 3 }}       | ${[]}         | ${{}}
    ${{}}                         | ${['a']}      | ${{}}
    ${{ a: 1, b: 2, c: 3, d: 4 }} | ${['b', 'd']} | ${{ b: 2, d: 4 }}
    ${{ x: 10, y: 20 }}           | ${['z']}      | ${{}}
  `(
    'should pick keys $keys from object $obj and return $expected',
    ({ obj, keys, expected }) => {
      expect(pick(obj, ...keys)).toEqual(expected);
    },
  );
});
