import express from "express";
import { authorizeRoles, isAutheticated } from "../middleware/auth";
import { getNotifications, updateNotification } from "../controllers/notification.controller";
const notificationRoute = express.Router();

notificationRoute.get(
  "/get-all-notifications",
  isAutheticated,
  authorizeRoles("admin", "tutor"),
  getNotifications
);
notificationRoute.put("/update-notification/:id", isAutheticated, authorizeRoles("admin","tutor"), updateNotification);

export default notificationRoute;
