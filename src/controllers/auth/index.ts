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
export const registerUser = async (
  req: Request<{}, {}, RegisterBody>,
  res: Response,
  next: NextFunction
) => {
  console.log("===============================================>");
  try {
    const { body } = req;
    console.log(req.body)
    console.log("===============================================>11");
    console.log("======11111111111=======",body.name,body.password);
    const { name, email, password } = body;
    if (!email || !password) {
      return res.status(400).json({
        success: false,
        data: "BAD REQUEST",
      });
    }
    console.log(
      "=============================================================1"
    );
    // Controller stays same - service now returns ApiResponse perfectly
    const response: ApiResponse = await AuthServices.registerUserService(body);
    res.status(response.statusCode).json({
      success: true,
      message: response.message,
    });
  } catch (error) {
    console.log("------------------------------------------");
    return res
      .status(500)
      .json({ success: false, message: "Internal server error" });
  }
};