import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import MainLayout from "@/layouts/MainLayout";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { MessageSquare, PlusCircle, MessageCircle, Clock } from "lucide-react";

interface ForumPost {
  id: number;
  userId: number;
  title: string;
  content: string;
  category: string;
  createdAt: string;
  updatedAt: string;
  username: string;
  profilePicture?: string;
  commentCount: number;
}

interface ForumComment {
  id: number;
  postId: number;
  userId: number;
  content: string;
  createdAt: string;
  updatedAt: string;
  username: string;
  profilePicture?: string;
}

// Helper function to render posts
function renderPosts(
  posts: ForumPost[] | undefined, 
  isLoading: boolean,
  selectedPost: ForumPost | null,
  setSelectedPost: (post: ForumPost) => void
) {
  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full"></div>
      </div>
    );
  }

  if (!posts || posts.length === 0) {
    return (
      <Card className="text-center py-12">
        <CardContent>
          <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-primary/10">
            <MessageSquare className="h-6 w-6 text-primary" />
          </div>
          <h3 className="mb-3 text-lg font-semibold">No posts found</h3>
          <p className="mb-6 text-sm text-gray-500">
            Be the first to start a discussion in this category.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      {posts.map((post) => (
        <Card 
          key={post.id} 
          className={`overflow-hidden hover:shadow-md transition-shadow duration-300 cursor-pointer ${
            selectedPost?.id === post.id ? "border-primary" : ""
          }`}
          onClick={() => setSelectedPost(post)}
        >
          <CardHeader className="pb-2">
            <div className="flex justify-between items-start">
              <div className="flex items-center">
                <Avatar className="h-8 w-8 mr-2">
                  <AvatarImage src={post.profilePicture || "https://github.com/shadcn.png"} alt={post.username} />
                  <AvatarFallback>
                    {post.username.charAt(0).toUpperCase()}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <CardTitle className="text-lg">{post.title}</CardTitle>
                  <CardDescription className="text-xs">
                    Posted by {post.username} • {new Date(post.createdAt).toLocaleDateString()}
                  </CardDescription>
                </div>
              </div>
              <Badge variant="secondary">{post.category}</Badge>
            </div>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-gray-700 line-clamp-2">{post.content}</p>
          </CardContent>
          <CardFooter className="bg-gray-50 px-6 py-2 flex justify-between items-center">
            <div className="flex items-center space-x-4">
              <Button variant="ghost" size="sm" className="text-gray-500">
                <MessageCircle className="mr-1 h-4 w-4" />
                <span>{post.commentCount}</span>
              </Button>
            </div>
            <div className="flex items-center text-xs text-gray-500">
              <Clock className="mr-1 h-3 w-3" />
              {new Date(post.createdAt).toLocaleTimeString()}
            </div>
          </CardFooter>
        </Card>
      ))}
    </div>
  );
}

export default function ForumPage() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [newPostData, setNewPostData] = useState({
    title: "",
    content: "",
    category: "general"
  });
  const [showNewPostForm, setShowNewPostForm] = useState(false);
  const [selectedPost, setSelectedPost] = useState<ForumPost | null>(null);
  const [newComment, setNewComment] = useState("");

  // Fetch forum posts
  const { data: posts, isLoading: postsLoading } = useQuery<ForumPost[]>({
    queryKey: [selectedCategory ? `/api/forum/posts/category/${selectedCategory}` : "/api/forum/posts"],
  });

  // Fetch comments for selected post
  const { data: comments, isLoading: commentsLoading } = useQuery<ForumComment[]>({
    queryKey: [selectedPost ? `/api/forum/posts/${selectedPost.id}/comments` : null],
    enabled: !!selectedPost,
  });

  // Create new post mutation
  const createPost = useMutation({
    mutationFn: async (postData: typeof newPostData) => {
      return apiRequest("POST", "/api/forum/posts", postData);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/forum/posts"] });
      setShowNewPostForm(false);
      setNewPostData({ title: "", content: "", category: "general" });
      toast({
        title: "Success",
        description: "Your post has been created",
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: `Failed to create post: ${error}`,
        variant: "destructive",
      });
    },
  });

  // Create new comment mutation
  const createComment = useMutation({
    mutationFn: async (commentData: { postId: number; content: string }) => {
      return apiRequest("POST", `/api/forum/posts/${commentData.postId}/comments`, {
        content: commentData.content,
      });
    },
    onSuccess: () => {
      if (selectedPost) {
        queryClient.invalidateQueries({ queryKey: [`/api/forum/posts/${selectedPost.id}/comments`] });
      }
      setNewComment("");
      toast({
        title: "Success",
        description: "Your comment has been added",
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: `Failed to add comment: ${error}`,
        variant: "destructive",
      });
    },
  });

  const handleSubmitPost = (e: React.FormEvent) => {
    e.preventDefault();
    createPost.mutate(newPostData);
  };

  const handleSubmitComment = (e: React.FormEvent) => {
    e.preventDefault();
    if (selectedPost && newComment.trim()) {
      createComment.mutate({
        postId: selectedPost.id,
        content: newComment,
      });
    }
  };

  const categories = [
    { id: "general", name: "General Discussion" },
    { id: "ideation", name: "Idea Validation" },
    { id: "mvp", name: "MVP Development" },
    { id: "funding", name: "Funding & Investment" },
    { id: "marketing", name: "Marketing & Growth" },
    { id: "legal", name: "Legal & Compliance" },
  ];

  return (
    <MainLayout title="Community Forum" subtitle="Connect with other entrepreneurs and share ideas">
      <div className="flex justify-between items-center mb-6">
        <Tabs defaultValue="all" className="w-full">
          <div className="flex justify-between items-center mb-4">
            <TabsList>
              <TabsTrigger value="all">All Posts</TabsTrigger>
              {categories.map((category) => (
                <TabsTrigger 
                  key={category.id} 
                  value={category.id}
                  onClick={() => setSelectedCategory(category.id)}
                >
                  {category.name}
                </TabsTrigger>
              ))}
            </TabsList>
            <Button onClick={() => setShowNewPostForm(!showNewPostForm)}>
              <PlusCircle className="mr-2 h-4 w-4" />
              {showNewPostForm ? "Cancel" : "New Post"}
            </Button>
          </div>

          {/* New Post Form */}
          {showNewPostForm && (
            <Card className="mb-8 mt-4">
              <CardHeader>
                <CardTitle>Create New Post</CardTitle>
                <CardDescription>Share your thoughts, questions, or ideas with the community.</CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSubmitPost} className="space-y-4">
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Title</label>
                    <input
                      type="text"
                      value={newPostData.title}
                      onChange={(e) => setNewPostData({ ...newPostData, title: e.target.value })}
                      className="w-full p-2 border rounded-md"
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Category</label>
                    <select
                      value={newPostData.category}
                      onChange={(e) => setNewPostData({ ...newPostData, category: e.target.value })}
                      className="w-full p-2 border rounded-md"
                    >
                      {categories.map((category) => (
                        <option key={category.id} value={category.id}>
                          {category.name}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Content</label>
                    <textarea
                      value={newPostData.content}
                      onChange={(e) => setNewPostData({ ...newPostData, content: e.target.value })}
                      className="w-full p-2 border rounded-md min-h-[150px]"
                      required
                    />
                  </div>
                  <div className="flex justify-end">
                    <Button
                      type="submit"
                      disabled={createPost.isPending}
                    >
                      {createPost.isPending ? "Posting..." : "Publish Post"}
                    </Button>
                  </div>
                </form>
              </CardContent>
            </Card>
          )}

          {/* Main Content */}
          <TabsContent value="all">
            {renderPosts(posts, postsLoading, selectedPost, setSelectedPost)}
          </TabsContent>
          
          {categories.map((category) => (
            <TabsContent key={category.id} value={category.id}>
              {renderPosts(
                posts?.filter(post => post.category === category.id),
                postsLoading,
                selectedPost,
                setSelectedPost
              )}
            </TabsContent>
          ))}

        </Tabs>
      </div>
      
      {/* Post Details and Comments */}
      {selectedPost && (
        <Card className="mt-6">
          <CardHeader>
            <div className="flex justify-between items-start">
              <div>
                <CardTitle className="text-2xl">{selectedPost.title}</CardTitle>
                <CardDescription className="flex items-center mt-2">
                  <Avatar className="h-6 w-6 mr-2">
                    <AvatarImage src={selectedPost.profilePicture || "https://github.com/shadcn.png"} alt={selectedPost.username} />
                    <AvatarFallback>
                      {selectedPost.username.charAt(0).toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  Posted by {selectedPost.username} on {new Date(selectedPost.createdAt).toLocaleDateString()}
                </CardDescription>
              </div>
              <Badge>{selectedPost.category}</Badge>
            </div>
          </CardHeader>
          <CardContent className="border-t border-b py-4">
            <div className="prose max-w-none">{selectedPost.content}</div>
          </CardContent>
          <CardContent>
            <h3 className="text-lg font-semibold mb-4">Comments ({comments?.length || 0})</h3>
            <div className="space-y-4 mb-6">
              {commentsLoading ? (
                <div className="flex justify-center py-4">
                  <div className="animate-spin h-6 w-6 border-4 border-primary border-t-transparent rounded-full"></div>
                </div>
              ) : comments && comments.length > 0 ? (
                comments.map((comment) => (
                  <div key={comment.id} className="bg-gray-50 p-4 rounded-md">
                    <div className="flex items-center mb-2">
                      <Avatar className="h-8 w-8 mr-2">
                        <AvatarImage src={comment.profilePicture || "https://github.com/shadcn.png"} alt={comment.username} />
                        <AvatarFallback>
                          {comment.username.charAt(0).toUpperCase()}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <div className="font-medium">{comment.username}</div>
                        <div className="text-xs text-gray-500">
                          {new Date(comment.createdAt).toLocaleString()}
                        </div>
                      </div>
                    </div>
                    <div className="ml-10">{comment.content}</div>
                  </div>
                ))
              ) : (
                <div className="text-center text-gray-500 py-4">No comments yet</div>
              )}
            </div>

            {/* Add Comment Form */}
            <form onSubmit={handleSubmitComment} className="mt-4">
              <div className="mb-3">
                <label className="block text-sm font-medium mb-2">Add a comment</label>
                <textarea
                  value={newComment}
                  onChange={(e) => setNewComment(e.target.value)}
                  className="w-full p-2 border rounded-md"
                  rows={3}
                  required
                />
              </div>
              <div className="flex justify-end">
                <Button
                  type="submit"
                  disabled={createComment.isPending || !newComment.trim()}
                >
                  {createComment.isPending ? "Posting..." : "Post Comment"}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}
    </MainLayout>
  );
}