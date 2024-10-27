export default class AppError extends Error {
  constructor(message: string) {
    super(message);
  }
}

export const isError = (error: unknown): error is AppError =>
  error instanceof AppError;
