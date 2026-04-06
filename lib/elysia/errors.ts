export class ApiError extends Error {
  constructor(
    message: string,
    public readonly status: number,
  ) {
    super(message);
    this.name = new.target.name;
  }
}

export class BadRequestError extends ApiError {
  constructor(message: string) {
    super(message, 400);
  }
}

export class ForbiddenError extends ApiError {
  constructor(message: string) {
    super(message, 403);
  }
}

export class NotFoundError extends ApiError {
  constructor(message: string) {
    super(message, 404);
  }
}

export class UnprocessableEntityError extends ApiError {
  constructor(message: string) {
    super(message, 422);
  }
}

export function toErrorMessage(error: unknown, fallback: string): string {
  return error instanceof Error ? error.message : fallback;
}
