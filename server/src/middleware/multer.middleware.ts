import multer from 'multer';
import path from 'path';
import fs from 'fs';

const uploadDir=path.join(process.cwd(),"uploads");
if(!fs.existsSync(uploadDir)){
    fs.mkdirSync(uploadDir);
}


const storage=multer.diskStorage({
    destination:(_req,file,cb)=>{
        cb(null,uploadDir); 
    },
    filename:(_req,file,cb)=>{
        const uniqueName=`${Date.now()}-${Math.round(Math.random() * 1e9)}${path.extname(file.originalname)}`;      
        cb(null,uniqueName);
    }
});


const fileFilter:multer.Options['fileFilter']=(_req,file,cb)=>{
    cb(null,true);
}




export const upload={
    fileFilter,
    storage,
    limits:{
        size:7*24*60*60*1000
    }
}