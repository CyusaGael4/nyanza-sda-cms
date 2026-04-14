import { LoadingLink } from "@/components/NavigationProgress";

export function BackHomeButton() {
  return (
    <LoadingLink className="back-home-btn" href="/">
      <svg viewBox="0 0 24 24" aria-hidden="true">
        <path
          d="M15 18 9 12l6-6"
          fill="none"
          stroke="currentColor"
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth="2"
        />
      </svg>
      Ahabanza
    </LoadingLink>
  );
}
