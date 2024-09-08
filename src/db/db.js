import mongoose from "mongoose";
import { DB_NAME } from "../constant.js";
 

const connectDB = async()=>{
    try {
        const connectioninstance = await mongoose.connect(`${process.env.MONGODB_URI}/${DB_NAME}`)
        console.log(`MONGODB CONNECTED!! DB HOST:${connectioninstance.connection.host}`);
        
    } catch (error) {
        console.log("Found ERROR:",error);
        process.exit(1);
        
    }
}
export default connectDB