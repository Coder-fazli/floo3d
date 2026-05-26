import { getPostById } from "@/lib/actions.admin";
import PostEditor from "../../PostEditor";
import { notFound } from "next/navigation";

export default async function EditPostPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const post = await getPostById(id);
  if (!post) notFound();
  return <PostEditor post={post} />;
}
