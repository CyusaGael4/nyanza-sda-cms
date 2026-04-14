"use client";

export function LoadingSpinner({
  label = "Birimo gufungura...",
  center = false,
  small = false
}: {
  label?: string;
  center?: boolean;
  small?: boolean;
}) {
  return (
    <div className={`spinner-wrap ${center ? "center" : ""} ${small ? "small" : ""}`}>
      <span className="spinner" aria-hidden="true" />
      <span className="muted">{label}</span>
    </div>
  );
}
