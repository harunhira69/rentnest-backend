import bcrypt from "bcryptjs";
import { prisma } from "../../lib/prisma";

import config from "../../config";
import { sendResponse } from "../../utils/sendResonse";
import httpStatus from "http-status"
import { RegisterUser } from "./user.interface";
const registerUserDB = async (payload: RegisterUser) => {
    const { name, email, password, role } = payload;


    if(role ==="ADMIN"){
        const error = new Error("You are not allowed to create admin user") as Error & {
            statusCode?:number;
            errorDetails?:unknown;
        };
        error.statusCode = httpStatus.FORBIDDEN;
        error.errorDetails = {
            field:"role",
            message:"You are not allowed to create admin user"
        }
        throw error;
    }
  
        const hashPassword = await bcrypt.hash(password, Number(config.bycrypt_salt_rounds ?? 10));

        const createUser = await prisma.user.create({
            data: {
                name,
                email,
                password: hashPassword,
                role,
                status:"ACTIVE",
            },
        });

        await prisma.profile.create({
            data: {
                userId: createUser.id,
            },
        });

        const user = await prisma.user.findUniqueOrThrow({
            where: {
                id: createUser.id,
            },
            omit: {
                password: true,
            },
            include: {
                profile: true,
            },
        });

        return user;
    } 
    


// const userProfileIntoDb = async(userId:string)=>{
//     const user = await prisma.user.findUniqueOrThrow({
//         where:{
//             id:userId
//         },
//         omit:{
//             password:true
//         },
//         include:{
//             profile:true
//         }
//     })


//  if(!user){
//     throw new Error("User not Found");
    
//  }
//     return user

// }

export const userService = {
    registerUserDB,
  
};