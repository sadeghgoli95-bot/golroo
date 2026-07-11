import { observations } from "@/data/observations";
import ObservationCard from "./ObservationCard";

export default function ObservationGrid() {
  return (
    <div className="grid">
      {observations.map(item => (
        <ObservationCard key={item.id} item={item} />
      ))}
    </div>
  );
}
