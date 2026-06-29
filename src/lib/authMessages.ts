/** Generic message for failed sign-in (avoids leaking account type or portal). */
export const INVALID_CREDENTIALS = "Invalid email or password.";

export function toSignInError(_err: unknown): string {
  return INVALID_CREDENTIALS;
}
