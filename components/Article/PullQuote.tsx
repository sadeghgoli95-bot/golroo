type Props = {
  children: React.ReactNode;
};

export default function PullQuote({ children }: Props) {
  return (
    <blockquote className="pull-quote">
      {children}
    </blockquote>
  );
}
