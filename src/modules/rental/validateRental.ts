import { NextFunction, Request, Response } from "express";
import { createValidationError } from "../../utils/createError";


const isValidDate = (date: string) => {
  const parsedDate = new Date(date);
  return !Number.isNaN(parsedDate.getTime());
};

export const validateCreateRental = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const { startDate, endDate, items } = req.body;

  const errors: { field: string; message: string }[] = [];

  if (!startDate || typeof startDate !== "string") {
    errors.push({
      field: "startDate",
      message: "Start date is required",
    });
  } else if (!isValidDate(startDate)) {
    errors.push({
      field: "startDate",
      message: "Start date must be a valid date",
    });
  }

  if (!endDate || typeof endDate !== "string") {
    errors.push({
      field: "endDate",
      message: "End date is required",
    });
  } else if (!isValidDate(endDate)) {
    errors.push({
      field: "endDate",
      message: "End date must be a valid date",
    });
  }

  if (isValidDate(startDate) && isValidDate(endDate)) {
    const start = new Date(startDate);
    const end = new Date(endDate);

    if (end <= start) {
      errors.push({
        field: "endDate",
        message: "End date must be after start date",
      });
    }
  }

  if (!Array.isArray(items) || items.length === 0) {
    errors.push({
      field: "items",
      message: "At least one rental item is required",
    });
  } else {
    items.forEach((item, index) => {
      if (
        !item.gearItemId ||
        typeof item.gearItemId !== "string" ||
        item.gearItemId.trim().length === 0
      ) {
        errors.push({
          field: `items.${index}.gearItemId`,
          message: "Gear item ID is required",
        });
      }

      if (!Number.isInteger(item.quantity) || item.quantity <= 0) {
        errors.push({
          field: `items.${index}.quantity`,
          message: "Quantity must be a positive integer",
        });
      }
    });
  }

  if (errors.length > 0) {
    next(createValidationError(errors));
    return;
  }

  next();
};