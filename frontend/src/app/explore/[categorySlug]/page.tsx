import CategoryClient from "./CategoryClient";

export async function generateStaticParams() {
  return [{ categorySlug: 'startup' }];
}

export default async function Page({ params }: { params: Promise<{ categorySlug: string }> }) {
  return <CategoryClient params={params} />;
}
