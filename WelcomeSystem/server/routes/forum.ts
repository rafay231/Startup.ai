import express from "express";
import { storage } from "../storage";
import { isAuthenticated } from "../auth";
import { insertForumPostSchema, insertForumCommentSchema } from "@shared/schema";

const router = express.Router();

// Get all forum posts
router.get("/posts", async (req, res) => {
  try {
    const posts = await storage.getForumPosts();
    res.json(posts);
  } catch (error) {
    console.error("Error fetching forum posts:", error);
    res.status(500).json({ error: "Failed to fetch forum posts" });
  }
});

// Get forum posts by category
router.get("/posts/category/:category", async (req, res) => {
  try {
    const { category } = req.params;
    const posts = await storage.getForumPostsByCategory(category);
    res.json(posts);
  } catch (error) {
    console.error("Error fetching forum posts by category:", error);
    res.status(500).json({ error: "Failed to fetch forum posts by category" });
  }
});

// Get forum posts by user
router.get("/posts/user/:userId", async (req, res) => {
  try {
    const userId = parseInt(req.params.userId);
    if (isNaN(userId)) {
      return res.status(400).json({ error: "Invalid user ID" });
    }
    
    const posts = await storage.getForumPostsByUser(userId);
    res.json(posts);
  } catch (error) {
    console.error("Error fetching forum posts by user:", error);
    res.status(500).json({ error: "Failed to fetch forum posts by user" });
  }
});

// Get a specific forum post
router.get("/posts/:id", async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    if (isNaN(id)) {
      return res.status(400).json({ error: "Invalid post ID" });
    }
    
    const post = await storage.getForumPost(id);
    if (!post) {
      return res.status(404).json({ error: "Forum post not found" });
    }
    
    // Increment view count
    await storage.updateForumPost(id, { views: post.views + 1 });
    
    // Get comments for this post
    const comments = await storage.getForumComments(id);
    
    res.json({ ...post, comments });
  } catch (error) {
    console.error("Error fetching forum post:", error);
    res.status(500).json({ error: "Failed to fetch forum post" });
  }
});

// Create a new forum post
router.post("/posts", isAuthenticated, async (req, res) => {
  try {
    const result = insertForumPostSchema.safeParse(req.body);
    if (!result.success) {
      return res.status(400).json({ error: "Invalid forum post data", details: result.error });
    }
    
    const post = await storage.createForumPost({
      ...result.data,
      userId: req.user!.id
    });
    
    res.status(201).json(post);
  } catch (error) {
    console.error("Error creating forum post:", error);
    res.status(500).json({ error: "Failed to create forum post" });
  }
});

// Update a forum post
router.put("/posts/:id", isAuthenticated, async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    if (isNaN(id)) {
      return res.status(400).json({ error: "Invalid post ID" });
    }
    
    const post = await storage.getForumPost(id);
    if (!post) {
      return res.status(404).json({ error: "Forum post not found" });
    }
    
    // Check if the user is the author of the post
    if (post.userId !== req.user!.id) {
      return res.status(403).json({ error: "You are not authorized to update this post" });
    }
    
    const updatedPost = await storage.updateForumPost(id, req.body);
    res.json(updatedPost);
  } catch (error) {
    console.error("Error updating forum post:", error);
    res.status(500).json({ error: "Failed to update forum post" });
  }
});

// Delete a forum post
router.delete("/posts/:id", isAuthenticated, async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    if (isNaN(id)) {
      return res.status(400).json({ error: "Invalid post ID" });
    }
    
    const post = await storage.getForumPost(id);
    if (!post) {
      return res.status(404).json({ error: "Forum post not found" });
    }
    
    // Check if the user is the author of the post
    if (post.userId !== req.user!.id) {
      return res.status(403).json({ error: "You are not authorized to delete this post" });
    }
    
    // Delete all comments associated with this post
    const comments = await storage.getForumComments(id);
    for (const comment of comments) {
      await storage.deleteForumComment(comment.id);
    }
    
    const success = await storage.deleteForumPost(id);
    if (!success) {
      return res.status(500).json({ error: "Failed to delete forum post" });
    }
    
    res.status(204).end();
  } catch (error) {
    console.error("Error deleting forum post:", error);
    res.status(500).json({ error: "Failed to delete forum post" });
  }
});

// Like a forum post
router.post("/posts/:id/like", isAuthenticated, async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    if (isNaN(id)) {
      return res.status(400).json({ error: "Invalid post ID" });
    }
    
    const post = await storage.getForumPost(id);
    if (!post) {
      return res.status(404).json({ error: "Forum post not found" });
    }
    
    const updatedPost = await storage.updateForumPost(id, { likes: post.likes + 1 });
    res.json(updatedPost);
  } catch (error) {
    console.error("Error liking forum post:", error);
    res.status(500).json({ error: "Failed to like forum post" });
  }
});

// Get comments for a post
router.get("/posts/:postId/comments", async (req, res) => {
  try {
    const postId = parseInt(req.params.postId);
    if (isNaN(postId)) {
      return res.status(400).json({ error: "Invalid post ID" });
    }
    
    const comments = await storage.getForumComments(postId);
    res.json(comments);
  } catch (error) {
    console.error("Error fetching comments:", error);
    res.status(500).json({ error: "Failed to fetch comments" });
  }
});

// Create a comment
router.post("/posts/:postId/comments", isAuthenticated, async (req, res) => {
  try {
    const postId = parseInt(req.params.postId);
    if (isNaN(postId)) {
      return res.status(400).json({ error: "Invalid post ID" });
    }
    
    const post = await storage.getForumPost(postId);
    if (!post) {
      return res.status(404).json({ error: "Forum post not found" });
    }
    
    const result = insertForumCommentSchema.safeParse({
      ...req.body,
      postId,
      userId: req.user!.id
    });
    
    if (!result.success) {
      return res.status(400).json({ error: "Invalid comment data", details: result.error });
    }
    
    const comment = await storage.createForumComment(result.data);
    
    // Create a notification for the post author if it's not the same user
    if (post.userId !== req.user!.id) {
      await storage.createNotification({
        userId: post.userId,
        type: "comment",
        message: `${req.user!.username} commented on your post "${post.title}"`,
        relatedEntityId: postId,
        relatedEntityType: "post"
      });
    }
    
    res.status(201).json(comment);
  } catch (error) {
    console.error("Error creating comment:", error);
    res.status(500).json({ error: "Failed to create comment" });
  }
});

// Update a comment
router.put("/comments/:id", isAuthenticated, async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    if (isNaN(id)) {
      return res.status(400).json({ error: "Invalid comment ID" });
    }
    
    const comment = await storage.getForumComment(id);
    if (!comment) {
      return res.status(404).json({ error: "Comment not found" });
    }
    
    // Check if the user is the author of the comment
    if (comment.userId !== req.user!.id) {
      return res.status(403).json({ error: "You are not authorized to update this comment" });
    }
    
    const updatedComment = await storage.updateForumComment(id, req.body);
    res.json(updatedComment);
  } catch (error) {
    console.error("Error updating comment:", error);
    res.status(500).json({ error: "Failed to update comment" });
  }
});

// Delete a comment
router.delete("/comments/:id", isAuthenticated, async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    if (isNaN(id)) {
      return res.status(400).json({ error: "Invalid comment ID" });
    }
    
    const comment = await storage.getForumComment(id);
    if (!comment) {
      return res.status(404).json({ error: "Comment not found" });
    }
    
    // Check if the user is the author of the comment
    if (comment.userId !== req.user!.id) {
      return res.status(403).json({ error: "You are not authorized to delete this comment" });
    }
    
    const success = await storage.deleteForumComment(id);
    if (!success) {
      return res.status(500).json({ error: "Failed to delete comment" });
    }
    
    res.status(204).end();
  } catch (error) {
    console.error("Error deleting comment:", error);
    res.status(500).json({ error: "Failed to delete comment" });
  }
});

// Like a comment
router.post("/comments/:id/like", isAuthenticated, async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    if (isNaN(id)) {
      return res.status(400).json({ error: "Invalid comment ID" });
    }
    
    const comment = await storage.getForumComment(id);
    if (!comment) {
      return res.status(404).json({ error: "Comment not found" });
    }
    
    const updatedComment = await storage.updateForumComment(id, { likes: comment.likes + 1 });
    res.json(updatedComment);
  } catch (error) {
    console.error("Error liking comment:", error);
    res.status(500).json({ error: "Failed to like comment" });
  }
});

export default router;