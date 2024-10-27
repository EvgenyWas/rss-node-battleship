import { ID } from '.';

export type ShipType = 'small' | 'medium' | 'large' | 'huge';

export interface Position {
  x: number;
  y: number;
}

export interface Ship {
  position: Position;
  direction: boolean;
  length: number;
  type: ShipType;
}

export interface AddShipsPayload {
  gameId: ID;
  ships: Array<Ship>;
  indexPlayer: ID;
}

export interface StartGameResponse {
  ships: Array<Ship>;
  currentPlayerIndex: ID;
}
