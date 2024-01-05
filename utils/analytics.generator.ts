import { Document, Model } from "mongoose";

interface MonthData {
  month: string;
  count: number;
}

const monthNames = [
  "January", "February", "March", "April", "May", "June", 
  "July", "August", "September", "October", "November", "December"
];

export async function generateLast12MothsData<T extends Document>(
  user: any, model: Model<T>
): Promise<{ last12Months: MonthData[] }> {
  const last12Months: MonthData[] = [];
  const currentDate = new Date();
  currentDate.setDate(currentDate.getDate() + 1);
  currentDate.setUTCHours(0, 0, 0, 0);

  let count: any = 0;
  for (let i = 11; i >= 0; i--) {
    const endDate = new Date(
      currentDate.getFullYear(),
      currentDate.getMonth(),
      currentDate.getDate() - i * 28
    );
    endDate.setUTCHours(23, 59, 59, 999);

    const startDate = new Date(
      endDate.getFullYear(),
      endDate.getMonth(),
      endDate.getDate() - 28 + 1
      );
    
    startDate.setUTCHours(0, 0, 0, 0);
    const monthYearDate = new Date(
      endDate.getFullYear(),
      endDate.getMonth(),
      endDate.getDate() - 1
    );

    const monthYear = `${monthYearDate.getDate()} ${monthNames[monthYearDate.getMonth()]} ${monthYearDate.getFullYear()}`;

    if (user.role === "tutor" && model.modelName === "User") {
      count = await model.countDocuments({
        _id: { $ne: user._id },
        createdAt: {
          $gte: startDate,
          $lte: endDate,
        },
        "courses._id": {
          $in: user?.createdCourses?.map((course: { _id: string }) => {
            return course._id
          }) || []
        }
      });
    }
    else if (user.role === "tutor" && model.modelName === "Course") {
      count = await model.countDocuments({
        createdAt: {
          $gte: startDate,
          $lte: endDate,
        },
        "_id": {
          $in: user?.createdCourses?.map((course: { _id: string }) => course._id) || []
        }
      });
    }
    else if (user.role === "tutor" && model.modelName === "Order") {  
      // console.log("StartDate : ", startDate, "EndDate :", endDate," CurrentDate :-", currentDate);
      count = await model.countDocuments({
        createdAt: {
          $gt: startDate,
          $lte: endDate,
        },
        "courseId": {
          $in: user?.createdCourses?.map((course: { _id: string }) => course._id) || []
        }
      });
    }
    else {
      count = await model.countDocuments({
        createdAt: {
          $gte: startDate,
          $lte: endDate,
        }
      });
    }
    last12Months.push({ month: monthYear, count });
  }

  return { last12Months };
}
