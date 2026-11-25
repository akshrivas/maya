import type { Dict } from "@/i18n";

/** Translate an error key (from validation or Firebase) into a friendly message. */
export function errorText(t: Dict, key: string | undefined | null): string {
  if (!key) return "";
  const errors = t.errors as Record<string, string>;
  return errors[key] ?? errors.generic;
}

/** Map Firebase error codes to our error keys. */
export function firebaseErrorKey(err: unknown): string {
  const code = (err as { code?: string })?.code ?? "";
  switch (code) {
    case "auth/invalid-phone-number":
    case "auth/missing-phone-number":
      return "invalidPhone";
    case "auth/invalid-verification-code":
    case "auth/missing-verification-code":
      return "wrongOtp";
    case "auth/code-expired":
    case "auth/session-expired":
      return "otpExpired";
    case "auth/too-many-requests":
    case "auth/quota-exceeded":
      return "tooManyRequests";
    case "auth/network-request-failed":
    case "unavailable":
      return "network";
    default:
      return "generic";
  }
}
