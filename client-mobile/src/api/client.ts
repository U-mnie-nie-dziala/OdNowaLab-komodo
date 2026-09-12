/**
 * Kept as a distinct error type so screens can special-case "expected" API
 * failures (e.g. not-found) vs. unexpected bugs, same as when this called a
 * real backend. Currently only thrown by the mock layer in api/*.ts.
 */
export class ApiError extends Error {
  status: number;

  constructor(status: number, message: string) {
    super(message);
    this.status = status;
  }
}
