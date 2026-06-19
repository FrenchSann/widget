import ScanForm from '@/components/ui/ScanForm'

export default function HomePage() {
  return (
    <>
      <header className="sticky top-0 z-50 bg-blue-900 border-b border-blue-800">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 h-14 flex items-center justify-between">
          <span className="text-white font-bold text-lg">AccessAudit</span>
          <nav>
            <a
              href="#comment-ca-marche"
              className="text-blue-200 hover:text-white text-sm transition-colors focus:outline-none focus:underline"
            >
              Comment ça marche
            </a>
          </nav>
        </div>
      </header>

      <main>
        {/* Hero */}
        <section className="bg-gradient-to-b from-blue-900 to-blue-800 text-white py-20 px-4">
          <div className="max-w-3xl mx-auto text-center">
            <p className="text-blue-300 text-sm font-medium uppercase tracking-widest mb-4">
              European Accessibility Act · En vigueur depuis juin 2025
            </p>
            <h1 className="text-4xl sm:text-5xl font-extrabold leading-tight mb-6 text-balance">
              Votre site est-il conforme à&nbsp;l&apos;EAA&nbsp;?
            </h1>
            <p className="text-blue-100 text-lg mb-10 max-w-xl mx-auto text-balance">
              Depuis juin&nbsp;2025, l&apos;European Accessibility Act oblige toutes les entreprises
              de l&apos;UE à rendre leurs services numériques accessibles. Les sanctions peuvent
              atteindre{' '}
              <strong className="text-white">50&nbsp;000&nbsp;€ par service numérique</strong>.
            </p>
            <div className="flex justify-center">
              <ScanForm />
            </div>
            <p className="mt-5 text-blue-300 text-xs">
              Audit gratuit · Aucune inscription · Résultats en moins de 20&nbsp;secondes
            </p>
          </div>
        </section>

        {/* Legal callout */}
        <div
          className="bg-amber-50 border-y border-amber-200 py-4 px-4"
          role="note"
          aria-label="Obligation légale EAA"
        >
          <div className="max-w-6xl mx-auto flex flex-wrap items-center justify-center gap-x-6 gap-y-2 text-sm text-amber-800">
            <span>
              ⚠️ <strong>Obligation légale</strong> depuis juin 2025
            </span>
            <span aria-hidden="true">·</span>
            <span>
              Amendes jusqu&apos;à <strong>50&nbsp;000&nbsp;€ par service</strong>
            </span>
            <span aria-hidden="true">·</span>
            <span>
              Applicable à toutes les <strong>PME de l&apos;UE</strong>
            </span>
          </div>
        </div>

        {/* How it works */}
        <section className="py-16 px-4 bg-white" id="comment-ca-marche">
          <div className="max-w-5xl mx-auto">
            <h2 className="text-2xl font-bold text-center text-gray-900 mb-12">
              Comment ça marche
            </h2>
            <ol className="grid sm:grid-cols-3 gap-8 list-none">
              {[
                {
                  step: '1',
                  title: "Entrez l'URL",
                  description:
                    "Collez l'adresse de n'importe quelle page publique de votre site. Aucune installation requise.",
                },
                {
                  step: '2',
                  title: 'Analyse RGAA automatique',
                  description:
                    "Notre moteur parcourt la page et détecte les violations WCAG 2.1 et critères RGAA en moins de 20 secondes.",
                },
                {
                  step: '3',
                  title: "Plan d'action personnalisé",
                  description:
                    "Chaque problème est classé par gravité et thématique RGAA, avec un guide de correction pour vos développeurs.",
                },
              ].map((item) => (
                <li key={item.step} className="flex flex-col items-center text-center p-6 rounded-xl bg-gray-50">
                  <div
                    className="w-10 h-10 rounded-full bg-blue-700 text-white font-bold flex items-center justify-center mb-4 text-lg"
                    aria-hidden="true"
                  >
                    {item.step}
                  </div>
                  <h3 className="font-semibold text-gray-900 mb-2">{item.title}</h3>
                  <p className="text-gray-600 text-sm">{item.description}</p>
                </li>
              ))}
            </ol>
          </div>
        </section>

        {/* Features */}
        <section className="py-16 px-4 bg-gray-50">
          <div className="max-w-4xl mx-auto">
            <h2 className="text-2xl font-bold text-center text-gray-900 mb-4">
              Ce que vous obtenez
            </h2>
            <p className="text-center text-gray-600 mb-10 max-w-xl mx-auto">
              Un audit automatisé basé sur axe-core, le moteur de référence utilisé par les équipes
              accessibilité du monde entier.
            </p>
            <ul className="grid sm:grid-cols-2 gap-6 list-none">
              {[
                {
                  icon: '📊',
                  title: "Score d'accessibilité",
                  desc: "Un score de 0 à 100 reflétant la gravité des violations détectées.",
                },
                {
                  icon: '🔍',
                  title: 'Violations classées par gravité',
                  desc: 'Critique, Sérieux, Modéré, Mineur — priorisez ce qui compte vraiment.',
                },
                {
                  icon: '🗂️',
                  title: 'Thématiques RGAA',
                  desc: "Images, Couleurs, Liens, Formulaires… chaque problème rattaché à sa thématique réglementaire.",
                },
                {
                  icon: '🔧',
                  title: 'Guide de correction',
                  desc: 'Chaque violation est liée à une documentation technique pour vos développeurs.',
                },
              ].map((item) => (
                <li key={item.title} className="flex gap-4 p-5 bg-white rounded-xl border border-gray-100 shadow-sm">
                  <span className="text-2xl shrink-0" aria-hidden="true">
                    {item.icon}
                  </span>
                  <div>
                    <h3 className="font-semibold text-gray-900 mb-1">{item.title}</h3>
                    <p className="text-gray-600 text-sm">{item.desc}</p>
                  </div>
                </li>
              ))}
            </ul>
          </div>
        </section>
      </main>

      <footer className="bg-gray-900 text-gray-400 py-10 px-4">
        <div className="max-w-4xl mx-auto text-sm space-y-3">
          <p className="font-semibold text-gray-300">À propos d&apos;AccessAudit</p>
          <p>
            AccessAudit réalise un <strong className="text-gray-200">audit automatisé</strong> via
            le moteur axe-core. L&apos;outil identifie les violations WCAG&nbsp;2.1 détectables
            automatiquement — soit environ 30 à 40&nbsp;% des critères RGAA. Il ne se substitue pas
            à un audit manuel réalisé par un expert et{' '}
            <strong className="text-gray-200">
              ne garantit en aucun cas la conformité légale
            </strong>{' '}
            à l&apos;EAA ou au RGAA.
          </p>
          <p className="text-xs text-gray-500">
            © 2025 AccessAudit · Résultats indicatifs uniquement
          </p>
        </div>
      </footer>
    </>
  )
}
