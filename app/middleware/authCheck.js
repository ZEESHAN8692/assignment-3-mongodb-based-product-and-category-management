import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';
dotenv.config();

const AuthCheck=(req,res,next)=>{
    const token= req?.body?.token || req?.query?.token || req?.headers['x-access-token'];
    if(!token){
        return res.status(400).json({
            message:'Token is required for access this page'
        });
    }
    try{
        const decoded=jwt.verify(token, process.env.JWT_SECRET)
        req.user=decoded;
       console.log('afetr login data',req.user);
       

    }catch(err){
       return res.status(400).json({
            message:'Invalid token'
        });
    }
    return next();

}

export {AuthCheck}