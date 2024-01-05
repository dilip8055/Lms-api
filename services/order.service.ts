import { NextFunction, Request, Response } from "express";
import { CatchAsyncError } from "../middleware/catchAsyncErrors";
import OrderModel from "../models/order.Model";


// create new order
export const newOrder = CatchAsyncError(async (data: any, res: Response) => {
  const order = await OrderModel.create(data);

  res.status(201).json({
    succcess: true,
    order,
  })

});

// Get All Orders
export const getAllOrdersService = async (req: Request, res: Response) => {
  let orders: any = [];
  let user: any = {};
  if (req.user) {
    user = req.user
  }

  const createdCoursesArray = user.createdCourses.map((course: {_id:string}) => {
    return course._id;
  })
  
  if (user?.role === "tutor") {
    orders = await OrderModel.find({
      "courseId": {
        $in: createdCoursesArray || []
      }
    });
  }
  else {
    orders = await OrderModel.find().sort({ createdAt: -1 });
  }

  res.status(201).json({
    success: true,
    orders,
  });
};
