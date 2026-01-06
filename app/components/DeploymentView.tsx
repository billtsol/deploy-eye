'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { LayoutGrid, List, RefreshCw } from 'lucide-react';
import type { RailwayDeployment } from '@/lib/railway';
import type { VercelDeployment } from '@/lib/vercel';

type CombinedDeployment = {
  id: string;
  platform: 'railway' | 'vercel';
  name: string;
  status: string;
  url?: string;
  createdAt: string | number;
  serviceName?: string;
  environment?: string;
};

function getStatusColor(status: string) {
  const statusUpper = status.toUpperCase();
  if (['SUCCESS', 'READY'].includes(statusUpper)) return 'bg-green-500';
  if (['BUILDING', 'DEPLOYING', 'INITIALIZING', 'QUEUED'].includes(statusUpper)) return 'bg-yellow-500 animate-pulse';
  if (['FAILED', 'ERROR', 'CRASHED'].includes(statusUpper)) return 'bg-red-500';
  return 'bg-gray-500';
}

function getStatusIcon(status: string) {
  const statusUpper = status.toUpperCase();
  if (['SUCCESS', 'READY'].includes(statusUpper)) return '✓';
  if (['BUILDING', 'DEPLOYING', 'INITIALIZING', 'QUEUED'].includes(statusUpper)) return '⟳';
  if (['FAILED', 'ERROR', 'CRASHED'].includes(statusUpper)) return '✕';
  return '○';
}

function formatTime(timestamp: string | number) {
  const date = new Date(typeof timestamp === 'number' ? timestamp : timestamp);
  const now = new Date();
  const diff = now.getTime() - date.getTime();
  const minutes = Math.floor(diff / 60000);
  const hours = Math.floor(minutes / 60);
  const days = Math.floor(hours / 24);

  if (days > 0) return `${days}d ago`;
  if (hours > 0) return `${hours}h ago`;
  if (minutes > 0) return `${minutes}m ago`;
  return 'just now';
}

interface DeploymentViewProps {
  railwayDeployments: RailwayDeployment[];
  vercelDeployments: VercelDeployment[];
}

export default function DeploymentView({ railwayDeployments, vercelDeployments }: DeploymentViewProps) {
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [isRefreshing, setIsRefreshing] = useState(false);
  const router = useRouter();

  const handleRefresh = async () => {
    setIsRefreshing(true);
    router.refresh();
    // Reset after animation completes
    setTimeout(() => setIsRefreshing(false), 1000);
  };

  // Combine and sort deployments by date
  const combinedDeployments: CombinedDeployment[] = [
    ...railwayDeployments.map(d => ({
      id: d.id,
      platform: 'railway' as const,
      name: d.projectName || 'Unknown',
      status: d.status,
      createdAt: d.createdAt,
      serviceName: d.serviceName,
      environment: d.environmentName,
    })),
    ...vercelDeployments.map(d => ({
      id: d.uid,
      platform: 'vercel' as const,
      name: d.name,
      status: d.state,
      url: d.url,
      createdAt: d.created,
      environment: d.target,
    })),
  ].sort((a, b) => {
    const timeA = typeof a.createdAt === 'number' ? a.createdAt : new Date(a.createdAt).getTime();
    const timeB = typeof b.createdAt === 'number' ? b.createdAt : new Date(b.createdAt).getTime();
    return timeB - timeA; // Most recent first
  });

  return (
    <>
      {/* View Toggle */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-lg font-semibold text-white">
            {viewMode === 'grid' ? 'Platform View' : 'Combined Timeline'}
          </h2>
          <p className="text-sm text-gray-400">
            {combinedDeployments.length} total deployments
          </p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={handleRefresh}
            disabled={isRefreshing}
            className="p-2 rounded-lg bg-gray-800 text-gray-400 hover:bg-gray-700 transition-colors disabled:opacity-50"
            title="Refresh deployments"
          >
            <RefreshCw className={`w-5 h-5 ${isRefreshing ? 'animate-spin' : ''}`} />
          </button>
          <button
            onClick={() => setViewMode('grid')}
            className={`p-2 rounded-lg transition-colors ${
              viewMode === 'grid'
                ? 'bg-purple-600 text-white'
                : 'bg-gray-800 text-gray-400 hover:bg-gray-700'
            }`}
            title="Grid view"
          >
            <LayoutGrid className="w-5 h-5" />
          </button>
          <button
            onClick={() => setViewMode('list')}
            className={`p-2 rounded-lg transition-colors ${
              viewMode === 'list'
                ? 'bg-purple-600 text-white'
                : 'bg-gray-800 text-gray-400 hover:bg-gray-700'
            }`}
            title="List view"
          >
            <List className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Grid View (Side by Side) */}
      {viewMode === 'grid' && (
        <div className="grid md:grid-cols-2 gap-6">
          {/* Railway Column */}
          <div className="bg-gray-800/50 backdrop-blur rounded-lg border border-gray-700 p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-pink-500 rounded-lg flex items-center justify-center text-white font-bold">
                R
              </div>
              <div>
                <h2 className="text-xl font-semibold text-white">Railway</h2>
                <p className="text-sm text-gray-400">{railwayDeployments.length} deployments</p>
              </div>
            </div>
            <div className="space-y-3">
              {railwayDeployments.length === 0 ? (
                <p className="text-gray-500 text-sm">No deployments found.</p>
              ) : (
                railwayDeployments.map((deployment) => (
                  <div
                    key={deployment.id}
                    className="bg-gray-900/50 rounded-lg p-4 border border-gray-700 hover:border-gray-600 transition-colors"
                  >
                    <div className="flex items-start justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <span className={`w-2 h-2 rounded-full ${getStatusColor(deployment.status)}`} />
                        <span className="font-medium text-white">{deployment.projectName}</span>
                      </div>
                      <span className="text-xs text-gray-400">{formatTime(deployment.createdAt)}</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm">
                      <span className="text-gray-400">{deployment.serviceName}</span>
                      <span className="text-gray-600">•</span>
                      <span className={`${getStatusColor(deployment.status)} text-white px-2 py-0.5 rounded text-xs`}>
                        {getStatusIcon(deployment.status)} {deployment.status}
                      </span>
                    </div>
                    {deployment.environmentName && (
                      <div className="mt-1 text-xs text-gray-500">{deployment.environmentName}</div>
                    )}
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Vercel Column */}
          <div className="bg-gray-800/50 backdrop-blur rounded-lg border border-gray-700 p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 bg-black rounded-lg flex items-center justify-center">
                <svg className="w-6 h-6" viewBox="0 0 76 65" fill="white">
                  <path d="M37.5274 0L75.0548 65H0L37.5274 0Z" />
                </svg>
              </div>
              <div>
                <h2 className="text-xl font-semibold text-white">Vercel</h2>
                <p className="text-sm text-gray-400">{vercelDeployments.length} deployments</p>
              </div>
            </div>
            <div className="space-y-3">
              {vercelDeployments.length === 0 ? (
                <p className="text-gray-500 text-sm">No deployments found.</p>
              ) : (
                vercelDeployments.map((deployment) => (
                  <a
                    key={deployment.uid}
                    href={`https://${deployment.url}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="block bg-gray-900/50 rounded-lg p-4 border border-gray-700 hover:border-gray-600 transition-colors"
                  >
                    <div className="flex items-start justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <span className={`w-2 h-2 rounded-full ${getStatusColor(deployment.state)}`} />
                        <span className="font-medium text-white">{deployment.name}</span>
                      </div>
                      <span className="text-xs text-gray-400">{formatTime(deployment.created)}</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm">
                      <span className="text-gray-400 truncate">{deployment.url}</span>
                    </div>
                    <div className="flex items-center gap-2 mt-2">
                      <span className={`${getStatusColor(deployment.state)} text-white px-2 py-0.5 rounded text-xs`}>
                        {getStatusIcon(deployment.state)} {deployment.state}
                      </span>
                      {deployment.target && (
                        <>
                          <span className="text-gray-600">•</span>
                          <span className="text-xs text-gray-500">{deployment.target}</span>
                        </>
                      )}
                    </div>
                  </a>
                ))
              )}
            </div>
          </div>
        </div>
      )}

      {/* List View (Combined Timeline) */}
      {viewMode === 'list' && (
        <div className="bg-gray-800/50 backdrop-blur rounded-lg border border-gray-700 p-6">
          <div className="space-y-3">
            {combinedDeployments.length === 0 ? (
              <p className="text-gray-500 text-sm">No deployments found.</p>
            ) : (
              combinedDeployments.map((deployment) => {
                const Wrapper = deployment.url ? 'a' : 'div';
                const wrapperProps = deployment.url
                  ? { href: `https://${deployment.url}`, target: '_blank', rel: 'noopener noreferrer' }
                  : {};

                return (
                  <Wrapper
                    key={deployment.id}
                    {...wrapperProps}
                    className="block bg-gray-900/50 rounded-lg p-4 border border-gray-700 hover:border-gray-600 transition-colors"
                  >
                    <div className="flex items-center justify-between gap-4">
                      {/* Platform Badge */}
                      <div className="flex items-center gap-3 min-w-[120px]">
                        {deployment.platform === 'railway' ? (
                          <div className="w-8 h-8 bg-gradient-to-br from-purple-500 to-pink-500 rounded flex items-center justify-center text-white text-xs font-bold">
                            R
                          </div>
                        ) : (
                          <div className="w-8 h-8 bg-black rounded flex items-center justify-center">
                            <svg className="w-5 h-5" viewBox="0 0 76 65" fill="white">
                              <path d="M37.5274 0L75.0548 65H0L37.5274 0Z" />
                            </svg>
                          </div>
                        )}
                        <span className="text-xs text-gray-500 uppercase tracking-wide">
                          {deployment.platform}
                        </span>
                      </div>

                      {/* Deployment Info */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <span className={`w-2 h-2 rounded-full flex-shrink-0 ${getStatusColor(deployment.status)}`} />
                          <span className="font-medium text-white truncate">{deployment.name}</span>
                        </div>
                        {deployment.serviceName && (
                          <div className="text-sm text-gray-400 truncate">{deployment.serviceName}</div>
                        )}
                        {deployment.url && (
                          <div className="text-sm text-gray-500 truncate">{deployment.url}</div>
                        )}
                      </div>

                      {/* Status & Time */}
                      <div className="flex items-center gap-3">
                        <span className={`${getStatusColor(deployment.status)} text-white px-2 py-1 rounded text-xs whitespace-nowrap`}>
                          {getStatusIcon(deployment.status)} {deployment.status}
                        </span>
                        {deployment.environment && (
                          <span className="text-xs text-gray-500 hidden sm:block">{deployment.environment}</span>
                        )}
                        <span className="text-xs text-gray-400 whitespace-nowrap min-w-[60px] text-right">
                          {formatTime(deployment.createdAt)}
                        </span>
                      </div>
                    </div>
                  </Wrapper>
                );
              })
            )}
          </div>
        </div>
      )}
    </>
  );
}
