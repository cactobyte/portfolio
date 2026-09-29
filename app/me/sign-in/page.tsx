import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { auth, isOwner } from "@/auth";
import { signInWithGitHub } from "../actions";

export const metadata: Metadata = { title: "Sign in" };

export default async function SignIn({ searchParams }: PageProps<"/me/sign-in">) {
  const session = await auth();
  if (isOwner(session?.githubId)) redirect("/me");
  const { error } = await searchParams;

  return (
    <main className="me-signin">
      <p className="me-wordmark">
        boris<span>_</span>
      </p>
      <form action={signInWithGitHub}>
        <button type="submit" className="me-btn me-btn-primary">
          Sign in with GitHub
        </button>
      </form>
      {error && <p className="me-error">That GitHub account doesn&apos;t have access.</p>}
    </main>
  );
}
