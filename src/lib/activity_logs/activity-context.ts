import { headers } from "next/headers";
import { requireAuth } from "../auth/require-auth";

export interface ActivityContext {
  userId: string | null;
  ipAddress: string | null;
  userAgent: string | null;
}

export async function createActivityContext(): Promise<ActivityContext> {
  const authUser = await requireAuth();
  const headerStore = await headers();

  const ip =
    headerStore.get("x-forwarded-for") ?? headerStore.get("x-real-ip") ?? null;

  const userAgent = headerStore.get("user-agent") ?? null;

  return {
    userId: authUser.id,
    ipAddress: ip,
    userAgent,
  };
}
