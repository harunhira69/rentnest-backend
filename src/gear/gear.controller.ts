import { Request, Response } from "express";
import httpStatus from "http-status";
import { catchAsync } from "../utils/catchAsync";
import { sendResponse } from "../utils/sendResonse";
import { gearService } from "./gear.service";
import { GearFilterQuery } from "./gear.interface";

const createGear = catchAsync(async (req: Request, res: Response) => {
  const providerId = req.user?.id;

  if (!providerId) {
    throw new Error("Provider information not found in request");
  }

  const result = await gearService.createGearIntoDB(req.body, providerId);

  sendResponse(res, {
    success: true,
    statusCode: httpStatus.CREATED,
    message: "Gear item created successfully",
    data: result,
  });
});

const getAllGear = catchAsync(async (req: Request, res: Response) => {
  const query = req.query as unknown as GearFilterQuery;

  const result = await gearService.getAllGearFromDB(query);

  sendResponse(res, {
    success: true,
    statusCode: httpStatus.OK,
    message: "Gear items retrieved successfully",
    data: result,
  });
});

const getSingleGear = catchAsync(async (req: Request, res: Response) => {
  const { id } = req.params;

  const result = await gearService.getSingleGearFromDB(id);

  sendResponse(res, {
    success: true,
    statusCode: httpStatus.OK,
    message: "Gear item details retrieved successfully",
    data: result,
  });
});

export const gearController = {
  createGear,
  getAllGear,
  getSingleGear,
};