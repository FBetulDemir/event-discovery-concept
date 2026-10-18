export function BackendNotice() {
  return (
    <section className="page plan" aria-labelledby="backend-title">
      <h1 id="backend-title" className="head">Planering är inte påslagen här</h1>
      <p>Den här versionen saknar koppling till databasen. Ställ in Supabase-variablerna (se .env.example) och starta om.</p>
    </section>
  );
}
