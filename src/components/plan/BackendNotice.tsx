export function BackendNotice() {
  return (
    <section className="plan-page" aria-labelledby="backend-title">
      <h1 id="backend-title">Planering är inte påslagen här</h1>
      <p>Den här versionen saknar koppling till databasen. Ställ in Supabase-variablerna (se .env.example) och starta om.</p>
    </section>
  );
}
