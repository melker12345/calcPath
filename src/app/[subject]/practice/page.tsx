import { redirect } from "next/navigation";
import { loadSubjectIndex } from "@/lib/content/loader";

type Props = { params: Promise<{ subject: string }> };

export default async function PracticeIndex({ params }: Props) {
  const { subject: slug } = await params;
  try {
    await loadSubjectIndex(slug);
  } catch {
    redirect("/");
  }
  redirect(`/${slug}`);
}