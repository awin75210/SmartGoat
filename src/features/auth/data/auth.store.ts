import { AUTH_USERS_SEED } from "./auth.seed";
import type { AuthUserRow } from "../types/auth.types";

export const authUsersStore: AuthUserRow[] = structuredClone(AUTH_USERS_SEED);
