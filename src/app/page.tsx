export default function Home() {
  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-center">
        <h1 className="text-4xl font-bold text-primary mb-4">📦 StockFlow</h1>
        <p className="text-text-secondary mb-8">
          Système de gestion d'inventaire
        </p>
        <a
          href="/dashboard"
          className="px-6 py-3 bg-primary text-white rounded-lg hover:bg-primary-dark transition"
        >
          Accéder au dashboard
        </a>
      </div>
    </div>
  );
}
