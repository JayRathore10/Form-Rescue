    import mongoose from 'mongoose';
    import { MONGODB_URI } from './env.config';
    export const connectDb=async()=>{
        try{
            await mongoose.connect(MONGODB_URI as string);
            console.log("mongoDb connected");
        }catch(err){
            console.log("error in connecting",err);
            process.exit(1);
        }
    }