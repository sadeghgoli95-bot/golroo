import { notFound } from "next/navigation";
import DashboardHeader from "@/components/dashboard/DashboardHeader";
import { createArticleRepository } from "@/lib/article/repositories";
import { analyzeExistingArticle } from "./reviewAnalysis";
import ReviewWorkspace from "@/components/dashboard/review/ReviewWorkspace";

type ReviewArticlePageProps = {
  params: Promise<{ slug: string }>;
};

export default async function ReviewArticlePage({ params }: ReviewArticlePageProps) {
  const { slug } = await params;
  const repository = createArticleRepository();
  const article = await repository.findBySlug(slug);

  if (!article) notFound();

  const candidates = (await repository.listAll()).filter((summary) => summary.slug !== slug);
  const analysis = analyzeExistingArticle(article, candidates);

  return (
    <>
      <DashboardHeader title={article.title ?? "بدون عنوان"} description="بازبینی و ویرایش مقاله" />
      <ReviewWorkspace slug={slug} article={article} analysis={analysis} />
    </>
  );
}
