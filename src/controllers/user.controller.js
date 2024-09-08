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
import {asyncHandler} from "../utils/asyncHandler.js"
import {Apierror} from "../utils/ApiError.js"
import {User} from "../models/user.models.js"
import {uploadCloudinary} from "../utils/cloudinary.js"
import { Apiresponse } from "../utils/Apiresponse.js"
const registerUser = asyncHandler(async (req,res)=>{

    res.status(200).json({
        message:"ok"
    })


    const {fullname,email,username,password} = req.body //getting user details from frontend  or postman
    console.log("email:",email);
    //validation work 
    if([fullname,email,username,password].some((field)=>field?.trim()==="")){
        throw new Apierror(400,"All fields are required")
    }
    const existed_user = User.findOne(  //checking username or email already exists
        {
            $or:[{username},{email},]
        }

    )
    if(existed_user){
        throw new Apierror(409,"User with email or username already exists")
    }
   
    
    const avatarLocalPath = req.files?.avatar[0]?.path;
    const coverimageLocalPath = req.files?.coverimage[0]?.path;
    if(!avatarLocalPath){       //check images or avatar
        throw new Apierror(400,"Avatar file is required")
        
    }

    const avatar = await uploadCloudinary(avatarLocalPath); //uploading image or avatar to cloudnary
    const coverimage = await uploadCloudinary(coverimageLocalPath);
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


export {registerUser}