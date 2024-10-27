import os from 'node:os';
import 'dotenv/config';

import { httpServer } from '@/http_server';
import WSServer from '@/ws_server';

const WS_PORT = Number(process.env.WS_PORT) || 3000;
const HTTP_PORT = Number(process.env.HTTP_PORT) || 8181;

const wss = new WSServer(WS_PORT);

wss.listen((options) => {
  const list = Object.entries(options).reduce(
    (acc, [key, value]) => (acc += `${os.EOL}- ${key}: ${value}`),
    '',
  );
  console.log(
    `Websocket server listen to PORT ${WS_PORT} with the following options: ${list}`,
  );
});

httpServer.listen(HTTP_PORT, () => {
  console.log(`Static http server listen to PORT ${HTTP_PORT}`);
});
