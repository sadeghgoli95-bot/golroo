type Props = {
  children: React.ReactNode;
};

export default function Label({ children }: Props) {
  return <span className="caption">{children}</span>;
}
