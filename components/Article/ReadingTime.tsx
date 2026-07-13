type Props = {
  minutes: number;
};

export default function ReadingTime({ minutes }: Props) {
  return (
    <div className="article-meta">
      <span>{minutes} دقیقه مطالعه</span>
    </div>
  );
}
