const spines = [
  { w: 34, h: 150, color: "#7b2d26" },
  { w: 44, h: 184, color: "#2f5d62" },
  { w: 30, h: 130, color: "#e8a33d" },
  { w: 46, h: 168, color: "#4a3b6b" },
  { w: 36, h: 192, color: "#a63d40" },
  { w: 32, h: 142, color: "#2a2623" },
  { w: 42, h: 176, color: "#c98622" },
  { w: 36, h: 158, color: "#3c6e8f" },
];

function ShelfArt() {
  return (
    <div className="hero-shelf auth-shelf" aria-hidden="true">
      <div className="spines">
        {spines.map((spine, index) => (
          <span
            key={index}
            style={{ flex: spine.w, height: spine.h, background: spine.color }}
          />
        ))}
      </div>
      <div className="board" />
    </div>
  );
}

export default ShelfArt;
