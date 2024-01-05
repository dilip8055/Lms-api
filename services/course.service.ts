import { Request, Response } from "express";
import CourseModel from "../models/course.model";
import { CatchAsyncError } from "../middleware/catchAsyncErrors";
import userModel from "../models/user.model";
import { redis } from "../utils/redis";
import NotificationModel from "../models/notification.Model";

// create course
export const createCourse = CatchAsyncError(async (data: any, res: Response) => {
  const course = await CourseModel.create(data.body);

  const user = await userModel.findById(data.user?._id);
  // Add Created Course -->_id to createdCourses Array of ADMIN or TUTOR
  user?.createdCourses.push(course?._id);
  // Add Created Course -->_id to courses Array also, so ADMIN or TUTOR can access own created Course.
  user?.courses.push(course?._id);
  // Updated User details in redis cache
  await redis.set(data.user?._id, JSON.stringify(user));
  // Save User changes
  await user?.save();

  // Create Notification of new course
  if (data.user?.role === "tutor") {
    await NotificationModel.create({
      userId: user?._id,
      title: "New Course",
      message: `${user?.name} created a course ${course?.name}`,
    });
  }

  res.status(201).json({
    success: true,
    course
  });
})

// Get All Courses
export const getAllCoursesService = async (req: Request, res: Response) => {
  let courses = [];

  if (req.user?.role === "tutor" && req.user.createdCourses) {
    const courseIds = req.user.createdCourses;

    courses = await CourseModel.find({ _id: { $in: courseIds } }).sort({ createdAt: -1 });
  }
  else {
    courses = await CourseModel.find().sort({ createdAt: -1 });
  }


  res.status(201).json({
    success: true,
    courses,
  });
};