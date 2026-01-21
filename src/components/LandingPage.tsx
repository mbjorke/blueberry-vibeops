import { EnvironmentBadge } from './EnvironmentBadge'
import { isSupabaseConfigured } from '../lib/supabase'

export const LandingPage = () => {
  const isConfigured = isSupabaseConfigured()

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 text-white">
      <EnvironmentBadge />

      {/* Hero Section */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-blue-500/10 to-purple-600/10" />
        <div className="container mx-auto px-4 py-20 relative">
          <div className="max-w-5xl mx-auto text-center">
            {/* Logo/Title */}
            <div className="mb-8">
              <h1 className="text-7xl font-bold mb-4 bg-gradient-to-r from-blue-400 via-purple-500 to-pink-500 bg-clip-text text-transparent">
                VibeOps
              </h1>
              <div className="flex items-center justify-center gap-2 text-gray-400">
                <span className="text-2xl">🚀</span>
                <p className="text-2xl font-light">Managed DevSecOps för AI-kodade appar</p>
              </div>
            </div>

            {/* Subtitle */}
            <p className="text-xl text-gray-300 mb-8 max-w-3xl mx-auto leading-relaxed">
              Fork, konfigurera, och var produktionsredo på 5 minuter. Komplett med säkerhet,
              CI/CD, och 3 miljöer. Perfekt för Lovable, Cursor och andra AI-verktyg.
            </p>

            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row gap-4 justify-center mb-12">
              <a
                href="https://github.com/mbjorke/vibeops-template"
                target="_blank"
                rel="noopener noreferrer"
                className="px-8 py-4 bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg font-semibold text-lg hover:from-blue-600 hover:to-purple-700 transition-all transform hover:scale-105 shadow-lg"
              >
                Use This Template
              </a>
              <a
                href="https://github.com/mbjorke/vibeops-template"
                target="_blank"
                rel="noopener noreferrer"
                className="px-8 py-4 bg-gray-800 border border-gray-700 rounded-lg font-semibold text-lg hover:bg-gray-700 transition-all"
              >
                View on GitHub ⭐
              </a>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6 max-w-3xl mx-auto">
              <div className="bg-gray-800/50 backdrop-blur rounded-lg p-4 border border-gray-700">
                <div className="text-3xl font-bold text-blue-400">5 min</div>
                <div className="text-sm text-gray-400">Setup Time</div>
              </div>
              <div className="bg-gray-800/50 backdrop-blur rounded-lg p-4 border border-gray-700">
                <div className="text-3xl font-bold text-green-400">3</div>
                <div className="text-sm text-gray-400">Environments</div>
              </div>
              <div className="bg-gray-800/50 backdrop-blur rounded-lg p-4 border border-gray-700">
                <div className="text-3xl font-bold text-purple-400">100%</div>
                <div className="text-sm text-gray-400">Open Source</div>
              </div>
              <div className="bg-gray-800/50 backdrop-blur rounded-lg p-4 border border-gray-700">
                <div className="text-3xl font-bold text-orange-400">0</div>
                <div className="text-sm text-gray-400">Config Files*</div>
              </div>
            </div>
            <p className="text-xs text-gray-500 mt-4">*Just add your env vars</p>
          </div>
        </div>
      </section>

      {/* Configuration Status Alert */}
      {!isConfigured && (
        <section className="bg-yellow-500/10 border-y border-yellow-500/20 py-4">
          <div className="container mx-auto px-4">
            <div className="max-w-4xl mx-auto flex items-center justify-center gap-3 text-yellow-400">
              <svg className="w-6 h-6 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <p className="text-sm">
                <strong>Not configured yet?</strong> Copy .env.example to .env.local and add your Supabase credentials to get started.
              </p>
            </div>
          </div>
        </section>
      )}

      {/* Environment Badges Showcase */}
      <section className="py-16 bg-gray-900/50">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            <h2 className="text-3xl font-bold text-center mb-4">Visual Environment Indicators</h2>
            <p className="text-gray-400 text-center mb-12">
              Always know which environment you're in with color-coded badges
            </p>
            <div className="grid md:grid-cols-3 gap-6">
              <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
                <div className="flex items-center gap-3 mb-3">
                  <div className="bg-blue-500 text-white px-3 py-1.5 rounded-lg font-semibold text-sm">
                    DEV
                  </div>
                  <span className="text-blue-400">🔵</span>
                </div>
                <h3 className="font-semibold mb-2">Development</h3>
                <p className="text-sm text-gray-400">
                  Lovable iteration, fast prototyping, and experimentation
                </p>
              </div>
              <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
                <div className="flex items-center gap-3 mb-3">
                  <div className="bg-orange-500 text-white px-3 py-1.5 rounded-lg font-semibold text-sm">
                    BETA
                  </div>
                  <span className="text-orange-400">🟠</span>
                </div>
                <h3 className="font-semibold mb-2">Beta/Staging</h3>
                <p className="text-sm text-gray-400">
                  Testing with real data before production deployment
                </p>
              </div>
              <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
                <div className="flex items-center gap-3 mb-3">
                  <div className="bg-red-500 text-white px-3 py-1.5 rounded-lg font-semibold text-sm">
                    PROD
                  </div>
                  <span className="text-red-400">🔴</span>
                </div>
                <h3 className="font-semibold mb-2">Production</h3>
                <p className="text-sm text-gray-400">
                  Live environment serving real users
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          <div className="max-w-6xl mx-auto">
            <h2 className="text-4xl font-bold text-center mb-4">Everything You Need, Built In</h2>
            <p className="text-gray-400 text-center mb-12 text-lg">
              Stop configuring infrastructure. Start building features.
            </p>

            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {/* Feature 1 */}
              <div className="bg-gray-800/50 backdrop-blur rounded-lg p-6 border border-gray-700 hover:border-blue-500/50 transition-all">
                <div className="w-12 h-12 bg-blue-500/10 rounded-lg flex items-center justify-center mb-4">
                  <svg className="w-6 h-6 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                  </svg>
                </div>
                <h3 className="text-xl font-semibold mb-2">Säkerhet Först</h3>
                <p className="text-gray-400 text-sm">
                  CodeQL, Dependabot, Gitleaks, och RLS policies inbyggt. OWASP best practices från start.
                </p>
              </div>

              {/* Feature 2 */}
              <div className="bg-gray-800/50 backdrop-blur rounded-lg p-6 border border-gray-700 hover:border-green-500/50 transition-all">
                <div className="w-12 h-12 bg-green-500/10 rounded-lg flex items-center justify-center mb-4">
                  <svg className="w-6 h-6 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                  </svg>
                </div>
                <h3 className="text-xl font-semibold mb-2">GitHub Actions</h3>
                <p className="text-gray-400 text-sm">
                  Automatisk CI/CD med scanning, testing, och deploy previews på varje PR.
                </p>
              </div>

              {/* Feature 3 */}
              <div className="bg-gray-800/50 backdrop-blur rounded-lg p-6 border border-gray-700 hover:border-purple-500/50 transition-all">
                <div className="w-12 h-12 bg-purple-500/10 rounded-lg flex items-center justify-center mb-4">
                  <svg className="w-6 h-6 text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 7v10c0 2.21 3.582 4 8 4s8-1.79 8-4V7M4 7c0 2.21 3.582 4 8 4s8-1.79 8-4M4 7c0-2.21 3.582-4 8-4s8 1.79 8 4m0 5c0 2.21-3.582 4-8 4s-8-1.79-8-4" />
                  </svg>
                </div>
                <h3 className="text-xl font-semibold mb-2">Supabase Ready</h3>
                <p className="text-gray-400 text-sm">
                  Pre-konfigurerad med RLS, migrations, och environment isolation för DEV/BETA/PROD.
                </p>
              </div>

              {/* Feature 4 */}
              <div className="bg-gray-800/50 backdrop-blur rounded-lg p-6 border border-gray-700 hover:border-orange-500/50 transition-all">
                <div className="w-12 h-12 bg-orange-500/10 rounded-lg flex items-center justify-center mb-4">
                  <svg className="w-6 h-6 text-orange-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" />
                  </svg>
                </div>
                <h3 className="text-xl font-semibold mb-2">Modern Stack</h3>
                <p className="text-gray-400 text-sm">
                  React 19, TypeScript, Vite, Tailwind CSS v4. Allt optimerat för hastighet och DX.
                </p>
              </div>

              {/* Feature 5 */}
              <div className="bg-gray-800/50 backdrop-blur rounded-lg p-6 border border-gray-700 hover:border-pink-500/50 transition-all">
                <div className="w-12 h-12 bg-pink-500/10 rounded-lg flex items-center justify-center mb-4">
                  <svg className="w-6 h-6 text-pink-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4" />
                  </svg>
                </div>
                <h3 className="text-xl font-semibold mb-2">AI-Optimerad</h3>
                <p className="text-gray-400 text-sm">
                  Perfekt för Lovable, Cursor, och andra AI-verktyg. Tydlig struktur och dokumentation.
                </p>
              </div>

              {/* Feature 6 */}
              <div className="bg-gray-800/50 backdrop-blur rounded-lg p-6 border border-gray-700 hover:border-yellow-500/50 transition-all">
                <div className="w-12 h-12 bg-yellow-500/10 rounded-lg flex items-center justify-center mb-4">
                  <svg className="w-6 h-6 text-yellow-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <h3 className="text-xl font-semibold mb-2">5-Min Setup</h3>
                <p className="text-gray-400 text-sm">
                  Fork, lägg till env vars, kör npm install. Färdig. Ingen komplex konfiguration.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Quick Start Section */}
      <section className="py-16 bg-gray-900/50">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            <h2 className="text-4xl font-bold text-center mb-4">Get Started in 5 Minutes</h2>
            <p className="text-gray-400 text-center mb-12 text-lg">
              Från fork till production på rekordtid
            </p>

            <div className="space-y-6">
              {/* Step 1 */}
              <div className="flex gap-4">
                <div className="flex-shrink-0 w-10 h-10 bg-blue-500 rounded-full flex items-center justify-center font-bold">
                  1
                </div>
                <div className="flex-1">
                  <h3 className="text-xl font-semibold mb-2">Fork Repository</h3>
                  <div className="bg-gray-800 rounded-lg p-4 border border-gray-700">
                    <code className="text-sm text-green-400">
                      https://github.com/mbjorke/vibeops-template
                    </code>
                  </div>
                  <p className="text-gray-400 text-sm mt-2">
                    Klicka på "Use this template" eller fork:a repot direkt
                  </p>
                </div>
              </div>

              {/* Step 2 */}
              <div className="flex gap-4">
                <div className="flex-shrink-0 w-10 h-10 bg-blue-500 rounded-full flex items-center justify-center font-bold">
                  2
                </div>
                <div className="flex-1">
                  <h3 className="text-xl font-semibold mb-2">Skapa Supabase Projekt</h3>
                  <p className="text-gray-400 text-sm mb-2">
                    Skapa 3 projekt på <a href="https://supabase.com" target="_blank" rel="noopener noreferrer" className="text-blue-400 hover:underline">supabase.com</a>:
                    your-app-dev, your-app-beta, your-app-prod
                  </p>
                </div>
              </div>

              {/* Step 3 */}
              <div className="flex gap-4">
                <div className="flex-shrink-0 w-10 h-10 bg-blue-500 rounded-full flex items-center justify-center font-bold">
                  3
                </div>
                <div className="flex-1">
                  <h3 className="text-xl font-semibold mb-2">Konfigurera Environment</h3>
                  <div className="bg-gray-800 rounded-lg p-4 border border-gray-700 font-mono text-sm">
                    <div className="text-gray-500"># Kopiera exempel-filen</div>
                    <div className="text-green-400">cp .env.example .env.local</div>
                    <div className="mt-2 text-gray-500"># Lägg till dina Supabase credentials</div>
                  </div>
                </div>
              </div>

              {/* Step 4 */}
              <div className="flex gap-4">
                <div className="flex-shrink-0 w-10 h-10 bg-blue-500 rounded-full flex items-center justify-center font-bold">
                  4
                </div>
                <div className="flex-1">
                  <h3 className="text-xl font-semibold mb-2">Installera & Kör</h3>
                  <div className="bg-gray-800 rounded-lg p-4 border border-gray-700 font-mono text-sm">
                    <div className="text-green-400">npm install</div>
                    <div className="text-green-400">npm run dev</div>
                  </div>
                  <p className="text-gray-400 text-sm mt-2">
                    Öppna localhost:5173 och se din app med miljö-badge!
                  </p>
                </div>
              </div>

              {/* Step 5 */}
              <div className="flex gap-4">
                <div className="flex-shrink-0 w-10 h-10 bg-green-500 rounded-full flex items-center justify-center font-bold">
                  ✓
                </div>
                <div className="flex-1">
                  <h3 className="text-xl font-semibold mb-2">Push & Deploy</h3>
                  <div className="bg-gray-800 rounded-lg p-4 border border-gray-700 font-mono text-sm">
                    <div className="text-green-400">git push origin main</div>
                  </div>
                  <p className="text-gray-400 text-sm mt-2">
                    GitHub Actions kör automatiskt! CodeQL, säkerhetsscanning, och mer.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Tech Stack Section */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            <h2 className="text-3xl font-bold text-center mb-12">Built With Modern Tools</h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
              <div className="bg-gray-800/50 rounded-lg p-6 text-center border border-gray-700">
                <div className="text-4xl mb-2">⚛️</div>
                <div className="font-semibold">React 19</div>
                <div className="text-xs text-gray-400">UI Library</div>
              </div>
              <div className="bg-gray-800/50 rounded-lg p-6 text-center border border-gray-700">
                <div className="text-4xl mb-2">⚡</div>
                <div className="font-semibold">Vite</div>
                <div className="text-xs text-gray-400">Build Tool</div>
              </div>
              <div className="bg-gray-800/50 rounded-lg p-6 text-center border border-gray-700">
                <div className="text-4xl mb-2">🎨</div>
                <div className="font-semibold">Tailwind</div>
                <div className="text-xs text-gray-400">Styling</div>
              </div>
              <div className="bg-gray-800/50 rounded-lg p-6 text-center border border-gray-700">
                <div className="text-4xl mb-2">🗄️</div>
                <div className="font-semibold">Supabase</div>
                <div className="text-xs text-gray-400">Backend</div>
              </div>
              <div className="bg-gray-800/50 rounded-lg p-6 text-center border border-gray-700">
                <div className="text-4xl mb-2">🔷</div>
                <div className="font-semibold">TypeScript</div>
                <div className="text-xs text-gray-400">Language</div>
              </div>
              <div className="bg-gray-800/50 rounded-lg p-6 text-center border border-gray-700">
                <div className="text-4xl mb-2">🔄</div>
                <div className="font-semibold">GitHub Actions</div>
                <div className="text-xs text-gray-400">CI/CD</div>
              </div>
              <div className="bg-gray-800/50 rounded-lg p-6 text-center border border-gray-700">
                <div className="text-4xl mb-2">🔐</div>
                <div className="font-semibold">CodeQL</div>
                <div className="text-xs text-gray-400">Security</div>
              </div>
              <div className="bg-gray-800/50 rounded-lg p-6 text-center border border-gray-700">
                <div className="text-4xl mb-2">📦</div>
                <div className="font-semibold">Dependabot</div>
                <div className="text-xs text-gray-400">Updates</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gradient-to-r from-blue-900/20 to-purple-900/20">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto text-center">
            <h2 className="text-4xl font-bold mb-4">Ready to VibeOps?</h2>
            <p className="text-xl text-gray-300 mb-8">
              Sluta konfigurera. Börja bygga. Fork templatet och var produktionsredo på 5 minuter.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <a
                href="https://github.com/mbjorke/vibeops-template"
                target="_blank"
                rel="noopener noreferrer"
                className="px-8 py-4 bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg font-semibold text-lg hover:from-blue-600 hover:to-purple-700 transition-all transform hover:scale-105 shadow-lg"
              >
                Get Started Now →
              </a>
              <a
                href="https://github.com/mbjorke/vibeops-template/blob/main/README.md"
                target="_blank"
                rel="noopener noreferrer"
                className="px-8 py-4 bg-transparent border-2 border-gray-600 rounded-lg font-semibold text-lg hover:border-gray-500 transition-all"
              >
                Read Documentation
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-gray-800 py-12">
        <div className="container mx-auto px-4">
          <div className="max-w-6xl mx-auto">
            <div className="grid md:grid-cols-4 gap-8 mb-8">
              <div>
                <h3 className="font-bold text-lg mb-4">VibeOps</h3>
                <p className="text-sm text-gray-400">
                  Managed DevSecOps template för AI-kodade appar. Open source och gratis att använda.
                </p>
              </div>
              <div>
                <h4 className="font-semibold mb-4">Resources</h4>
                <ul className="space-y-2 text-sm text-gray-400">
                  <li>
                    <a href="https://github.com/mbjorke/vibeops-template" className="hover:text-blue-400">
                      GitHub
                    </a>
                  </li>
                  <li>
                    <a href="https://github.com/mbjorke/vibeops-template/blob/main/README.md" className="hover:text-blue-400">
                      Documentation
                    </a>
                  </li>
                  <li>
                    <a href="https://github.com/mbjorke/vibeops-template/blob/main/CONTRIBUTING.md" className="hover:text-blue-400">
                      Contributing
                    </a>
                  </li>
                  <li>
                    <a href="https://github.com/mbjorke/vibeops-template/blob/main/CHANGELOG.md" className="hover:text-blue-400">
                      Changelog
                    </a>
                  </li>
                </ul>
              </div>
              <div>
                <h4 className="font-semibold mb-4">Community</h4>
                <ul className="space-y-2 text-sm text-gray-400">
                  <li>
                    <a href="https://github.com/mbjorke/vibeops-template/issues" className="hover:text-blue-400">
                      Issues
                    </a>
                  </li>
                  <li>
                    <a href="https://github.com/mbjorke/vibeops-template/discussions" className="hover:text-blue-400">
                      Discussions
                    </a>
                  </li>
                  <li>
                    <a href="https://github.com/mbjorke/vibeops-template/blob/main/SECURITY.md" className="hover:text-blue-400">
                      Security
                    </a>
                  </li>
                </ul>
              </div>
              <div>
                <h4 className="font-semibold mb-4">More</h4>
                <ul className="space-y-2 text-sm text-gray-400">
                  <li>
                    <a href="https://supabase.com" target="_blank" rel="noopener noreferrer" className="hover:text-blue-400">
                      Supabase
                    </a>
                  </li>
                  <li>
                    <a href="https://lovable.dev" target="_blank" rel="noopener noreferrer" className="hover:text-blue-400">
                      Lovable
                    </a>
                  </li>
                  <li>
                    <a href="https://cursor.sh" target="_blank" rel="noopener noreferrer" className="hover:text-blue-400">
                      Cursor
                    </a>
                  </li>
                </ul>
              </div>
            </div>
            <div className="border-t border-gray-800 pt-8 flex flex-col md:flex-row justify-between items-center text-sm text-gray-400">
              <p>© 2026 VibeOps. MIT License.</p>
              <p>Made with ❤️ for the AI coding community</p>
            </div>
          </div>
        </div>
      </footer>
    </div>
  )
}
