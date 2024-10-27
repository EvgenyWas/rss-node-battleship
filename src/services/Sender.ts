import { messages } from '@/messages';
import { ID } from '@/types';
import { RESPONSE_MESSAGE_TYPES, ResponseMessage } from '@/types/message';
import { ExtendedWS, WSS } from '@/types/ws';
import { isAuthorizedClient, prepareResponse } from '@/utils';
import { WebSocket } from 'ws';

type SendOptions = [
  type: RESPONSE_MESSAGE_TYPES,
  data: ResponseMessage['data'],
];

export default class Sender {
  wss: WSS;

  constructor(wss: WSS) {
    this.wss = wss;
  }

  send(client: WebSocket | ExtendedWS, ...options: SendOptions) {
    client.send(prepareResponse(...options));
    console.log(messages.sentMessage, ...options);
  }

  sendToClientByID(id: ID, ...options: SendOptions) {
    this.wss.clients.forEach((client) => {
      if (isAuthorizedClient(client) && client.id === id) {
        this.send(client, ...options);
      }
    });
  }

  sendToClientsByIDs(ids: Array<ID>, ...options: SendOptions) {
    ids.forEach((id) => {
      this.sendToClientByID(id, ...options);
    });
  }

  sendAllAuthorized(...options: SendOptions) {
    this.wss.clients.forEach((client) => {
      if (isAuthorizedClient(client)) {
        this.send(client, ...options);
      }
    });
  }
}
