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

export async function getAllActivityLogs() {
  const { rows } = await db.query(`
    SELECT
      al.id,
      al.action,
      al.entity_type,
      al.entity_id,
      al.details,
      al.ip_address,
      al.created_at,
      u.name  AS user_name,
      u.email AS user_email,
      u.role  AS user_role
    FROM activity_logs al
    LEFT JOIN users u ON al.user_id = u.id
    ORDER BY al.created_at DESC
    LIMIT 500
  `);
  return rows;
}
