import type {Request,Response, NextFunction } from 'express';
import {AuthServices} from '../../services/index.js';

interface RegisterBody {
  name?: string;
  email: string;
  password: string;
}
interface ApiResponse {
  statusCode: number,
  message:string

}
interface VerifyQuery {
  token?: string;
}
export const registerUser = async (
  req: Request<{}, {}, RegisterBody>,
  res: Response,
  next: NextFunction
) => {
  
  try {
    const { body } = req;
    console.log(req.body)
    const { name, email, password } = body;
    if (!email || !password) {
      return res.status(400).json({
        success: false,
        data: "BAD REQUEST",
      });
    }
    // Controller stays same - service now returns ApiResponse perfectly
    const response: ApiResponse = await AuthServices.registerUserService(body);
    res.status(response.statusCode).json({
      success: true,
      message: response.message,
    });
  } catch (error) {
        return res
      .status(500)
      .json({ success: false, message: "Internal server error" });
  }
};

export const verifyEmail = async (
  req: Request<{}, {}, {}, VerifyQuery>,
  res: Response,
  next: NextFunction
) => {
  try {
    const { token } = req.query;
     if (!token) {
       return res.status(400).json({
         success: false,
         message: "Token required",
       });
     }

    const response = await AuthServices.verifyEmailService(token);

    return res.status(response.statusCode).json({
      success: true,
      message: response.message,
    });
  } catch (error) {
    console.log(error);
    return res.send({
      statusCode: 500,
      message: "Internal server error",
    });
  }
};