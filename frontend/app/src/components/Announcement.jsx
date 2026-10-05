// The scrolling "Free shipping" bar above the navbar. The message is repeated
// across two identical groups so the loop is seamless (see .announcement-track
// in App.css). The animated copy is hidden from screen readers; they get the
// message once through the aria-label.
const message = "Free shipping on orders over $40";

function Group() {
  return (
    <div className="announcement-group">
      {Array.from({ length: 10 }, (_, index) => (
        <span key={index}>
          {message}
          <i aria-hidden="true">✦</i>
        </span>
      ))}
    </div>
  );
}

function Announcement() {
  return (
    <div className="announcement" role="note" aria-label={message}>
      <div className="announcement-track" aria-hidden="true">
        <Group />
        <Group />
      </div>
    </div>
  );
}

export default Announcement;
