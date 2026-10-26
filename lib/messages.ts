// lib/messages.ts
// Every message the user can see lives here, so the wording stays consistent
// and is easy to translate to Swahili later.

export const MESSAGES = {
  auth: {
    sessionExpired: "Your session expired. Please sign in again.",
    idle: "You were signed out because you were inactive. Please sign in again.",
    linkProblem:
      "We couldn't finish that link. If you just confirmed your email, sign in below. Otherwise request a new link.",
    invalidCredentials: "Incorrect email or password.",
    emailNotConfirmed: "Please confirm your email before signing in.",
    accountExists: "An account may already exist for this email.",
    invalidEmail: "That email address doesn't look right.",
    checkEmail: "Account created. Check your email to confirm your account, then sign in.",
    resetSent: "If an account exists for that email, a password reset link is on its way.",
    passwordUpdated: "Your password was updated.",
    passwordMismatch: "Passwords do not match.",
    passwordTooShort: "Password must be at least 8 characters.",
    passwordWeak: "That password is too easy to guess. Try a longer one with letters and numbers.",
    passwordSame: "Your new password must be different from the current one.",
    currentPasswordWrong: "Your current password is incorrect.",
    tooManyAttempts: "Too many attempts. Please wait a few minutes and try again.",
    tooManyEmails: "We've sent too many emails for now. Please try again in an hour.",
    // Older names still used by some pages. Remove once no page uses them.
    signOutIdle: "You were signed out because you were inactive.",
    linkExpired: "That link expired. Please request a new one.",
    emailInUse: "An account with this email already exists.",
    forgotPasswordSuccess: "If an account exists, a reset link has been sent.",
    passwordResetSuccess: "Your password has been reset successfully.",
    currentPasswordIncorrect: "Your current password is incorrect.",
  },
  network: {
    offline: "You're offline. Check your connection and try again.",
    timeout: "That took too long. Check your connection and try again.",
    unreachable: "We couldn't reach Chakula. Check your connection and try again.",
    generic: "Something went wrong on our side. Please try again.",
  },
  actions: {
    saved: "Changes saved successfully.",
    deleted: "Item deleted.",
    updated: "Updated successfully.",
  },
  request: {
    invalid: "Please check what you entered and try again.",
    forbidden: "You don't have permission to do that.",
    notFound: "We couldn't find that. It may have been removed.",
    conflict: "That already exists.",
    tooLarge: "That file is too large.",
    tooMany: "Too many tries. Please wait a minute and try again.",
  },
} as const;

// Our own API routes only send short, safe messages for client mistakes,
// so those can be shown. Anything long or odd is replaced by a standard message.
function safeServerMessage(message?: string): string | undefined {
  if (typeof message !== "string") return undefined;
  const text = message.trim();
  // Machine codes like "weak_password" are not for users.
  if (/^[A-Za-z0-9_.-]+$/.test(text)) return undefined;
  return text.length > 0 && text.length <= 120 ? text : undefined;
}

/** For responses from our own /api routes. */
export function errorMessage(status?: number, serverMessage?: string): string {
  switch (status) {
    case 400:
    case 422:
      return safeServerMessage(serverMessage) ?? MESSAGES.request.invalid;
    case 401:
      return MESSAGES.auth.sessionExpired;
    case 403:
      return safeServerMessage(serverMessage) ?? MESSAGES.request.forbidden;
    case 404:
      return MESSAGES.request.notFound;
    case 409:
      return safeServerMessage(serverMessage) ?? MESSAGES.request.conflict;
    case 413:
      return MESSAGES.request.tooLarge;
    case 429:
      return MESSAGES.request.tooMany;
    default:
      return MESSAGES.network.generic;
  }
}

/** For errors returned by supabase.auth.* calls (sign in, sign up, update password, reset). */
export function authErrorMessage(error: { code?: string; status?: number; name?: string }): string {
  switch (error.code) {
    case "invalid_credentials":
      return MESSAGES.auth.invalidCredentials;
    case "email_not_confirmed":
      return MESSAGES.auth.emailNotConfirmed;
    case "user_already_exists":
    case "email_exists":
      return MESSAGES.auth.accountExists;
    case "email_address_invalid":
      return MESSAGES.auth.invalidEmail;
    case "weak_password":
      return MESSAGES.auth.passwordWeak;
    case "same_password":
      return MESSAGES.auth.passwordSame;
    case "over_email_send_rate_limit":
      return MESSAGES.auth.tooManyEmails;
    case "over_request_rate_limit":
      return MESSAGES.auth.tooManyAttempts;
    case "otp_expired":
      return MESSAGES.auth.linkProblem;
    case "session_not_found":
    case "session_expired":
    case "reauthentication_needed":
      return MESSAGES.auth.sessionExpired;
  }
  if (error.name === "AuthRetryableFetchError") return MESSAGES.network.unreachable;
  if (error.status === 429) return MESSAGES.auth.tooManyAttempts;
  return MESSAGES.network.generic;
}

/** For errors from supabase.from(...) calls made straight from a component. */
export function dbErrorMessage(error: { code?: string }): string {
  switch (error.code) {
    case "23505":
      return MESSAGES.request.conflict;
    case "23503":
    case "23514":
    case "22001":
      return MESSAGES.request.invalid;
    case "42501":
      return MESSAGES.request.forbidden;
    case "PGRST116":
      return MESSAGES.request.notFound;
    default:
      return MESSAGES.network.generic;
  }
}