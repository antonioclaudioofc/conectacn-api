import type { Request, Response } from "express";
import * as categoryService from "../services/category.service";

export async function listCategories(_req: Request, res: Response) {
  res.set("Cache-Control", "public, max-age=600, s-maxage=3600");
  res.json(await categoryService.listCategories());
}
