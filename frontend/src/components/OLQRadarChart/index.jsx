export default function OLQRadarChart({ scores = {}, size = 300 }) {
  const keys = ['EI','RA','OA','PE','SA','C','SR','IN','SC','SD','AIG','L','D','Cour'];
  const labels = {
    EI: 'Effective Intel.', RA: 'Reasoning', OA: 'Organising', PE: 'Expression',
    SA: 'Social Adapt.', C: 'Cooperation', SR: 'Responsibility', IN: 'Initiative',
    SC: 'Self-Confidence', SD: 'Speed of Dec.', AIG: 'Influence', L: 'Liveliness',
    D: 'Determination', Cour: 'Courage'
  };

  const cx = size / 2, cy = size / 2;
  const maxR = size * 0.38;
  const n = keys.length;
  const angleStep = (2 * Math.PI) / n;

  const getPoint = (idx, value) => {
    const angle = angleStep * idx - Math.PI / 2;
    const r = (value / 10) * maxR;
    return { x: cx + r * Math.cos(angle), y: cy + r * Math.sin(angle) };
  };

  // Grid rings
  const rings = [2, 4, 6, 8, 10];
  const gridPaths = rings.map(ringVal => {
    const points = keys.map((_, i) => getPoint(i, ringVal));
    return points.map(p => `${p.x},${p.y}`).join(' ');
  });

  // Data polygon
  const dataPoints = keys.map((k, i) => getPoint(i, scores[k] || 0));
  const dataPath = dataPoints.map(p => `${p.x},${p.y}`).join(' ');

  // Axis lines
  const axes = keys.map((_, i) => getPoint(i, 10));

  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
      <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
        {/* Grid */}
        {gridPaths.map((pts, idx) => (
          <polygon key={idx} points={pts} fill="none" stroke="var(--gray-700)" strokeWidth="0.5" opacity={0.6} />
        ))}

        {/* Axes */}
        {axes.map((pt, idx) => (
          <line key={idx} x1={cx} y1={cy} x2={pt.x} y2={pt.y} stroke="var(--gray-700)" strokeWidth="0.5" opacity={0.4} />
        ))}

        {/* Data fill */}
        <polygon points={dataPath} fill="rgba(59,130,246,0.2)" stroke="#3b82f6" strokeWidth="2" />

        {/* Data points */}
        {dataPoints.map((pt, idx) => {
          const val = scores[keys[idx]] || 0;
          const color = val >= 8 ? '#22c55e' : val >= 5 ? '#3b82f6' : val >= 3 ? '#f59e0b' : '#ef4444';
          return <circle key={idx} cx={pt.x} cy={pt.y} r="4" fill={color} stroke="white" strokeWidth="1" />;
        })}

        {/* Labels */}
        {keys.map((k, idx) => {
          const labelPt = getPoint(idx, 12);
          const angle = angleStep * idx - Math.PI / 2;
          const textAnchor = Math.abs(Math.cos(angle)) < 0.1 ? 'middle' : Math.cos(angle) > 0 ? 'start' : 'end';
          return (
            <text key={idx} x={labelPt.x} y={labelPt.y} textAnchor={textAnchor} dominantBaseline="central"
              fill="var(--gray-400)" fontSize="8" fontWeight="600">
              {labels[k]} ({scores[k] || 0})
            </text>
          );
        })}

        {/* Ring labels */}
        {rings.map(v => (
          <text key={v} x={cx + 3} y={cy - (v / 10) * maxR} fill="var(--gray-600)" fontSize="7">{v}</text>
        ))}
      </svg>
    </div>
  );
}
