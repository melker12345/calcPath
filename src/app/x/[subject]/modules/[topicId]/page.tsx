import { notFound } from "next/navigation";
import { getFileSystemContentBundle } from "@/lib/content/loader";
import { GenericModuleViewer } from "@/components/generic-module-viewer";

interface Props {
  params: Promise<{ subject: string; topicId: string }>;
}

/**
 * Dynamic module/explanation page in experimental area.
 * Completely data-driven: mdxSource comes from the loaded FileSystemContentBundle.
 * Uses GenericModuleViewer for basic rendering.
 */
export default async function DynamicModulePage({ params }: Props) {
  const { subject: subjectSlug, topicId } = await params;

  let bundle;
  try {
    bundle = await getFileSystemContentBundle(subjectSlug);
  } catch {
    notFound();
  }

  const mdxModule = bundle.mdxModules.find((m) => m.topicId === topicId);
  const topic = bundle.topics.find((t) => t.id === topicId);

  if (!mdxModule || !topic) {
    return (
      <main className="mx-auto w-full max-w-[760px] px-4 py-12">
        <p className="text-sm theme-text-secondary">No MDX explanation data for topic “{topicId}” in this subject yet (or topic unknown).</p>
        <a href={`/x/${subjectSlug}`} className="mt-4 inline-block text-sm underline text-[var(--accent)]">Back to browse</a>
      </main>
    );
  }

  return (
    <GenericModuleViewer
      topicId={topicId}
      title={mdxModule.title || topic.title}
      mdxSource={mdxModule.mdxSource}
      subjectSlug={subjectSlug}
    />
  );
}
