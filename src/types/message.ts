import {
  AttackPayload,
  AttackResponse,
  FinishResponse,
  RandomAttackPayload,
  TurnResponse,
} from './game';
import {
  AddUserToRoomPayload,
  CreateGameResponse,
  UpdateRoomResponse,
} from './room';
import { AddShipsPayload, StartGameResponse } from './ships';
import { UserPayload, UserResponse, WinnersResponse } from './user';

export enum PAYLOAD_MESSAGE_TYPES {
  REGISTRATION = 'reg',
  CREATE_ROOM = 'create_room',
  ADD_USER_TO_ROOM = 'add_user_to_room',
  ADD_SHIPS = 'add_ships',
  ATTACK = 'attack',
  RANDOM_ATTACK = 'randomAttack',
}

export enum RESPONSE_MESSAGE_TYPES {
  REGISTRATION = 'reg',
  UPDATE_WINNERS = 'update_winners',
  UPDATE_ROOM = 'update_room',
  CREATE_GAME = 'create_game',
  START_GAME = 'start_game',
  ATTACK = 'attack',
  TURN = 'turn',
  FINISH = 'finish',
}

interface MessageTemplate<
  T extends PAYLOAD_MESSAGE_TYPES | RESPONSE_MESSAGE_TYPES,
  D extends object,
> {
  type: T;
  data: D;
  id: number;
}

export type UserPayloadMessage = MessageTemplate<
  PAYLOAD_MESSAGE_TYPES.REGISTRATION,
  UserPayload
>;

export type UserResponseMessage = MessageTemplate<
  RESPONSE_MESSAGE_TYPES.REGISTRATION,
  UserResponse
>;

export type WinnersResponseMessage = MessageTemplate<
  RESPONSE_MESSAGE_TYPES.UPDATE_WINNERS,
  WinnersResponse
>;

export type CreateRoomPayloadMessage = MessageTemplate<
  PAYLOAD_MESSAGE_TYPES.CREATE_ROOM,
  object
>;

export type AddUserToRoomPayloadMessage = MessageTemplate<
  PAYLOAD_MESSAGE_TYPES.ADD_USER_TO_ROOM,
  AddUserToRoomPayload
>;

export type CreateGameResponseMessage = MessageTemplate<
  RESPONSE_MESSAGE_TYPES.CREATE_GAME,
  CreateGameResponse
>;

export type UpdateRoomResponseMessage = MessageTemplate<
  RESPONSE_MESSAGE_TYPES.UPDATE_ROOM,
  UpdateRoomResponse
>;

export type AddShipsPayloadMessage = MessageTemplate<
  PAYLOAD_MESSAGE_TYPES.ADD_SHIPS,
  AddShipsPayload
>;

export type StartGameResponseMessage = MessageTemplate<
  RESPONSE_MESSAGE_TYPES.START_GAME,
  StartGameResponse
>;

export type AttackPayloadMessage = MessageTemplate<
  PAYLOAD_MESSAGE_TYPES.ATTACK,
  AttackPayload
>;

export type AttackResponseMessage = MessageTemplate<
  RESPONSE_MESSAGE_TYPES.ATTACK,
  AttackResponse
>;

export type RandomAttackPayloadMessage = MessageTemplate<
  PAYLOAD_MESSAGE_TYPES.RANDOM_ATTACK,
  RandomAttackPayload
>;

export type TurnResponseMessage = MessageTemplate<
  RESPONSE_MESSAGE_TYPES.TURN,
  TurnResponse
>;

export type FinishResponseMessage = MessageTemplate<
  RESPONSE_MESSAGE_TYPES.FINISH,
  FinishResponse
>;

export type PayloadMessage =
  | UserPayloadMessage
  | CreateRoomPayloadMessage
  | AddUserToRoomPayloadMessage
  | AddShipsPayloadMessage
  | AttackPayloadMessage
  | RandomAttackPayloadMessage;

export type ResponseMessage =
  | UserResponseMessage
  | WinnersResponseMessage
  | CreateGameResponseMessage
  | UpdateRoomResponseMessage
  | StartGameResponseMessage
  | AttackResponseMessage
  | TurnResponseMessage
  | FinishResponseMessage;

export type Message = PayloadMessage | ResponseMessage;
