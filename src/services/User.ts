import { messages } from '@/messages';
import { Sender, storage } from '@/services';
import {
  PAYLOAD_MESSAGE_TYPES,
  PayloadMessage,
  RESPONSE_MESSAGE_TYPES,
} from '@/types/message';
import { UserStorage } from '@/types/storage';
import { UserPayload } from '@/types/user';
import { ExtendedWS, WSS } from '@/types/ws';
import { isString } from '@/utils';
import AppError, { isError } from './Errors';

export default class User {
  wss: WSS;
  ws: ExtendedWS;
  sender: InstanceType<typeof Sender>;

  constructor(wss: WSS, ws: ExtendedWS, message: PayloadMessage) {
    this.wss = wss;
    this.ws = ws;
    this.sender = new Sender(wss);

    try {
      const { type, data } = message;
      if (type !== PAYLOAD_MESSAGE_TYPES.REGISTRATION) {
        throw new AppError(messages.unknownType);
      }

      this.validateData(data);
      this.processUser(data);
    } catch (error) {
      this.sender.send(this.ws, RESPONSE_MESSAGE_TYPES.REGISTRATION, {
        name:
          'name' in message.data && isString(message.data.name)
            ? message.data.name
            : '',
        index: '',
        error: true,
        errorText: isError(error) ? error.message : messages.unknownError,
      });
    }
  }

  validateData(data: object): asserts data is UserPayload {
    const isValid =
      'name' in data &&
      isString(data.name) &&
      data.name &&
      'password' in data &&
      isString(data.password) &&
      data.password;

    if (!isValid) {
      throw new AppError(messages.badPayload);
    }
  }

  sendUser(user: UserStorage) {
    this.sender.send(this.ws, RESPONSE_MESSAGE_TYPES.REGISTRATION, {
      name: user.name,
      index: user.id,
      error: false,
      errorText: '',
    });
  }

  processUser(data: UserPayload) {
    const user = storage.findUserByName(data.name);

    if (user) {
      if (data.password === user.password) {
        this.sendUser(user);

        return;
      }

      throw new AppError(messages.incorrectCreds);
    } else {
      const newUser = storage.createUser(data);
      this.sendUser(newUser);
      this.ws.id = newUser.id;
      storage.createWinner(newUser);
    }

    this.sender.send(
      this.ws,
      RESPONSE_MESSAGE_TYPES.UPDATE_ROOM,
      storage.getAllRooms(),
    );
  }
}
