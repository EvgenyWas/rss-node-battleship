import { messages } from '@/messages';
import { Sender, storage } from '@/services';
import {
  AddUserToRoomPayloadMessage,
  CreateRoomPayloadMessage,
  PAYLOAD_MESSAGE_TYPES,
  RESPONSE_MESSAGE_TYPES,
} from '@/types/message';
import { AddUserToRoomPayload } from '@/types/room';
import { ExtendedWS, WSS } from '@/types/ws';
import AppError from './Errors';

type Message = CreateRoomPayloadMessage | AddUserToRoomPayloadMessage;

export default class Room {
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

      if (type === PAYLOAD_MESSAGE_TYPES.CREATE_ROOM) {
        this.createRoom();
        return;
      }

      if (type === PAYLOAD_MESSAGE_TYPES.ADD_USER_TO_ROOM) {
        this.addUserToRoom(data);
        return;
      }

      throw new AppError(messages.unknownType);
    } catch (error) {
      console.error(error);
    }
  }

  createRoom() {
    const user = storage.findUserByID(this.ws.id);
    if (!user) {
      throw new AppError(`${messages.userNotFound} with ID ${this.ws.id}`);
    }

    // not create a new room if a user has one already
    if (storage.hasRoomWithUserID(user.id)) {
      return;
    }

    storage.createRoom({ name: user.name, index: user.id });
  }

  addUserToRoom(data: AddUserToRoomPayload) {
    const game = storage.addUserToRoom(this.ws.id, data.indexRoom);
    game.forEach((player) =>
      this.sender.sendToClientByID(
        player.idPlayer,
        RESPONSE_MESSAGE_TYPES.CREATE_GAME,
        player,
      ),
    );
  }
}
