import NextAuth from "next-auth";
import GitHub from "next-auth/providers/github";

/** The one GitHub account allowed into /me. Unset means nobody gets in. */
function ownerGithubId(): string | undefined {
  return process.env.OWNER_GITHUB_ID?.trim() || undefined;
}

export function isOwner(githubId: string | undefined): boolean {
  const owner = ownerGithubId();
  return Boolean(owner && githubId && githubId === owner);
}

export const { handlers, auth, signIn, signOut } = NextAuth({
  providers: [GitHub],
  session: { strategy: "jwt", maxAge: 30 * 24 * 60 * 60 },
  pages: { signIn: "/me/sign-in", error: "/me/sign-in" },
  callbacks: {
    signIn({ profile }) {
      return isOwner(profile?.id != null ? String(profile.id) : undefined);
    },
    jwt({ token, profile }) {
      if (profile?.id != null) token.githubId = String(profile.id);
      return token;
    },
    session({ session, token }) {
      session.githubId = typeof token.githubId === "string" ? token.githubId : undefined;
      return session;
    },
  },
});

declare module "next-auth" {
  interface Session {
    githubId?: string;
  }
}
