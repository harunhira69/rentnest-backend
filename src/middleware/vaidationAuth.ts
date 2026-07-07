import { NextFunction, Request, Response } from "express";
import httpStatus from "http-status";

const createValidationError = (errors: { field: string; message: string }[]) => {
  const error = new Error("Validation failed") as Error & {
    statusCode?: number;
    errorDetails?: unknown;
  };

  error.name = "ValidationError";
  error.statusCode = httpStatus.BAD_REQUEST;
  error.errorDetails = errors;

  return error;
};

const isValidEmail = (email: string) => {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
};

export const validateRegister = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const { name, email, password, role } = req.body;

  const errors: { field: string; message: string }[] = [];

  if (!name || typeof name !== "string" || name.trim().length < 2) {
    errors.push({
      field: "name",
      message: "Name must be at least 2 characters",
    });
  }

  if (!email || typeof email !== "string") {
    errors.push({
      field: "email",
      message: "Email is required",
    });
  } else if (!isValidEmail(email)) {
    errors.push({
      field: "email",
      message: "Invalid email address",
    });
  }

  if (!password || typeof password !== "string") {
    errors.push({
      field: "password",
      message: "Password is required",
    });
  } else if (password.length < 6) {
    errors.push({
      field: "password",
      message: "Password must be at least 6 characters",
    });
  }

  if (!role || typeof role !== "string") {
    errors.push({
      field: "role",
      message: "Role is required",
    });
  } else if (!["CUSTOMER", "PROVIDER"].includes(role)) {
    errors.push({
      field: "role",
      message: "Role must be CUSTOMER or PROVIDER",
    });
  }

  if (errors.length > 0) {
    next(createValidationError(errors));
    return;
  }

  next();
};

export const validateLogin = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const { email, password } = req.body;

  const errors: { field: string; message: string }[] = [];

  if (!email || typeof email !== "string") {
    errors.push({
      field: "email",
      message: "Email is required",
    });
  } else if (!isValidEmail(email)) {
    errors.push({
      field: "email",
      message: "Invalid email address",
    });
  }

  if (!password || typeof password !== "string") {
    errors.push({
      field: "password",
      message: "Password is required",
    });
  }

  if (errors.length > 0) {
    next(createValidationError(errors));
    return;
  }

  next();
};