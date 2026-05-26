import { getAllPosts } from "@/lib/actions.admin";
import PostsListClient from "./PostsListClient";

export default async function AdminPosts() {
  const posts = await getAllPosts();
  return <PostsListClient posts={posts} />;
}
