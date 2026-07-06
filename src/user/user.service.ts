import bcrypt from "bcryptjs";
import { Prisma } from "../../generated/prisma/client";
import { prisma } from "../lib/prisma";
import { RegisterUser } from "./user.interface";
import config from "../config";
import { sendResponse } from "../utils/sendResonse";
import httpStatus from "http-status"
const registerUserDB = async (payload: RegisterUser) => {
    const { name, email, password, role, status } = payload;

  
        const hashPassword = await bcrypt.hash(password, Number(config.bycrypt_salt_rounds ?? 10));

        const createUser = await prisma.user.create({
            data: {
                name,
                email,
                password: hashPassword,
                role: role ?? "CUSTOMER",
                status: status ?? "ACTIVE",
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