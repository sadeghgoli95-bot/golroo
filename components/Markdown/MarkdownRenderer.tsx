import { ReactNode } from "react";

type Props = {
  children: ReactNode;
};

export default function MarkdownRenderer({ children }: Props) {
  return (
    <article className="reading rhythm-lg">
      {children}
    </article>
  );
}
