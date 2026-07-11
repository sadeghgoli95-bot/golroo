type Props = {
  children: React.ReactNode;
};

export default function Container({ children }: Props) {
  return (
    <div
      className="container"
      style={{
        width: "min(1180px,92%)",
        margin: "auto",
      }}
    >
      {children}
    </div>
  );
}
