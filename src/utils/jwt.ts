import jwt, { JwtPayload,  SignOptions } from "jsonwebtoken"

const createToken = (payload:JwtPayload,secret:string,expiresIn:SignOptions)=>{
    const token = jwt.sign(payload,secret,
        {
        expiresIn 
    } as SignOptions
)

    return token

}

const verifyToken =(token:string,secret:string)=>{
    try {
    const validToken= jwt.verify(token,secret);
    return {
        success:true,
        data:validToken,
        message:"Token verified successfully"
    }
    } catch (error:any) {
        const err = error as Error;
        return {
            success:false,
            data:null,
            message:err.message || "Invalid Token"
        }
    
    }

}

export const jwtUtils = {
    createToken,
    verifyToken
}