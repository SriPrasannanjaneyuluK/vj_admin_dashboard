/** Shown when credentials are valid but the account is not allowed on this portal. */
export const PORTAL_ACCESS_DENIED = "This account cannot access this portal.";

/** Generic message for failed sign-in (avoids leaking whether an email exists). */
export const INVALID_CREDENTIALS = "Invalid email or password.";

export function toSignInError(err: unknown): string {
  if (err instanceof Error && err.message === PORTAL_ACCESS_DENIED) {
    return PORTAL_ACCESS_DENIED;
  }
  return INVALID_CREDENTIALS;
}
