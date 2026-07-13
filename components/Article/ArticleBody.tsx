type Props = {
  children: React.ReactNode;
};

export default function ArticleBody({ children }: Props) {
  return (
    <article className="reading article-body">
      {children}
    </article>
  );
}
