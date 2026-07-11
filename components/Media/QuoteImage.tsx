type Props = {
  quote: string;
  author: string;
};

export default function QuoteImage({ quote, author }: Props) {
  return (
    <div className="rhythm-sm">
      <div className="rule-short" />
      <blockquote className="headline">{quote}</blockquote>
      <p className="caption">{author}</p>
    </div>
  );
}
