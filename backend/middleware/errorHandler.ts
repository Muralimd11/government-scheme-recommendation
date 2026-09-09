import { Request, Response, NextFunction } from "express";

export function errorHandler(
  err: any,
  req: Request,
  res: Response,
  next: NextFunction
): void {
  console.error("[Error Handler]", err);

  if (err.name === "MulterError") {
    if (err.code === "LIMIT_FILE_SIZE") {
      res.status(400).json({
        success: false,
        message: "File size exceeds 5MB limit. Please upload a smaller document."
      });
      return;
    }
    res.status(400).json({
      success: false,
      message: `File upload error: ${err.message}`
    });
    return;
  }

  if (err.name === "ValidationError") {
    res.status(400).json({
      success: false,
      message: err.message,
      errors: Object.values(err.errors).map((e: any) => e.message)
    });
    return;
  }

  const statusCode = err.status || err.statusCode || 500;
  res.status(statusCode).json({
    success: false,
    message: err.message || "An unexpected server error occurred. Please try again later."
  });
}
