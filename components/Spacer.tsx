type Props = {
  size?: "sm" | "md" | "lg" | "xl";
};

export default function Spacer({ size = "md" }: Props) {
  const map = { sm: 32, md: 64, lg: 96, xl: 160 };
  return <div style={{ height: map[size] }} />;
}
