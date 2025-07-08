import { createAuthRouteHandlers } from "@/utils/amplify-utils";

export const GET = createAuthRouteHandlers({
  redirectOnSignInComplete: "/dashboard",
  redirectOnSignOutComplete: "/",
});
