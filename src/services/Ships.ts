import { messages } from '@/messages';
import { AppError, Sender, storage } from '@/services';
import {
  AddShipsPayloadMessage,
  PAYLOAD_MESSAGE_TYPES,
  RESPONSE_MESSAGE_TYPES,
} from '@/types/message';
import { AddShipsPayload, Ship } from '@/types/ships';
import { BoardShipStorage } from '@/types/storage';
import { ExtendedWS, WSS } from '@/types/ws';
import { parseShip } from '@/utils';

export default class Ships {
  wss: WSS;
  ws: ExtendedWS;
  sender: InstanceType<typeof Sender>;

  constructor(wss: WSS, ws: ExtendedWS, message: AddShipsPayloadMessage) {
    this.wss = wss;
    this.ws = ws;
    this.sender = new Sender(wss);

    try {
      const { type, data } = message;
      if (!this.ws.id) {
        throw new AppError(`${messages.unauthorized}: ${type}`);
      }

      if (type === PAYLOAD_MESSAGE_TYPES.ADD_SHIPS) {
        this.addShips(data);
        return;
      }

      throw new AppError(messages.unknownType);
    } catch (error) {
      console.error(error);
    }
  }

  parseShips(ships: Array<Ship>): Array<BoardShipStorage> {
    return ships.map((ship) => ({ ...ship, parsed: parseShip(ship) }));
  }

  addShips({ gameId, ships: source, indexPlayer }: AddShipsPayload) {
    const game = storage.addShips({
      gameId,
      userId: indexPlayer,
      source,
      board: this.parseShips(source),
    });
    const players = Object.entries(game);
    if (players.length === 2) {
      const currentPlayerIndex = players[Math.random() < 0.5 ? 0 : 1][0]; // choose current player randomly
      storage.setTurn(gameId, currentPlayerIndex);
      players.forEach(([id, ships]) =>
        this.sender.sendToClientByID(id, RESPONSE_MESSAGE_TYPES.START_GAME, {
          ships: ships.source,
          currentPlayerIndex,
        }),
      );
    }
  }
}
