export default function TestLayout({ children }: { children: React.ReactNode }) {
  // Providers supplied locally inside the dynamic test client to avoid pulling
  // the progress graph into the initial chunk (prevents "topics is not defined").
  return <>{children}</>;
}
