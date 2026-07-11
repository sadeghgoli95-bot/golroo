type Props = {
  step: number;
  total: number;
};

export default function StepIndicator({ step, total }: Props) {
  return (
    <p className="caption">{step} / {total}</p>
  );
}
