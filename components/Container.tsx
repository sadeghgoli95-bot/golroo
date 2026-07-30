type Props = {
  children: React.ReactNode;
  className?: string;
  style?: React.CSSProperties;
};

export default function Container({ children, className, style }: Props) {
  return (
    <div
      className={className ? `container ${className}` : "container"}
      style={{
        width: "min(1180px,92%)",
        margin: "auto",
        ...style,
      }}
    >
      {children}
    </div>
  );
}
