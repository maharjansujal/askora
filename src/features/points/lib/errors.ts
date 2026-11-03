export class InsufficientPointsError extends Error {
  public readonly code = "INSUFFICIENT_POINTS";

  constructor(
    public readonly balance: number,
    public readonly required: number,
  ) {
    super(
      `Insufficient points: balance ${balance}, required ${required} (short by ${required - balance})`,
    );
    this.name = "InsufficientPointsError";
  }

  get shortfall() {
    return Math.max(0, this.required - this.balance);
  }
}

export class InvalidPointsOperationError extends Error {
  public readonly code = "INVALID_POINTS_OPERATION";

  constructor(
    public readonly reason: string,
    public readonly context?: Record<string, unknown>,
  ) {
    super(`Invalid points operation: ${reason}`);
    this.name = "InvalidPointsOperationError";
  }
}

export const isInsufficientPointsError = (
  err: unknown,
): err is InsufficientPointsError => err instanceof InsufficientPointsError;

export const isInvalidPointsOperationError = (
  err: unknown,
): err is InvalidPointsOperationError =>
  err instanceof InvalidPointsOperationError;
