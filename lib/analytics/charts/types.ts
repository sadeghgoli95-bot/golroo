export type ChartPoint = {
  label: string;
  value: number;
};

export type ChartSeries = {
  id: string;
  label: string;
  points: ChartPoint[];
};
