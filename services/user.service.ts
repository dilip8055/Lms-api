import { Request, Response } from "express";
import { redis } from "../utils/redis";
import userModel from "../models/user.model";

// get user by id
export const getUserById = async (id: string, res: Response) => {
  const userJson = await redis.get(id);

  if (userJson) {
    const user = JSON.parse(userJson);
    res.status(201).json({
      success: true,
      user,
    });
  }
};

// Get All users
export const getAllUsersService = async (req: Request, res: Response) => {
  let usersData: any = [];
  let user: any = {};
  if (req.user) {
    user = req.user
  }

  const createdCoursesArray = user.createdCourses.map((course: { _id: string }) => {
    return course._id;
  })

  if (user?.role === "tutor") {
    usersData = await userModel.find({
      _id: { $ne: user._id },
      "courses._id": {
        $in: createdCoursesArray || []
      }
    });
  }
  else {
    usersData = await userModel.find().sort({ createdAt: -1 });
  }

  res.status(201).json({
    success: true,
    usersData,
  });
};

// update user role
export const updateUserRoleService = async (res: Response, id: string, role: string) => {
  const user = await userModel.findByIdAndUpdate(id, { role }, { new: true });

  res.status(201).json({
    success: true,
    user,
  });
}