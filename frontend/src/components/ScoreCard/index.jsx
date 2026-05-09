export default function ScoreCard({ title, value }) {
  return (
    <div className="stat-box">
      <div className="stat-label">{title}</div>
      <div className="stat-value">{value}</div>
    </div>
  );
}
