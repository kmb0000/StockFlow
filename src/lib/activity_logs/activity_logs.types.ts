export type EntityType =
  | "PRODUCT"
  | "CATEGORY"
  | "SUPPLIER"
  | "STOCK_MOVEMENT"
  | "USER";

export type ActivityAction =
  | "CREATE"
  | "UPDATE"
  | "DELETE"
  | "VALIDATE"
  | "REJECT"
  | "LOGIN"
  | "LOGOUT";

export interface CreateActivityLogInput {
  userId: string | null;
  action: ActivityAction;
  entityType: EntityType;
  entityId?: string | null;
  details?: Record<string, unknown> | null;
  ipAddress?: string | null;
  userAgent?: string | null;
}
