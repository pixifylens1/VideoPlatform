import { Apierror } from "../utils/ApiError.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import jwt from "jsonwebtoken"
import { User } from "../models/user.models.js";
export const verifyAWT = asyncHandler(async(req,res,next)=>{
    try {
        const Token = req.cookies?.accessToken || req.header("Authorization")?.replace("Bearer ","");
    
        if(!Token){
            throw new Apierror(401,"Unauthorized Access");
        }
    
        const Decodedtoken = jwt.verify(Token,process.env.ACCESS_TOKEN_SECRET);
        const user = await User.findById(Decodedtoken?._id).select("-password -refreshToken")
        if(!user){
            throw new Apierror(401,"Invalid access Token")
        }
    
        req.user = user;
        next()
    } catch (error) {
        throw new Apierror(401,error?.message || "Invalid access Token")
    }
})