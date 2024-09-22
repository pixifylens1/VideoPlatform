//#OPERATIONS WE NEED FOR REGISTATION OF USER
/*
1.Get User details from frontend
2.validation - not empty
3.check if user already exists: through(username,email)
4.check for images, check for avatar
5.upload them to cloudinary, avatar
5.5. create User object- create entry in db
6. remove password and refresh token field from response
7.check for user creation
8.return response
*/
//#OPERATIONS WE NEED FOR LOGIN USER
/* 
1. req.body ->data
2. username or gmail
3. find the user
4. password check
5. access & refresh token
6. send cookie
*/
import {asyncHandler} from "../utils/asyncHandler.js"
import {Apierror} from "../utils/ApiError.js"
import {User} from "../models/user.models.js"
import {uploadCloudinary} from "../utils/cloudinary.js"
import { Apiresponse } from "../utils/Apiresponse.js"
import jwt from "jsonwebtoken"

const generateAccessAndRefreshToken = async(userId)=>{
    try {
        const user = await User.findById(userId);
        const accessToken = user.generateAccessToken();
        const RefreshToken = user.generateRefreshToken();
        user.refreshToken =   RefreshToken;
        await user.save({validBeforeSave:false})

        return {accessToken,RefreshToken}

    } catch (error) {
        throw new Apierror(500,"Something went Wrong while generating access and refresh token")
    }
}


const registerUser = asyncHandler(async (req,res)=>{

    // res.status(200).json({
    //     message:"ok"
    // })


    const {fullname,email,username,password} = req.body //getting user details from frontend  or postman
    console.log("email:",email);
    //validation work 
    if([fullname,email,username,password].some((field)=>field?.trim()==="")){
        throw new Apierror(400,"All fields are required")
    }
    const existed_user =await User.findOne(  //checking username  or email already exists
        {
            $or:[{username},{email},]
        }

    )
    if(existed_user){
        throw new Apierror(409,"User with email or username already exists")
    }
   
    
    const avatarLocalPath = req.files?.avatar[0]?.path;
    //const coverimageLocalPath = req.files?.coverimage[0]?.path;
    let coverimageLocalPath;
    if(req.files && Array.isArray(req.files.coverimage) && req.files.coverimage.length >0 ){
        
        const coverimageLocalPath = req.files.coverimage[0].path;
    }


    if(!avatarLocalPath){       //check images or avatar
        throw new Apierror(400,"Avatar file is not here required")
        
    }
    
    const avatar = await uploadCloudinary(avatarLocalPath); //uploading image or avatar to cloudnary
    const coverimage = await uploadCloudinary(coverimageLocalPath);
    // console.log(avatar);
    if(!avatar){
        throw new Apierror(400,"Avatar file is required")
    }
    const user = await User.create({  //create User object- create entry in db
        fullname,
        avatar:avatar.url,
        coverimage:coverimage?.url || "",
        email,
        password,
        username: username.toLowerCase()
    })

    const created_user = await User.findById(user._id).select( //remove password and refresh token field from response
        "-password -refreshToken"
    )

    if(!created_user){
        throw new Apierror(500,"Something went Wrong while registring the User")
    }

    return res.status(201).json(
        new Apiresponse(200,created_user,"User registed successfully")
    )

})
const loginUser = asyncHandler(async (req,res)=>{
    const {email,username,password,} = req.body

    if(!username && !email){
        throw new Apierror(400,"username or password is reqired")
    }

    const user = await User.findOne({
        $or:[{username},{email}]
    })
    if(!user){
        throw new Apierror(404,"User not found");
    }
    const isPasswordvalid = await user.isPasswordCorrect(password)
    if(!isPasswordvalid){
        throw new Apierror(401,"Invalid credentials");
    }
    
    const {accessToken,refreshToken} =  await generateAccessAndRefreshToken(user._id);
    const loggedInUser = await User.findById(user._id).select("-password -refreshToken");

    const options = {
        httpOnly:true,
        secure:true
    }
    return res
    .status(200)
    .cookie("accessToken",accessToken,options)
    .cookie("refreshToken",refreshToken,options)
    .json(new Apiresponse(
        200, 
        {
            user: loggedInUser, accessToken, refreshToken
        },
        "User logged In Successfully"
    ))

})
const logoutUser = asyncHandler(async(req,res)=>{
    await User.findByIdAndUpdate(req.user._id,{
        $set: {refreshToken: undefined,}

    },
    {new:true}

)
const options = {
    httpOnly:true,
    secure:true
}

return res.status(200).clearCookie("accessToken",options).clearCookie("refreshToken",options).json(new Apiresponse(200,{},"User Logged Out"))

})

const refreshAccessToken = asyncHandler(async (req,res)=>{
    const incomingRefreshToken = req.cookies.refreshToken || req.body.refreshToken;
    if(!incomingRefreshToken){
        throw new Apierror(401,"UnAuthorized Request")
    }
    
    try {
        const decodedRefreshToken = jwt.verify(incomingRefreshToken,process.env.REFRESH_TOKEN_SECRET);
        
        const user = await User.findById(decodedRefreshToken?._id);
        
        if(!user){
            throw new Apierror(401,"Invalid Refresh Token")
        }
        if(incomingRefreshToken !==user?.refreshToken){
            throw new Apierror(401,"Refresh Token Expired")
    
        }
        const options = {
            httpOnly:true,
            secure:true
        }
        const {accessToken,newrefreshToken}=await generateAccessAndRefreshToken(user._id)
    
        return res
        .status(200)
        .cookie("accessToken",accessToken,options)
        .cookie("refreshToken",newrefreshToken,options)
        .json(
            new Apiresponse(
                200,{
                    accessToken,refreshToken:newrefreshToken
                },
                "access Token Refresed"
            )
        )
    } catch (error) {
        throw new Apierror(401,error?.message || "Invalid Refresh Token")
    }

})


export {registerUser,loginUser,logoutUser,refreshAccessToken}