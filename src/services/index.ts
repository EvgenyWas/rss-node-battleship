import Storage from './Storage';

export { default as MessageHandler } from './MessageHandler';
export { default as User } from './User';
export { default as Room } from './Room';
export { default as Ships } from './Ships';
export { default as Game } from './Game';
export { default as Sender } from './Sender';
export { default as AppError } from './Errors';

export const storage = new Storage();
