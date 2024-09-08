import {v2 as cloudinary} from "cloudinary"
import fs from "fs"
cloudinary.config({ 
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME, 
    api_key: process.env.CLOUDINARY_API_KEY, 
    api_secret: process.env.CLOUDINARY_API_SECRET
});

const uploadCloudinary = async (localFilePath) =>{
    try {
        if(!localFilePath) return null
        const response = await cloudinary.uploader(localFilePath,{
            resource_type:"auto"
        })
        //File has been uploaded successfully
        console.log("File is Uploaded on Cloudinary",response.url);

        return response;
        
    } catch (error) {
        fs.unlinkSync(localFilePath) //remove the locally saved temporary file as the Upload got fail
        return null
        
    }

}

export {uploadCloudinary}