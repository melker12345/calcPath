"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useAuth } from "@/components/auth-provider";
import { SectionCard } from "@/components/section-card";
import { addForumPost, addForumReply, getForumPosts } from "@/lib/forum";
import { trackEvent } from "@/lib/analytics";

export default function ForumPage() {
  const { user, isPro } = useAuth();
  const [refreshKey, setRefreshKey] = useState(0);
  const [title, setTitle] = useState("");
  const [body, setBody] = useState("");
  const [replyBody, setReplyBody] = useState<Record<string, string>>({});

  const posts = useMemo(() => getForumPosts(), [refreshKey]);

  useEffect(() => {
    trackEvent("view_forum", { plan: user ? (isPro ? "pro" : "free") : "anonymous" });
  }, [user, isPro]);

  return (
    <div className="mx-auto w-full max-w-6xl px-6 py-12">
      <div className="mb-8 flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-semibold">Community forum</h1>
          <p className="text-sm text-zinc-500">
            Ask questions, share insights, and learn together.
          </p>
        </div>
        {!isPro && (
          <Link className="btn-primary" href="/pricing">
            Upgrade to participate
          </Link>
        )}
      </div>

      <div className="grid gap-6 lg:grid-cols-[1.1fr_0.9fr]">
        <div className="space-y-4">
          {posts.length === 0 ? (
            <SectionCard
              title="No posts yet"
              description="Be the first to start a discussion."
            >
              <p className="text-sm text-zinc-500">
                Paid members can start threads and reply.
              </p>
            </SectionCard>
          ) : (
            posts.map((post) => (
              <SectionCard key={post.id} title={post.title}>
                <p className="text-sm text-zinc-600 dark:text-zinc-300">
                  {post.body}
                </p>
                <p className="mt-2 text-xs text-zinc-500">
                  {post.author} · {new Date(post.createdAt).toLocaleString()}
                </p>
                <div className="mt-4 space-y-3 border-t border-zinc-200 pt-4 text-sm dark:border-zinc-800">
                  {post.replies.length === 0 ? (
                    <p className="text-xs text-zinc-500">No replies yet.</p>
                  ) : (
                    post.replies.map((reply) => (
                      <div key={reply.id}>
                        <p>{reply.body}</p>
                        <p className="text-xs text-zinc-500">
                          {reply.author} ·{" "}
                          {new Date(reply.createdAt).toLocaleString()}
                        </p>
                      </div>
                    ))
                  )}
                  {isPro ? (
                    <form
                      className="flex flex-col gap-2"
                      onSubmit={(event) => {
                        event.preventDefault();
                        const message = replyBody[post.id]?.trim();
                        if (!message || !user) return;
                        addForumReply(post.id, {
                          id: crypto.randomUUID(),
                          author: user.email ?? user.phone ?? user.id.slice(0, 8),
                          body: message,
                          createdAt: new Date().toISOString(),
                        });
                        setReplyBody((prev) => ({ ...prev, [post.id]: "" }));
                        setRefreshKey((prev) => prev + 1);
                      }}
                    >
                      <textarea
                        className="rounded-lg border border-zinc-300 px-3 py-2 text-sm"
                        rows={2}
                        placeholder="Write a reply..."
                        value={replyBody[post.id] ?? ""}
                        onChange={(event) =>
                          setReplyBody((prev) => ({
                            ...prev,
                            [post.id]: event.target.value,
                          }))
                        }
                      />
                      <button className="btn-secondary w-fit" type="submit">
                        Reply
                      </button>
                    </form>
                  ) : (
                    <p className="text-xs text-zinc-500">
                      Upgrade to reply.
                    </p>
                  )}
                </div>
              </SectionCard>
            ))
          )}
        </div>

        <SectionCard
          title="Start a thread"
          description="Paid members can open new discussions."
        >
          {isPro ? (
            <form
              className="space-y-3"
              onSubmit={(event) => {
                event.preventDefault();
                if (!user) return;
                const trimmedTitle = title.trim();
                const trimmedBody = body.trim();
                if (!trimmedTitle || !trimmedBody) return;
                addForumPost({
                  id: crypto.randomUUID(),
                  author: user.email ?? user.phone ?? user.id.slice(0, 8),
                  title: trimmedTitle,
                  body: trimmedBody,
                  createdAt: new Date().toISOString(),
                  replies: [],
                });
                setTitle("");
                setBody("");
                setRefreshKey((prev) => prev + 1);
              }}
            >
              <input
                className="w-full rounded-lg border border-zinc-300 px-3 py-2 text-sm"
                placeholder="Thread title"
                value={title}
                onChange={(event) => setTitle(event.target.value)}
              />
              <textarea
                className="w-full rounded-lg border border-zinc-300 px-3 py-2 text-sm"
                rows={4}
                placeholder="Share your question or insight..."
                value={body}
                onChange={(event) => setBody(event.target.value)}
              />
              <button type="submit" className="btn-primary w-full">
                Publish thread
              </button>
            </form>
          ) : (
            <div className="space-y-3 text-sm text-zinc-500">
              <p>Upgrade to the Pro plan to post and reply.</p>
              <Link className="btn-primary w-full text-center" href="/pricing">
                Unlock forum access
              </Link>
            </div>
          )}
        </SectionCard>
      </div>
    </div>
  );
}
