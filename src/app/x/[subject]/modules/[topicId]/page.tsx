import Link from "next/link";
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
      <div className="px-4 py-12 sm:px-6">
        <div className="mx-auto max-w-2xl theme-text-secondary">
          <p className="text-sm">No MDX explanation data for topic “{topicId}” in this subject yet (or topic unknown in bundle).</p>
          <Link href={`/x/${subjectSlug}`} className="mt-4 inline-block text-sm text-[var(--accent)] hover:underline">← Back to {subjectSlug.replace(/-/g, " ")} topics</Link>
        </div>
      </div>
    );
  }

  return (
    <GenericModuleViewer
      topicId={topicId}
      title={mdxModule.title || topic.title}
      mdxSource={mdxModule.mdxSource}
      subjectSlug={subjectSlug}
      subjectLabel={bundle.config.label}
    />
  );
}
