import { RawData } from 'ws';

import { MESSAGE_ID } from '@/config';
import {
  PayloadMessage,
  RESPONSE_MESSAGE_TYPES,
  ResponseMessage,
} from '@/types/message';
import { Position, Ship } from '@/types/ships';
import { BoardShipStorage } from '@/types/storage';

export function parseMessage(data: RawData): PayloadMessage {
  const value = JSON.parse(data.toString());

  return { ...value, data: JSON.parse(value.data || '{}') };
}

export function prepareResponse(
  type: RESPONSE_MESSAGE_TYPES,
  data: ResponseMessage['data'],
): string {
  return JSON.stringify({ type, data: JSON.stringify(data), id: MESSAGE_ID });
}

export function parseShip({
  position: { x, y },
  length,
  direction,
}: Ship | BoardShipStorage): Array<Position> {
  return Array.from({ length }, (_, i) => ({
    x: direction ? x : x + i,
    y: direction ? y + i : y,
  }));
}
