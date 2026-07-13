type Props = { children: React.ReactNode };

export default function SearchResults({ children }: Props) {
  return <div className="grid">{children}</div>;
}
