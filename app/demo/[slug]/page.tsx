import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Site from "@/components/site/site";
import { getSite, sites } from "@/content/sites";

export const dynamicParams = false;

export function generateStaticParams() {
  return sites.filter((site) => site.status !== "live").map((site) => ({ slug: site.slug }));
}

export async function generateMetadata({ params }: PageProps<"/demo/[slug]">): Promise<Metadata> {
  const { slug } = await params;
  const site = getSite(slug);
  if (!site) return {};
  const { business } = site;
  return {
    title: business.nameZh ? `${business.name} ${business.nameZh}` : business.name,
    description: business.summary,
    // Demos are pitches to one business, never meant to be found by search.
    robots: { index: false, follow: false },
  };
}

export default async function DemoPage({ params }: PageProps<"/demo/[slug]">) {
  const { slug } = await params;
  const site = getSite(slug);
  if (!site || site.status === "live") notFound();
  return <Site site={site} />;
}
