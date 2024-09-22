import { Router } from "express";
import { loginUser, logoutUser, registerUser,refreshAccessToken } from "../controllers/user.controller.js";
import { upload } from "../middlewares/multer.middleware.js";
import { verifyAWT } from "../middlewares/auth.middleware.js";
const router = Router();

router.route("/register").post(upload.fields([{
    name:"avatar",
    maxCount:1
},
{
    name:"coverimage",
    maxCount:1
}



]),registerUser)

router.route("/login").post(loginUser)

//Secure Router
router.route("/logout").post(verifyAWT,logoutUser)

router.route("/Refresh_Token").post(refreshAccessToken)
export default router