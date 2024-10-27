import { randomUUID } from 'node:crypto';
import EventEmitter from 'node:events';

import { messages } from '@/messages';
import { ID } from '@/types';
import { AttackResponse } from '@/types/game';
import {
  CreateGameResponse,
  RoomUser,
  UpdateRoomItemResponse,
  UpdateRoomResponse,
} from '@/types/room';
import { GameShipsStorage, GameStorage, UserStorage } from '@/types/storage';
import { UserPayload, WinnerResponse, WinnersResponse } from '@/types/user';
import AppError from './Errors';
import { Position } from '@/types/ships';

interface EventEmitterEvents {
  update_winners: [WinnersResponse];
  update_available_rooms: [UpdateRoomResponse];
}

export default class Storage extends EventEmitter<EventEmitterEvents> {
  private users: Map<ID, UserStorage>;
  private availableRooms: Map<ID, UpdateRoomItemResponse>;
  private games: Map<ID, GameStorage>;
  private history: Map<ID, Array<AttackResponse>>;
  private turns: Map<ID, ID>;
  private winners: Map<ID, WinnerResponse>;

  constructor() {
    super();
    this.users = new Map();
    this.availableRooms = new Map();
    this.games = new Map();
    this.history = new Map();
    this.turns = new Map();
    this.winners = new Map();
  }

  findUserByName(name: string): UserStorage | null {
    return [...this.users.values()].find((user) => user.name === name) || null;
  }

  findUserByID(id: string): UserStorage | null {
    return this.users.get(id) || null;
  }

  createUser(value: UserPayload): UserStorage {
    const id = randomUUID();
    const user = { ...value, id };
    this.users.set(id, user);

    return user;
  }

  createWinner({ id, name }: UserStorage): WinnerResponse {
    const winner = { name: name, wins: 0 };
    this.winners.set(id, winner);
    this.emit('update_winners', this.getAllWinners());

    return winner;
  }

  findWinnerByID(id: ID): WinnerResponse | null {
    return this.winners.get(id) || null;
  }

  getAllWinners(): WinnersResponse {
    return [...this.winners.values()];
  }

  updateWinnerByID(id: ID): WinnerResponse | null {
    const winner = this.winners.get(id);
    if (!winner) {
      return null;
    }

    const updatedWinner = { ...winner, wins: winner.wins + 1 };
    this.winners.set(id, updatedWinner);
    this.emit('update_winners', this.getAllWinners());

    return updatedWinner;
  }

  createRoom(user: RoomUser): UpdateRoomItemResponse {
    const id = randomUUID();
    const room = { roomId: id, roomUsers: [user] };
    this.availableRooms.set(id, room);
    this.emit('update_available_rooms', this.getAllRooms());

    return room;
  }

  hasRoomWithUserID(id: ID): boolean {
    return this.getAllRooms().some((room) =>
      room.roomUsers.find((user) => user.index === id),
    );
  }

  findRoomByID(id: ID): UpdateRoomItemResponse | null {
    return this.availableRooms.get(id) || null;
  }

  addUserToRoom(userId: ID, roomId: ID): Array<CreateGameResponse> {
    const availableRoom = this.availableRooms.get(roomId);
    if (
      !availableRoom ||
      !availableRoom.roomUsers[0] ||
      !this.users.has(userId)
    ) {
      throw new AppError(
        `${messages.createGameError} with user ID ${userId} and room ID ${roomId}`,
      );
    }

    const roomUserId = availableRoom.roomUsers[0].index as ID;
    if (userId === roomUserId) {
      throw new AppError(messages.sameUsersInOneRoom);
    }

    const idGame = randomUUID();
    this.availableRooms.delete(roomId);
    this.emit('update_available_rooms', this.getAllRooms());

    return [
      { idGame, idPlayer: roomUserId },
      { idGame, idPlayer: userId },
    ];
  }

  getAllRooms(): UpdateRoomResponse {
    return [...this.availableRooms.values()];
  }

  addShips({
    gameId,
    userId,
    source,
    board,
  }: {
    gameId: ID;
    userId: ID;
  } & GameShipsStorage): GameStorage {
    const game = this.games.get(gameId);
    const value = { ...(game ?? {}), [userId]: { source, board } };
    this.games.set(gameId, value);
    this.history.set(gameId, []);

    return value;
  }

  getGame(id: ID): GameStorage | null {
    return this.games.get(id) || null;
  }

  getGameHistory(id: ID): Array<AttackResponse> | null {
    return this.history.get(id) || null;
  }

  updateGame(id: ID, game: GameStorage) {
    this.games.set(id, game);
  }

  findGameByUserID(id: ID): [string, GameShipsStorage] | null {
    const game = [...this.games.entries()].find(([, game]) => game[id]);
    if (!game) {
      return null;
    }

    return [game[0], game[1][id]];
  }

  pushToGameHistory(id: ID, value: AttackResponse) {
    const history = this.history.get(id);
    if (history) {
      this.history.set(id, [...history, value]);
    }

    return value;
  }

  deleteGame(id: ID) {
    this.games.delete(id);
  }

  deleteGameHistory(id: ID) {
    this.history.delete(id);
  }

  hasPositionInGameHistory(id: ID, { x, y }: Position): boolean {
    return !!this.getGameHistory(id)?.find(
      ({ position }) => position.x === x && position.y === y,
    );
  }

  setTurn(gameId: ID, userId: ID) {
    this.turns.set(gameId, userId);
  }

  getTurn(id: ID): ID | null {
    return this.turns.get(id) || null;
  }

  deleteTurn(id: ID) {
    this.turns.delete(id);
  }
}
