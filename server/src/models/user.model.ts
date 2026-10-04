import mongoose from 'mongoose';
import { Document,Types } from 'mongoose';
export interface IUser extends Document{
    _id:Types.ObjectId,
    name:string,
    email:string,
    password?:string,
    role:string,

}

const userSchema=new mongoose.Schema<IUser>({
    name:{
        type:String,
        required:[true,'name is required'],
        minLength:[3,'name must be atleast 3 characters'],
        maxLength:[50,'name must be smaller than 50 characters'],
    },
    email:{
        type:String,
        required:[true,'email is required'],
        unique:[true,'already exist'],
        lowercase:true,
        match : [/\S+@\S+\.\S+/, 'Please fill a valid email address'],
        index:true,
    },
    password:{
        type:String,
        required:false,
        minLength:[3,'password must be greter than equals to 3'],
    },
    role:{
        type:String,
        default:"user",
    },
},
{timestamps:true},
)


export const User=mongoose.model<IUser>("user",userSchema);