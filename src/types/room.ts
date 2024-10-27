import { ID } from '.';

export interface AddUserToRoomPayload {
  indexRoom: ID;
}

export interface CreateGameResponse {
  idGame: ID;
  idPlayer: ID;
}

export interface RoomUser {
  name: string;
  index: ID;
}

export interface UpdateRoomItemResponse {
  roomId: ID;
  roomUsers: Array<RoomUser>;
}

export type UpdateRoomResponse = Array<UpdateRoomItemResponse>;
