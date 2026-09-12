import "server-only";

function required(name: string, value: string | undefined): string {
  if (!value) {
    throw new Error(`Missing required environment variable: ${name}`);
  }
  return value;
}

/** Backend API base URL — mapped from SPRING_DATASOURCE_URL in this project's .env */
function resolveApiBaseUrl(): string {
  const url =
    process.env.SPRING_DATASOURCE_URL ??
    process.env.API_BASE_URL ??
    process.env.BACKEND_ORIGIN;
  return required("SPRING_DATASOURCE_URL", url).replace(/\/$/, "");
}

/**
 * Every value is a getter so nothing is read at module-evaluation time:
 * `next build` imports this module while collecting page data (no env vars in
 * the builder image), and the standalone server must see the container's
 * runtime env rather than whatever was set when the image was built.
 */
export const config = {
  get apiBaseUrl() {
    return resolveApiBaseUrl();
  },
  get appName() {
    return process.env.NEXT_PUBLIC_APP_NAME ?? "Wołomiński Program Partnerski";
  },
  get cognito() {
    return {
      userPoolId: process.env.COGNITO_USER_POOL_ID ?? "",
      clientId: process.env.COGNITO_CLIENT_ID ?? "",
    };
  },
  get cookies() {
    return {
      accessToken: process.env.COOKIE_ACCESS_TOKEN ?? "odnowa_access_token",
      refreshToken: process.env.COOKIE_REFRESH_TOKEN ?? "odnowa_refresh_token",
      idToken: process.env.COOKIE_ID_TOKEN ?? "odnowa_id_token",
      secure: process.env.COOKIE_SECURE === "true",
      sameSite: (process.env.COOKIE_SAME_SITE ?? "lax") as
        | "lax"
        | "strict"
        | "none",
      accessMaxAge: Number(process.env.COOKIE_ACCESS_MAX_AGE ?? 3600),
      refreshMaxAge: Number(process.env.COOKIE_REFRESH_MAX_AGE ?? 2592000),
    };
  },
};
