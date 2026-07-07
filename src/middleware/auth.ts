import { NextFunction, Request, Response } from "express";
import { Role, UserStatus } from "../../generated/prisma/enums";
import { catchAsync } from "../utils/catchAsync";
import { jwtUtils } from "../utils/jwt";
import config from "../config";
import { JwtPayload } from "jsonwebtoken";
import { prisma } from "../lib/prisma";
import httpStatus from "http-status";

declare global {
  namespace Express {
    interface Request {
      user?: {
        id: string;
        name: string;
        email: string;
        role: Role;
        status: UserStatus;
      };
    }
  }
}

type DecodeUser = JwtPayload  & {
  id:string;
  name:string;
  email:string;
  role:Role;
  status:UserStatus;
}

const createError = (message:string,statusCode:number,errorDetails?:unknown)=>{
  const error = new Error(message) as Error & {
    statusCode?:number;
    errorDetails?:unknown;
  };
  error.statusCode = statusCode;
  if(errorDetails){
    error.errorDetails = errorDetails;
  }
  return error;
}

export const auth = (...requiredRoles: Role[]) => {
  return catchAsync(async (req: Request, res: Response, next: NextFunction) => {


    // const token =
    //   req.cookies?.accessToken
    //     ? req.cookies.accessToken
    //     : req.headers.authorization?.startsWith("Bearer ")
    //     ? req.headers.authorization.split(" ")[1]
    //     : req.headers.authorization;


        let token : string | undefined;
      if (req.cookies?.accessToken) {
      token = req.cookies.accessToken;
    }

      const authorization = req.headers.authorization;
     
         if (!token && authorization?.startsWith("Bearer ")) {
      token = authorization.split(" ")[1];
    }
    
       if (!token) {
      throw createError(
        "You are not logged in. Please log in first.",
        httpStatus.UNAUTHORIZED
      );
    }

    const verifyToken = jwtUtils.verifyToken(
      token,
      config.jwt_access_secret as string
    );

    if (!verifyToken.success || !verifyToken.data) {
        throw createError(
        verifyToken.message || "Invalid or expired token",
        httpStatus.UNAUTHORIZED
      );
    }

    const decoded = verifyToken.data as DecodeUser ;

      if (!decoded.id || !decoded.email || !decoded.role) {
      throw createError("Invalid token payload", httpStatus.UNAUTHORIZED);
    }

    const user = await prisma.user.findUnique({
      where: {
        id: decoded.id,
      },
      select:{
        id:true,
        name:true,
        email:true,
        role:true,
        status:true
      }
    });

    if (!user) {
      throw createError("User not found log in again",httpStatus.UNAUTHORIZED);
    }

    if (user.status === "SUSPENDED") {
      throw createError("Your account has been suspended. Please contact support.",httpStatus.FORBIDDEN);
    }

    if (requiredRoles.length > 0 && !requiredRoles.includes(user.role)) {
      throw createError("Forbidden. You don't have permission to access this resource.",httpStatus.FORBIDDEN);
    }

    req.user = user;

    next();
  });
};