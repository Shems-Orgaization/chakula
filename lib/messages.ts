// lib/messages.ts
export const MESSAGES = {
  auth: {
    sessionExpired: "Your session expired. Please sign in again.",
    signOutIdle: "You were signed out because you were inactive.",
    linkExpired: "That link expired. Please request a new one.",
    invalidCredentials: "Incorrect email or password.",
    emailInUse: "An account with this email already exists.",
    forgotPasswordSuccess: "If an account exists, a reset link has been sent.",
    passwordResetSuccess: "Your password has been reset successfully.",
    passwordMismatch: "Passwords do not match.",
    passwordTooShort: "Password must be at least 8 characters.",
    currentPasswordIncorrect: "Your current password is incorrect.",
  },
  network: {
    offline: "You're offline. Check your connection.",
    generic: "Something went wrong on our side. Please try again.",
    timeout: "The request took too long. Please try again.",
  },
  actions: {
    saved: "Changes saved successfully.",
    deleted: "Item deleted.",
    updated: "Updated successfully.",
  }
};

export function errorMessage(status?: number, code?: string): string {
  if (status === 401) return MESSAGES.auth.sessionExpired;
  if (status === 403) return "You don't have permission to do this.";
  if (status === 404) return "We couldn't find what you were looking for.";
  if (status === 409) return "This already exists or conflicts with another action.";
  if (status === 413) return "File is too large.";
  if (status === 429) return "Too many tries, wait a minute.";
  if (status && status >= 500) return MESSAGES.network.generic;
  return MESSAGES.network.generic;
}