import { Response } from "express";
import { AuthRequest } from "../middleware/auth";
import { Notification } from "../models/Notification";

export async function getNotifications(req: AuthRequest, res: Response): Promise<void> {
  try {
    const user = req.user;
    const district = user?.district || "";

    const query: any = {
      $or: [
        { audience: "ALL_FARMERS" },
        { audience: "DISTRICT", targetDistrict: district }
      ]
    };

    if (user?.role === "ADMIN") {
      delete query.$or; // Admin can view all notifications
    }

    const notifications = await Notification.find(query)
      .populate("schemeId", "schemeName schemeId")
      .populate("publishedBy", "fullName")
      .sort({ createdAt: -1 })
      .limit(50)
      .lean();

    res.status(200).json({
      success: true,
      data: { notifications }
    });
  } catch (err: any) {
    res.status(500).json({ success: false, message: err.message });
  }
}

export async function createNotification(req: AuthRequest, res: Response): Promise<void> {
  try {
    const { title, titleTamil, message, messageTamil, audience, targetDistrict, schemeId, notificationType } = req.body;

    if (!title || !message) {
      res.status(400).json({ success: false, message: "Title and message are required." });
      return;
    }

    const newNotif = await Notification.create({
      title,
      titleTamil,
      message,
      messageTamil,
      audience: audience || "ALL_FARMERS",
      targetDistrict: targetDistrict || "",
      schemeId: schemeId || null,
      notificationType: notificationType || "SYSTEM",
      publishedBy: req.user?._id,
      readBy: []
    });

    res.status(201).json({
      success: true,
      message: "Notification broadcasted successfully.",
      data: { notification: newNotif }
    });
  } catch (err: any) {
    res.status(500).json({ success: false, message: err.message });
  }
}

export async function markAsRead(req: AuthRequest, res: Response): Promise<void> {
  try {
    const { id } = req.params;
    const userId = req.user?._id;

    if (userId) {
      await Notification.findByIdAndUpdate(id, {
        $addToSet: { readBy: userId }
      });
    }

    res.status(200).json({ success: true, message: "Notification marked as read." });
  } catch (err: any) {
    res.status(500).json({ success: false, message: err.message });
  }
}
