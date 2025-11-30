import { prisma } from "../../db/index.js";
export const registerUserService = async (body: Object) => {
  try {
    const { name, email, password, image } = body;

    if (!email || !password) {
      return { statusCode: 400, message: "BAD REQUEST" };
    }
    const userExist = await prisma.user.findUnique({
        where:{
            email
        }
    });

    if(userExist){
        return { statusCode: 400, message: "User already exist" };

    }
  } catch (error) {}
};
