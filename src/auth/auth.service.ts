import bcrypt from "bcryptjs";
import { prisma } from "../lib/prisma";
import { Payload } from "./auth.interface"
import { jwtUtils } from "../utils/jwt";
import config from "../config";
import { JwtPayload, SignOptions } from "jsonwebtoken";
import httpStatus from "http-status";



const createError = (message:string,statusCode:number,errorDetails?:unknown)=>{
    const error = new Error(message) as Error & {
        statusCode?:number;
        errorDetails?:unknown;
    }
    error.statusCode = statusCode;
    if(errorDetails){
        error.errorDetails = errorDetails;
    }
return error;
}

const loginUserDB = async(payload:Payload)=>{
    const {email,password} = payload;
    const user = await prisma.user.findUnique({
        where:{
            email
        },
        
        include:{
            profile:true
        }
    })

    if(!user){
        throw createError("Invalid email or password", httpStatus.UNAUTHORIZED);
    }
      if (user.status === "SUSPENDED") {
    throw createError(
      "Your account has been suspended",
      httpStatus.FORBIDDEN
    );
}


   const matchPassword = await bcrypt.compare(password,user.password);

   if(!matchPassword){
   throw createError("Invalid email or password",httpStatus.UNAUTHORIZED);
    
   }


 const jwtPayload = {
    id:user.id,
    name:user.name,
    email:user.email,
    role:user.role,
    status:user.status
 };

 const accessToken = jwtUtils.createToken(
    jwtPayload,
    config.jwt_access_secret,
    config.jwt_access_expiry as SignOptions
    
 );

 const refreshToken = jwtUtils.createToken(
    jwtPayload,
    config.jwt_refresh_secret,
    config.jwt_refresh_expiry as SignOptions
 );

  const { password: hashedPassword, ...userWithoutPassword } = user;


 return {user:userWithoutPassword,accessToken,refreshToken}

}

const getUserDB = async(userId:string)=>{
const user = await prisma.user.findUnique({
    where:{
        id:userId
    },
    omit:{
        password:true
    },
    include:{
        profile:true
    }
});

if(!user){
    throw createError("User Not Found", httpStatus.NOT_FOUND);
}

return user


}

const refreshToken = async(refreshToken:string | undefined)=>{
    if(!refreshToken){
        throw createError("Refresh Token is required",httpStatus.UNAUTHORIZED);
    }


const verifyRefreshToken = jwtUtils.verifyToken(refreshToken,config.jwt_refresh_secret)

if(!verifyRefreshToken.success || !verifyRefreshToken.data){
    throw createError(verifyRefreshToken.message||"Invalid refresh token",httpStatus.UNAUTHORIZED);
    
}

const {id} = verifyRefreshToken.data as JwtPayload;

if(!id || typeof id !=="string"){
    throw createError("Invalid token payload",httpStatus.UNAUTHORIZED);

}


const user = await prisma.user.findUnique({
    where:{
        id
    }

})

if(!user){
    throw createError("User Not Found", httpStatus.NOT_FOUND);
}

if(user. status==="SUSPENDED"){
    throw createError("User is Suspended", httpStatus.FORBIDDEN);
    
}

const jwtPayload = {
    id,
    name:user.name,
    email:user.email,
    role:user.role,
    status:user.status

}

const accessToken = jwtUtils.createToken(
    jwtPayload,
    config.jwt_access_secret,
    config.jwt_access_expiry as SignOptions
);

return {accessToken}
}

export const authService = {
    loginUserDB,
    getUserDB,
    refreshToken
}