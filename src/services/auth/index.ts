import { prisma } from "../../db/index.js";
import bcrypt from "bcryptjs";
import crypto from "crypto";
import nodemailer, { type Transporter } from "nodemailer";
import dotenv from "dotenv";
import type { ParsedQs } from "qs";
import jwt from "jsonwebtoken";
//import { logger } from "../../utils/logger/index.js";
dotenv.config({});
interface registerBodyType {
  name?: string;
  email: string;
  password: string;
  image?: string;
}
interface ApiResponse {
  statusCode: number;
  message: string;
}
interface LoginApiResponse {
  statusCode: number;
  message: string;
  token:string;
}
interface VerifyQuery {
  token?: string;
}
export const registerUserService = async (
  body: registerBodyType
): Promise<ApiResponse> => {
  try {
    const { name, email, password, image } = body;

    if (!email || !password) {
      return { statusCode: 400, message: "BAD REQUEST" };
    }
    const userExist = await prisma.user.findUnique({
      where: {
        email,
      },
    });

    if (userExist) {
      return { statusCode: 400, message: "User already exist" };
    }

    const hashedPassword: string = await bcrypt.hash(password, 10);

    const user = await prisma.user.create({
      data: {
        email,
        password: hashedPassword,
        name: name || "User",
      },
    });
    console.log(user);

    if (user) {
      const token = crypto.randomBytes(32).toString("hex"); //random token
      console.log(token);

      const updatedUser = await prisma.user.update({
        where: {
          email,
        },
        data: {
          verificationToken: token,
          verificationTokenExpires: new Date(Date.now() + 1000 * 60 * 10),
        },
      });

      console.log("token stored in db");
      const transporter: Transporter = nodemailer.createTransport({
        pool: true,
        host: process.env.MAILTRAP_HOST as string,
        port: Number(process.env.MAILTRAP_PORT),
        secure: false,
        auth: {
          user: process.env.MAILTRAP_USER as string,
          pass: process.env.MAILTRAP_PASSWORD as string,
        },
      } as nodemailer.TransportOptions);
      //logger.info("transporter created");
      transporter.verify((error, success) => {
        if (error) {
          console.error("Transporter error:", error);
        } else {
          console.log("Server is ready to send messages");
        }
      });
      //logger.info(process.env.BASE_URL);
      await transporter.sendMail({
        from: '"abhishek" <cabhishek691@gmail.com>',
        to: "abhishek.abskch@gmail.com",
        subject: "Verify your email",
        text: `Please click on following link:
              ${process.env.BASE_URL}/api/v1/auth/verify?token=${token}`, // plain‑text body
        html: `Please click on following link:
              ${process.env.BASE_URL}/api/v1/auth/verify?token=${token}`, // HTML body
      });
      //logger.info("mail sent");
      return {
        statusCode: 200,
        message: "User registration successfull",
      };
      //verify
    }
  } catch (error: unknown) {
    console.error(error);
    throw new Error(error instanceof Error ? error.message : String(error));
  }
  return { statusCode: 500, message: "Registration failed unexpectedly" };
};

export const verifyEmailService = async (token:string) => {
  try {
    if (!token) {
      return { statusCode: 400, message: "Token required" };
    }
    const user = await prisma.user.findFirst({
      where: {
        verificationToken: token,
        verificationTokenExpires: { gt: new Date(Date.now()) },
      },
    });

    if (!user) {
      return {
        statusCode: 400,
        message: "user is not verified",
      };
    }

    await prisma.user.update({
      where: { id: user.id },
      data: {
        isVerified: true,
        resetPasswordToken: null,
        resetPasswordTokenExpires: null,
        verificationToken: null,
        verificationTokenExpires: null,
      },
    });

    return {
      statusCode: 200,
      message: "Email verified",
    };
  } catch (error: unknown) {
    console.error(error);
    throw new Error(error instanceof Error ? error.message : String(error));
  }
  return { statusCode: 500, message: "Registration failed unexpectedly" };
};

export const loginService = async (email:string,password:string):Promise<LoginApiResponse> => {
  try {
    
    if (!email || !password) {
      return { statusCode: 400, message: "invalid email or password",token:"" };
    }

    // const user = await User.findOne({ email });
    const user = await prisma.user.findUnique({
      where:{email}
    });

    if (!user) {
      return { statusCode: 400, message: "user not found",token:"" };
    }

    const isVerified = user.isVerified;
    if (!isVerified) {
      return { statusCode: 400, message: "complete signup process",token:"" };
    }

    const isMatch = await bcrypt.compare(password, user.password);
    console.log(isMatch);

    if (!isMatch) {
      return { statusCode: 400, message: "something went wrong",token:"" };
    }

   //jwt.verify();
    const secret:string = process.env.JWT_SECRET || '';

    const accessToken = jwt.sign(
      { id: user.id, role: user.role },
      secret,
      {
        expiresIn: "15m",
      }
    );

    // const refreshToken = jwt.sign(
    //   { id: user._id, role: user.role },
    //   process.env.JWT_REFRESH_TOKEN_SECRET,
    //   {
    //     expiresIn: "30d",
    //   }
    // );

    // if (refreshToken) {
    //   user.refreshToken = refreshToken;
    //   await user.save();
    // }

    
      return { statusCode: 200,message:"token generated successfully", token:accessToken };
  } catch (error:unknown) {
    console.error(error);
    throw new Error(error instanceof Error ? error.message : String(error));
  }
};

// export const getLoginService = (body) => {
//   const { username, password } = body;

//   return { status: true };
// };

// export const postLoginService = async (body) => {
//   try {
//     const { username, password } = body;
//     const userDetails = db.find();
//     if (!userDetails) {
//       return {
//         status: false,
//         message: "username does not exist",
//       };
//     }

//     const userPassword = userDetails.password;

//     if (!username || !password) {
//       return {
//         status: false,
//         message: "invalid credentials",
//       };
//     }
//   } catch (error) {
//     logger.error(error);
//     throw new Error("login failed");
//   }
// };

// export const postSignupService = async (body) => {
//   try {
//     const { name, email, password } = body;

//     if (!name || !email || !password) {
//       return { statusCode: 400 };
//     }

//     const userAlreadyExist = await User.findOne({ email });

//     if (userAlreadyExist) {
//       return {
//         statusCode: 400,
//         message: "User already exist",
//       };
//     }

//     const user = await User.create({
//       name,
//       email,
//       password,
//     });

//     if (user) {
//       const token = crypto.randomBytes(32).toString("hex");
//       console.log(token);
//       user.verificationToken = token;
//       user.verificationTokenExpires = Date.now() + 1000 * 60 * 10;
//       await user.save();
//       console.log("token stored in db");
//       const transporter = nodemailer.createTransport({
//         host: process.env.MAILTRAP_HOST,
//         port: process.env.MAILTRAP_PORT,
//         secure: false, // true for 465, false for other ports
//         auth: {
//           user: process.env.MAILTRAP_USER,
//           pass: process.env.MAILTRAP_PASSWORD,
//         },
//       });
//       logger.info("transporter created");

//       transporter.verify((error, success) => {
//         if (error) {
//           console.error("Transporter error:", error);
//         } else {
//           logger.info("Server is ready to send messages");
//         }
//       });
//       logger.info(process.env.BASE_URL);

//       await transporter.sendMail({
//         from: '"abhishek" <cabhishek691@gmail.com>',
//         to: "abhishek.achy@gmail.com",
//         subject: "Verify your email",
//         text: `Please click on following link:
//               ${process.env.BASE_URL}/api/v1/auth/verify?token=${token}`, // plain‑text body
//         html: `Please click on following link:
//               ${process.env.BASE_URL}/api/v1/auth/verify?token=${token}`, // HTML body
//       });

//       logger.info("mail sent");

//       return {
//         statusCode: 200,
//         message: "User registration successfull",
//       };
//       //verify
//     }
//   } catch (error) {
//     logger.error(error);
//     throw new Error(error);
//   }
// };




// export const getProfileService = async (user) => {
//   try {
//     console.log("user id is :", user.id);
//     // const userP = await User.findById(user.id).select("-password"); //exclude password field
//     const userP = await prisma.user.findUnique({
//       where:{
//         id:user.id
//       },
//       select:{
//         password:false
//       }
//     })
//     if (!userP) {
//       return { statusCode: 400, message: "Enter all field" };
//     }
//     console.log("user found in profile service");
//     return { statusCode: 200, data: userP.email };
//   } catch (error) {
//     console.log("error in auth service",error);
//     throw new Error(error);
//   }
// };

// export const forgotPasswordService = async (body) => {
//   try {
//     const { email } = body;
//     console.log(email);

//     //const user = await User.findOne({ email });
//     const user = await prisma.user.findUnique({
//       where:{email}
//     })
//     //console.log(user);
//     if (!user) {
//       return { statusCode: 400, success: false, message: "email not found" };
//     }
//     const token = crypto.randomBytes(32).toString("hex");

//     console.log("forgot password token", token);

//     await prisma.user.update({
//       where:{email},
//       data:{
//         resetPasswordToken:token,
//         resetPasswordTokenExpires:Date.now() + 1000*60*10
//       }
//     });

//     console.log("data saved in db");
//     const transporter = nodemailer.createTransport({
//       host: process.env.MAILTRAP_HOST,
//       port: process.env.MAILTRAP_PORT,
//       secure: false, // true for 465, false for other ports
//       auth: {
//         user: process.env.MAILTRAP_USER,
//         pass: process.env.MAILTRAP_PASSWORD,
//       },
//     });
//     console.log("transporter created");
//     transporter.verify((error, success) => {
//       if (error) {
//         console.log("transporter error", error);
//       } else {
//         console.log("transporter is ready to send mail");
//       }
//     });

//     await transporter.sendMail({
//       from: '"abhishek" <cabhishek691@gmail.com>',
//       to: "abhishek.achy@gmail.com",
//       subject: "Verify your email",
//       text: `Please click on following link:
//               ${process.env.BASE_URL}/api/v1/auth/reset-password?token=${token}`, // plain‑text body
//       html: `Please click on following link:
//               ${process.env.BASE_URL}/api/v1/auth/reset-password?token=${token}`, // HTML body
//     });

//     return { statusCode: 200, message: "token send to mail" };

//     // generate token and send it to user and store it in db as well
//   } catch (error) {
//     console.log("error in forgot-password token send service");
//     throw new Error(error);
//   }
// };

// export const resetPasswordService = async (token, password) => {
//   try {
//     console.log("token ", token);
//     console.log("password", password);

//     if(!token || !password){
//       return {statusCode:400,message:"BAD REQUEST"}
//     }

//     const user = await prisma.user.findUnique({
//       where:{resetPasswordToken:token}
//      });
//     if (!user) {
//       return { statusCode: 400, message: "user not verified" };
//     }
//     const hashedPassword = await bcrypt.hash(password,10);

//     const updateUser = await prisma.user.update({
//       where: {
//         resetPasswordToken: token,
//         resetPasswordTokenExpires: { gt: new Date() },
//       },
//       data: {
//         resetPasswordToken: null,
//         resetPasswordTokenExpires:null,
//         password:hashedPassword
//       },
//     });

//     return { statusCode: 200, message: "password reset successful" };
//   } catch (error) {
//     console.log("errror from reset password", error);
//     throw new Error(error);
//   }
// };
