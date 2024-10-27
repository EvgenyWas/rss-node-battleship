import { WebSocket } from 'ws';

import { ExtendedWS } from '@/types/ws';
import { Position } from '@/types/ships';
import { BOARD_MAX_POSITION, BOARD_MIN_POSITION } from '@/config';

export function isNumber(value: unknown): value is number {
  return typeof value === 'number' && isFinite(value);
}

export function isString(value: unknown): value is string {
  return typeof value === 'string' || value instanceof String;
}

export function isAuthorizedClient(client: WebSocket): client is ExtendedWS {
  return (
    'id' in client &&
    isString(client.id) &&
    !!client.id &&
    client.readyState === WebSocket.OPEN
  );
}

export function isPositionWithinBoard({ x, y }: Position): boolean {
  return (
    x >= BOARD_MIN_POSITION &&
    x <= BOARD_MAX_POSITION &&
    y >= BOARD_MIN_POSITION &&
    y <= BOARD_MAX_POSITION
  );
}
