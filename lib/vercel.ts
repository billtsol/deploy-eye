export interface VercelDeployment {
  uid: string;
  name: string;
  url: string;
  created: number;
  state: 'BUILDING' | 'ERROR' | 'INITIALIZING' | 'QUEUED' | 'READY' | 'CANCELED';
  ready: number;
  target: string;
}

export async function getVercelDeployments(): Promise<VercelDeployment[]> {
  const token = process.env.VERCEL_TOKEN;

  if (!token) {
    throw new Error('VERCEL_TOKEN not configured');
  }

  try {
    const response = await fetch('https://api.vercel.com/v6/deployments?limit=10', {
      headers: {
        'Authorization': `Bearer ${token}`,
      },
      cache: 'no-store'
    });

    if (!response.ok) {
      throw new Error(`Vercel API error: ${response.statusText}`);
    }

    const data = await response.json();
    return data.deployments || [];
  } catch (error) {
    console.error('Failed to fetch Vercel deployments:', error);
    return [];
  }
}
