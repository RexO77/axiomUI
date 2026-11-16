/**
 * Whether the staging catalog at `/staging` exists in this build.
 *
 * It fails closed: production, or an environment that says nothing, gets a
 * 404. It is on only for a preview deployment, an explicit `AXIOM_STAGING=1`
 * (the browser suite and local opt-in), or the development server. A
 * production deployment stays closed even with the flag set, so a stray
 * variable in the production environment can never publish it.
 *
 * Read at build time by the staging layout and route params, and per request
 * on the development server.
 */
export type StagingEnv = Readonly<{
  VERCEL_ENV?: string;
  AXIOM_STAGING?: string;
  NODE_ENV?: string;
}>;

export function stagingEnabled(env: StagingEnv = process.env): boolean {
  if (env.VERCEL_ENV === "production") return false;
  return env.VERCEL_ENV === "preview" || env.AXIOM_STAGING === "1" || env.NODE_ENV === "development";
}

/** The base every staging URL is built from, through `createRoutes`. */
export const STAGING_BASE = "/staging";
