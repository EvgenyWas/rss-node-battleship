import { WebSocket, WebSocketServer } from 'ws';

export type WSS = InstanceType<typeof WebSocketServer>;

export interface ExtendedWS extends WebSocket {
  id: string;
}
