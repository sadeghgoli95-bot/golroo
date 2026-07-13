export function getObservationSlugs(observations: { slug: string }[]) {
  return observations.map(o => o.slug);
}
