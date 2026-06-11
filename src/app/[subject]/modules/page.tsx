import { redirect } from "next/navigation";
import { requireSubjectConfig } from "@/lib/content/loader";
import { getSubjectPath } from "@/lib/subject-urls";

type Props = { params: Promise<{ subject: string }> };

/** Legacy modules index — canonical course home is /[subject]. */
export default async function SubjectModulesIndexRedirect({ params }: Props) {
  const { subject: slug } = await params;

  try {
    await requireSubjectConfig(slug);
  } catch {
    redirect("/subjects");
  }

  redirect(getSubjectPath(slug));
}