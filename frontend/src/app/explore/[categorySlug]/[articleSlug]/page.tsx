import ArticleClient from "./ArticleClient";

export async function generateStaticParams() {
  return [{ categorySlug: 'startup', articleSlug: 'guide' }];
}

export default async function Page({ params }: { params: Promise<{ categorySlug: string; articleSlug: string }> }) {
  return <ArticleClient params={params} />;
}
