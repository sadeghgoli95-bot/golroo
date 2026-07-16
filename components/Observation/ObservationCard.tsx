type Props = {
  item: {
    title: string;
    body: string;
  };
};

export default function ObservationCard({ item }: Props) {
  return (
    <article className="card card-static">
      <p className="overline">Observation</p>
      <h3 className="card-title">{item.title}</h3>
      <p className="card-text">{item.body}</p>
    </article>
  );
}
