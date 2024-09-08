import dotenv from "dotenv"

import connectDB from "./db/db.js";

dotenv.config({
    path:'./env'
})

connectDB()
.then(()=>{
    app.listen(process.env.PORT || 8000,()=>{
        console.log(`server is running at: ${process.env.PORT}`);
        
    })
})
.catch((err)=>{
    console.log("MongoDB Failed Due to Error!!",err);
    
})