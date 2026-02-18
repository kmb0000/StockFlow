import { db } from "../db/connection";
import { CreateActivityLogInput } from "./activity_logs.types";

export async function insertActivityLog(
  data: CreateActivityLogInput,
): Promise<void> {
  await db.query(
    `
    INSERT INTO activity_logs (
      user_id,
      action,
      entity_type,
      entity_id,
      details,
      ip_address,
      user_agent
    )
    VALUES ($1, $2, $3, $4, $5, $6, $7)
    `,
    [
      data.userId,
      data.action,
      data.entityType,
      data.entityId ?? null,
      data.details ?? null,
      data.ipAddress ?? null,
      data.userAgent ?? null,
    ],
  );
}
