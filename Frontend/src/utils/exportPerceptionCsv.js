export function exportMember2PerceptionCSV(laneMetrics, fileName = 'traffic-perception') {
  const rows = [
    ['lane', 'vehicle_count', 'queue_length_m', 'average_speed_kmh'],
    ...Object.entries(laneMetrics).map(([lane, metrics]) => [
      lane,
      metrics.count,
      metrics.queueLength,
      metrics.avgSpeed,
    ]),
  ];

  const csv = rows.map((row) => row.join(',')).join('\n');
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = `${fileName.replace(/\.[^.]+$/, '')}-perception.csv`;
  link.click();
  URL.revokeObjectURL(url);
}
