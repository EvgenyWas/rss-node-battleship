import { RawData } from 'ws';

import { MESSAGE_ID } from '@/config';
import { messages } from '@/messages';
import { User, Room, Ships, Game } from '@/services';
import { PAYLOAD_MESSAGE_TYPES, PayloadMessage } from '@/types/message';
import { ExtendedWS, WSS } from '@/types/ws';
import AppError, { isError } from './Errors';
import { isNumber, isString, parseMessage } from '@/utils';

export default class MessageHandler {
  wss: WSS;
  ws: ExtendedWS;
  message: PayloadMessage;

  constructor(wss: WSS, ws: ExtendedWS, data: RawData) {
    this.wss = wss;
    this.ws = ws;
    this.message = {} as PayloadMessage;

    try {
      const message = parseMessage(data);
      console.log(messages.receivedMessage, message);

      this.validateMessage(message);
      this.message = message;
      this.useService();
    } catch (error) {
      ws.send(
        JSON.stringify({
          message: isError(error) ? error.message : messages.unknownError,
        }),
      );
    }
  }

  validateMessage(message: unknown): asserts message is PayloadMessage {
    const isValidBody =
      message &&
      typeof message === 'object' &&
      'id' in message &&
      isNumber(message.id) &&
      message.id === MESSAGE_ID &&
      'data' in message &&
      message.data &&
      typeof message.data === 'object';

    if (!isValidBody) {
      throw new AppError(messages.badPayload);
    }

    const isValidType =
      'type' in message &&
      isString(message.type) &&
      Object.values(PAYLOAD_MESSAGE_TYPES).includes(
        message.type as PAYLOAD_MESSAGE_TYPES,
      );

    if (!isValidType) {
      throw new AppError(messages.unknownType);
    }
  }

  useService() {
    switch (true) {
      case this.message.type === PAYLOAD_MESSAGE_TYPES.REGISTRATION:
        new User(this.wss, this.ws, this.message);
        break;

      case this.message.type === PAYLOAD_MESSAGE_TYPES.CREATE_ROOM ||
        this.message.type === PAYLOAD_MESSAGE_TYPES.ADD_USER_TO_ROOM:
        new Room(this.wss, this.ws, this.message);
        break;

      case this.message.type === PAYLOAD_MESSAGE_TYPES.ADD_SHIPS:
        new Ships(this.wss, this.ws, this.message);
        break;

      case this.message.type === PAYLOAD_MESSAGE_TYPES.ATTACK ||
        this.message.type === PAYLOAD_MESSAGE_TYPES.RANDOM_ATTACK:
        new Game(this.wss, this.ws, this.message);
        break;

      default:
        throw new AppError(messages.unknownType);
    }
  }
}
