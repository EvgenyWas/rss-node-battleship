import { ID } from '.';
import { Position } from './ships';

export type AttackStatus = 'miss' | 'killed' | 'shot';

export interface RandomAttackPayload {
  gameId: ID;
  indexPlayer: ID;
}

export type AttackPayload = Position & RandomAttackPayload;

export interface AttackResponse {
  position: Position;
  currentPlayer: ID;
  status: AttackStatus;
}

export interface TurnResponse {
  currentPlayer: ID;
}

export interface FinishResponse {
  winPlayer: ID;
}
