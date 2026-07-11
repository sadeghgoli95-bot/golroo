type Props = {
  onClick?: () => void;
};

export default function NextButton({ onClick }: Props) {
  return (
    <button className="btn btn-primary" onClick={onClick}>
      ادامه
    </button>
  );
}
