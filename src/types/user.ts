import { ID } from '.';

export interface UserPayload {
  name: string;
  password: string;
}

export interface UserResponse {
  name: string;
  index: ID;
  error: boolean;
  errorText: string;
}

export interface WinnerResponse {
  name: string;
  wins: number;
}

export type WinnersResponse = Array<WinnerResponse>;
