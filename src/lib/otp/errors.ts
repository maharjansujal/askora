export class ResendCooldownError extends Error {
  public readonly code = "RESEND_COOLDOWN";
  constructor(public readonly waitSeconds: number) {
    super(`Please wait ${waitSeconds}s before requesting another code`);
    this.name = "ResendCooldownError";
  }
}

export const isResendCooldownError = (
  err: unknown,
): err is ResendCooldownError => err instanceof ResendCooldownError;
