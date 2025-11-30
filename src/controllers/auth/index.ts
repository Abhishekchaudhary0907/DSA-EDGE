import type {Request,Response, NextFunction } from 'express';
import {AuthServices} from '../../services/index.js';

interface UserResponse {
  email: string;
}
export const registerUser = async (req:Request,res:Response,next:NextFunction) => {
     
    try{

        const {body} = req;
        const { name, email, password, image, role } = body;
        if(!email || !password || !role){

            return res.status(400).json({
                data:"BAD REQUEST"
            });
        }

        const response:UserResponse | null = await AuthServices.registerUserService(body);
        if(!response){
            return res.status(500).json({
                data:"INTERNAL SERVER ERROR"
            })
        }

    }catch(error){

    }
}