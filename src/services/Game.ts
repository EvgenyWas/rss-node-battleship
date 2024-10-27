import { BOARD_SIZE } from '@/config';
import { messages } from '@/messages';
import { Sender, storage } from '@/services';
import { ID } from '@/types';
import {
  AttackPayload,
  AttackResponse,
  AttackStatus,
  RandomAttackPayload,
} from '@/types/game';
import {
  AttackPayloadMessage,
  PAYLOAD_MESSAGE_TYPES,
  RandomAttackPayloadMessage,
  RESPONSE_MESSAGE_TYPES,
} from '@/types/message';
import { Position } from '@/types/ships';
import { BoardShipStorage, GameStorage } from '@/types/storage';
import { ExtendedWS, WSS } from '@/types/ws';
import { isPositionWithinBoard, parseShip } from '@/utils';
import AppError from './Errors';

type Message = AttackPayloadMessage | RandomAttackPayloadMessage;

export default class Game {
  wss: WSS;
  ws: ExtendedWS;
  sender: InstanceType<typeof Sender>;

  constructor(wss: WSS, ws: ExtendedWS, message: Message) {
    this.wss = wss;
    this.ws = ws;
    this.sender = new Sender(wss);

    try {
      const { type, data } = message;
      if (!this.ws.id) {
        throw new AppError(`${messages.unauthorized}: ${type}`);
      }

      if (type === PAYLOAD_MESSAGE_TYPES.ATTACK) {
        this.attack(data);
        return;
      }

      if (type === PAYLOAD_MESSAGE_TYPES.RANDOM_ATTACK) {
        this.randomAttack(data);
        return;
      }

      throw new AppError(messages.unknownType);
    } catch (error) {
      console.error(error);
    }
  }

  shoot({ gameId, indexPlayer, x, y }: AttackPayload): {
    result: AttackResponse;
    killed: BoardShipStorage | undefined;
  } | null {
    const history = storage.getGameHistory(gameId);
    const game = storage.getGame(gameId);
    const players = Object.entries(game ?? {});
    if (!history || !game || players.length < 2) {
      return null;
    }

    let status: AttackStatus = 'miss';
    let killed;
    const updatedGame: GameStorage = {};
    players.forEach(([id, ships]) => {
      if (id !== indexPlayer) {
        const target = ships.board.findIndex((ship) =>
          ship.parsed.find((pos) => pos.x === x && pos.y === y),
        );

        if (target > -1) {
          const board = ships.board.slice(0);
          if (board[target]?.parsed?.length <= 1) {
            killed = board[target];
            board.splice(target, 1);
            status = 'killed';
          } else {
            board[target] = {
              ...(board[target] ?? {}),
              parsed:
                board[target]?.parsed?.filter(
                  (pos) => pos.x !== x || pos.y !== y,
                ) ?? [],
            };
            status = 'shot';
          }

          updatedGame[id] = { ...ships, board };
          return;
        }
      }

      updatedGame[id] = ships;
    });
    storage.updateGame(gameId, updatedGame);

    const result = storage.pushToGameHistory(gameId, {
      position: { x, y },
      status,
      currentPlayer: indexPlayer,
    });

    return { result, killed };
  }

  attack(data: AttackPayload) {
    const game = storage.getGame(data.gameId);
    const history = storage.getGameHistory(data.gameId);
    if (!game || !history) {
      return null;
    }

    // prevent a player's attack when it's another player's turn
    const currentPlayer = storage.getTurn(data.gameId);
    if (currentPlayer && currentPlayer !== data.indexPlayer) {
      return null;
    }

    const { result, killed } = this.shoot(data) ?? {};
    const players = Object.keys(game ?? {});
    if (!result) {
      return null;
    }

    storage.pushToGameHistory(data.gameId, result);
    this.sender.sendToClientsByIDs(
      players,
      RESPONSE_MESSAGE_TYPES.ATTACK,
      result,
    );

    // send miss attacks for all cells around killed ship
    if (result.status === 'killed' && killed) {
      this.getShipSurroundPositions(killed).forEach((position) => {
        const attack: AttackResponse = {
          position,
          currentPlayer: data.indexPlayer,
          status: 'miss',
        };
        storage.pushToGameHistory(data.gameId, attack);
        this.sender.sendToClientsByIDs(
          players,
          RESPONSE_MESSAGE_TYPES.ATTACK,
          attack,
        );
      });
    }

    const winner = this.findWinner(data.gameId);
    if (winner) {
      this.finish(data.gameId, players, winner);
    } else {
      const currentPlayer =
        result.status === 'miss'
          ? Object.keys(game).find((id) => id !== data.indexPlayer) ||
            data.indexPlayer
          : data.indexPlayer;
      this.turn(data.gameId, players, currentPlayer);
    }
  }

  findWinner(gameId: ID): ID | undefined {
    let winner;
    const players = Object.entries(storage.getGame(gameId) ?? {});
    players.forEach(([, ships], idx) => {
      if (!ships.board.length) {
        winner = players[idx ^ 1][0];
      }
    });

    return winner;
  }

  getRandomPosition(): Position {
    return {
      x: Math.floor(Math.random() * BOARD_SIZE),
      y: Math.floor(Math.random() * BOARD_SIZE),
    };
  }

  randomAttack(data: RandomAttackPayload) {
    const history = storage.getGameHistory(data.gameId);
    if (!history) {
      return;
    }

    let attempts = 0;
    let matched = false;
    while (!matched && attempts <= BOARD_SIZE * BOARD_SIZE) {
      attempts++;
      const randomPosition = this.getRandomPosition();
      matched = !storage.hasPositionInGameHistory(data.gameId, randomPosition);
      if (matched) {
        this.attack({ ...data, ...randomPosition });
      }
    }
  }

  getShipSurroundPositions(ship: BoardShipStorage): Position[] {
    const shipPoints = parseShip(ship);
    const surroundingPoints: Set<string> = new Set();

    for (const point of shipPoints) {
      // Iterate over a 3x3 grid centered around each ship point
      for (let dx = -1; dx <= 1; dx++) {
        for (let dy = -1; dy <= 1; dy++) {
          const surroundingPosition = { x: point.x + dx, y: point.y + dy };

          // Ensure the position is within min and max board's positions and is not part of the ship
          if (
            isPositionWithinBoard(surroundingPosition) &&
            !shipPoints.some(
              (p) =>
                p.x === surroundingPosition.x && p.y === surroundingPosition.y,
            )
          ) {
            surroundingPoints.add(
              `${surroundingPosition.x},${surroundingPosition.y}`,
            );
          }
        }
      }
    }

    return Array.from(surroundingPoints, (key) => {
      const [x, y] = key.split(',').map(Number);
      return { x, y };
    });
  }

  turn(gameId: ID, ids: Array<ID>, currentPlayer: ID) {
    storage.setTurn(gameId, currentPlayer);
    this.sender.sendToClientsByIDs(ids, RESPONSE_MESSAGE_TYPES.TURN, {
      currentPlayer,
    });
  }

  finish(gameId: ID, userIds: Array<ID>, winPlayer: ID) {
    storage.deleteGame(gameId);
    storage.deleteGameHistory(gameId);
    storage.deleteTurn(gameId);
    storage.updateWinnerByID(winPlayer);
    this.sender.sendToClientsByIDs(userIds, RESPONSE_MESSAGE_TYPES.FINISH, {
      winPlayer,
    });
  }
}
