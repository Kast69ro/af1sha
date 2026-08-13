export default function HallSkeleton() {
  return (
    <div style={{ padding: "40px 16px" }}>
      <style>{`@keyframes pulse { 0%,100%{opacity:1} 50%{opacity:0.4} }`}</style>
      {[...Array(8)].map((_, i) => (
        <div
          key={i}
          style={{ display: "flex", justifyContent: "center", gap: 3, marginBottom: 3 }}
        >
          {[...Array(14)].map((_, j) => (
            <div
              key={j}
              style={{
                width: 18,
                height: 16,
                borderRadius: 3,
                background: "#c5c6c6",
                animation: "pulse 1.5s infinite",
                animationDelay: `${(i + j) * 0.03}s`,
              }}
            />
          ))}
        </div>
      ))}
    </div>
  );
}