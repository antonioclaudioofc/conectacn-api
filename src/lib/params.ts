import { AppError } from "../errors/app-error";
import { z } from "./zod";

export function parseUuidParam(
  value: unknown,
  notFoundMessage: string,
): string {
  const result = z.uuid().safeParse(value);
  if (!result.success) throw new AppError(notFoundMessage, 404, "NOT_FOUND");
  return result.data;
}
