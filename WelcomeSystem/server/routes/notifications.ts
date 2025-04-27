import express from "express";
import { storage } from "../storage";
import { isAuthenticated } from "../auth";

const router = express.Router();

// Get all notifications for the authenticated user
router.get("/", isAuthenticated, async (req, res) => {
  try {
    const notifications = await storage.getNotifications(req.user!.id);
    res.json(notifications);
  } catch (error) {
    console.error("Error fetching notifications:", error);
    res.status(500).json({ error: "Failed to fetch notifications" });
  }
});

// Get unread notifications for the authenticated user
router.get("/unread", isAuthenticated, async (req, res) => {
  try {
    const notifications = await storage.getUnreadNotifications(req.user!.id);
    res.json(notifications);
  } catch (error) {
    console.error("Error fetching unread notifications:", error);
    res.status(500).json({ error: "Failed to fetch unread notifications" });
  }
});

// Mark a notification as read
router.put("/:id/read", isAuthenticated, async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    if (isNaN(id)) {
      return res.status(400).json({ error: "Invalid notification ID" });
    }
    
    const notification = await storage.markNotificationAsRead(id);
    if (!notification) {
      return res.status(404).json({ error: "Notification not found" });
    }
    
    res.json(notification);
  } catch (error) {
    console.error("Error marking notification as read:", error);
    res.status(500).json({ error: "Failed to mark notification as read" });
  }
});

// Delete a notification
router.delete("/:id", isAuthenticated, async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    if (isNaN(id)) {
      return res.status(400).json({ error: "Invalid notification ID" });
    }
    
    const success = await storage.deleteNotification(id);
    if (!success) {
      return res.status(404).json({ error: "Notification not found" });
    }
    
    res.status(204).end();
  } catch (error) {
    console.error("Error deleting notification:", error);
    res.status(500).json({ error: "Failed to delete notification" });
  }
});

export default router;