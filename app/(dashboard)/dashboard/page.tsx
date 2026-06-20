import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import Link from 'next/link'

interface Site {
  id: string
  url: string
  name: string
  created_at: string
}

async function signOut() {
  'use server'
  const supabase = createClient()
  await supabase.auth.signOut()
  redirect('/login')
}

export default async function DashboardPage() {
  const supabase = createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  const { data: sites } = await supabase
    .from('sites')
    .select('id, url, name, created_at')
    .order('created_at', { ascending: false })

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white border-b border-gray-200">
        <div className="max-w-5xl mx-auto px-4 h-14 flex items-center justify-between">
          <span className="font-bold text-gray-900 text-lg">AccessAudit</span>
          <div className="flex items-center gap-6">
            <span className="text-sm text-gray-500 hidden sm:block">{user.email}</span>
            <form action={signOut}>
              <button
                type="submit"
                className="text-sm text-gray-700 hover:text-gray-900 focus:underline focus:outline-none"
              >
                Déconnexion
              </button>
            </form>
          </div>
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-4 py-10">
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-2xl font-bold text-gray-900">Mes sites</h1>
          <Link
            href="/"
            className="px-4 py-2 bg-blue-700 text-white font-semibold rounded-lg text-sm hover:bg-blue-800 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-400"
          >
            + Analyser un site
          </Link>
        </div>

        {!sites || sites.length === 0 ? (
          <div className="text-center py-20 bg-white rounded-2xl border border-gray-200">
            <p className="text-5xl mb-4" aria-hidden="true">🔍</p>
            <h2 className="text-xl font-semibold text-gray-900 mb-2">Aucun site analysé</h2>
            <p className="text-gray-500 text-sm mb-6">
              Lancez votre premier scan depuis la page d&apos;accueil.
            </p>
            <Link
              href="/"
              className="inline-block px-6 py-2.5 bg-blue-700 text-white font-semibold rounded-lg text-sm hover:bg-blue-800 transition-colors"
            >
              Analyser mon premier site
            </Link>
          </div>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {(sites as Site[]).map((site) => (
              <div
                key={site.id}
                className="bg-white rounded-xl border border-gray-200 p-5 shadow-sm hover:shadow-md transition-shadow"
              >
                <p className="font-semibold text-gray-900 truncate">{site.name}</p>
                <p className="text-xs text-gray-400 mt-0.5 truncate">{site.url}</p>
                <p className="text-xs text-gray-300 mt-2">
                  Ajouté le{' '}
                  {new Date(site.created_at).toLocaleDateString('fr-FR', {
                    day: '2-digit',
                    month: '2-digit',
                    year: 'numeric',
                  })}
                </p>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  )
}
