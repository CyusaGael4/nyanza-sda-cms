import { LoadingSpinner } from "@/components/LoadingSpinner";

export default function Loading() {
  return (
    <main className="shell">
      <div className="container">
        <section className="card loading-card">
          <LoadingSpinner center label="Birimo gufungura..." />
        </section>
      </div>
    </main>
  );
}
