import { insertActivityLog } from "./activity_logs.repository";
import { ActivityAction, EntityType } from "./activity_logs.types";
import { ActivityContext } from "./activity-context";

interface LogActivityParams {
  action: ActivityAction;
  entityType: EntityType;
  entityId?: string | null;
  details?: Record<string, unknown> | null;
  context: ActivityContext;
}

export async function logActivity({
  action,
  entityType,
  entityId = null,
  details = null,
  context,
}: LogActivityParams): Promise<void> {
  await insertActivityLog({
    userId: context.userId,
    action,
    entityType,
    entityId,
    details,
    ipAddress: context.ipAddress,
    userAgent: context.userAgent,
  });
}
