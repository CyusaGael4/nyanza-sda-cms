import { getChurchName } from "@/lib/config";

export function ChurchLogo({ small = false }: { small?: boolean }) {
  const churchName = getChurchName();

  return (
    <div className={`church-logo ${small ? "small" : ""}`}>
      <div className="church-logo-mark" aria-hidden="true">
        <svg viewBox="0 0 120 120" role="img">
          <defs>
            <linearGradient id="flame" x1="0%" x2="100%" y1="0%" y2="100%">
              <stop offset="0%" stopColor="#f7d26a" />
              <stop offset="100%" stopColor="#f39c38" />
            </linearGradient>
          </defs>
          <path
            d="M60 12c7 13 21 21 21 37 0 15-9 25-21 25s-21-10-21-23c0-10 4-17 12-26 0 10 6 17 12 19-1-12 2-20-3-32Z"
            fill="url(#flame)"
          />
          <path
            d="M24 82c11-6 23-9 36-9s25 3 36 9"
            fill="none"
            stroke="#0f6470"
            strokeLinecap="round"
            strokeWidth="5"
          />
          <path
            d="M30 90h60"
            fill="none"
            stroke="#0f6470"
            strokeWidth="5"
            strokeLinecap="round"
          />
          <path
            d="M60 34v34M48 47h24"
            stroke="#fffef6"
            strokeWidth="6"
            strokeLinecap="round"
          />
        </svg>
      </div>
      <div>
        <p className="church-kicker">Itorero ry&apos;Abadiventisiti b&apos;Umunsi wa Karindwi</p>
        <strong>{churchName}</strong>
      </div>
    </div>
  );
}
