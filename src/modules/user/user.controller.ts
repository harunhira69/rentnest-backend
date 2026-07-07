import { Request, Response } from "express";
import { catchAsync } from "../../utils/catchAsync";
import { userService } from "./user.service";
import { sendResponse } from "../../utils/sendResonse";
import httpStatus from "http-status";

const registerUser = catchAsync(async (req: Request, res: Response) => {
    const payload = req.body;

    const user = await userService.registerUserDB(payload);
    sendResponse(res, {
        success: true,
        message: "User created successfully",
        statusCode: httpStatus.CREATED,
        data: user,
    });
});


export const userController = {
    registerUser,

};