import { ID } from '.';
import { Position, Ship } from './ships';
import { UserPayload } from './user';

export interface UserStorage extends UserPayload {
  id: string;
}

export type ParsedShipStorage = Array<Position>;

export interface BoardShipStorage extends Ship {
  parsed: ParsedShipStorage;
}

export interface GameShipsStorage {
  source: Array<Ship>;
  board: Array<BoardShipStorage>;
}

export type GameStorage = Record<ID, GameShipsStorage>;
