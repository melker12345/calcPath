import { redirect } from "next/navigation";

/** Legacy route — calculus readiness now lives at /diagnostic/calculus. */
export default function OnboardingDiagnosticRedirect() {
  redirect("/diagnostic/calculus");
}