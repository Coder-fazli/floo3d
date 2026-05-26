import { getPostById } from "@/lib/actions.admin";
import PostEditor from "../../PostEditor";
import { notFound } from "next/navigation";

export default async function EditPostPage({ params }: { params: { id: string } }) {
  const post = await getPostById(params.id);
  if (!post) notFound();
  return <PostEditor post={post} />;
}
