import { getRailwayDeployments } from '@/lib/railway';
import { getVercelDeployments } from '@/lib/vercel';
import DeploymentView from './components/DeploymentView';

export default async function Home() {
  const [railwayDeployments, vercelDeployments] = await Promise.all([
    getRailwayDeployments(),
    getVercelDeployments(),
  ]);

  return (
    <main className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 p-8">
      <div className="max-w-7xl mx-auto">
        <header className="mb-8">
          <h1 className="text-4xl font-bold text-white mb-2">Deploy Eye 👁️</h1>
          <p className="text-gray-400">Monitor your Railway and Vercel deployments in one place</p>
        </header>

        <DeploymentView
          railwayDeployments={railwayDeployments}
          vercelDeployments={vercelDeployments}
        />

        <footer className="mt-8 text-center text-gray-500 text-sm">
          <p>Auto-refreshes on page reload • Built with Next.js</p>
        </footer>
      </div>
    </main>
  );
}
