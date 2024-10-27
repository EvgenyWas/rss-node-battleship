import { ServerOptions, WebSocketServer } from 'ws';

import { MessageHandler, Sender, storage } from '@/services';
import { RESPONSE_MESSAGE_TYPES } from '@/types/message';
import { ExtendedWS } from '@/types/ws';
import { omit } from '@/utils';

export default class WSServer {
  private wss: InstanceType<typeof WebSocketServer>;

  constructor(port: number) {
    this.wss = new WebSocketServer({ port, path: '/' });
  }

  listen(cb: (options: Partial<ServerOptions>) => void) {
    const sender = new Sender(this.wss);

    this.wss
      .on('listening', () => cb(omit(this.wss.options, 'WebSocket')))
      .on('connection', (ws: ExtendedWS) => {
        ws.on(
          'message',
          (message) => new MessageHandler(this.wss, ws, message),
        );
      })
      .on('error', console.error);

    storage
      // update all authorized clients when winners are updated
      .on('update_winners', (winners) => {
        sender.sendAllAuthorized(
          RESPONSE_MESSAGE_TYPES.UPDATE_WINNERS,
          winners,
        );
      })
      // update all authorized clients when available rooms are updated
      .on('update_available_rooms', (rooms) => {
        sender.sendAllAuthorized(RESPONSE_MESSAGE_TYPES.UPDATE_ROOM, rooms);
      });
  }

  close() {
    this.wss.close();
  }
}
