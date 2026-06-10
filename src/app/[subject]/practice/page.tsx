import { redirect } from "next/navigation";
import { getSubject } from "@/lib/subjects";
import { loadSubjectIndex } from "@/lib/content/loader";

type Props = { params: Promise<{ subject: string }> };

export default async function PracticeIndex({ params }: Props) {
  const { subject: slug } = await params;
  const subject = getSubject(slug);
  if (!subject) {
    // Support auto-discovered: if loader can load index.json, treat as valid subject.
    try {
      await loadSubjectIndex(slug);
    } catch {
      redirect("/");
    }
  }
  // redirect to subject home or modules
  redirect(`/${slug}`);
}
