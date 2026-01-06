export interface RailwayDeployment {
  id: string;
  status: 'SUCCESS' | 'FAILED' | 'BUILDING' | 'CRASHED' | 'DEPLOYING' | 'REMOVED' | 'REMOVING';
  createdAt: string;
  meta?: string;
  projectName?: string;
  serviceName?: string;
  environmentName?: string;
}

export async function getRailwayDeployments(): Promise<RailwayDeployment[]> {
  const token = process.env.RAILWAY_TOKEN;
  const projectId = process.env.RAILWAY_PROJECT_ID;

  if (!token) {
    console.warn('RAILWAY_TOKEN not configured');
    return [];
  }

  // Project tokens work! Use Project-Access-Token header for project tokens
  // For multiple projects, you can add multiple tokens to .env.local

  const query = projectId
    ? `
      query {
        project(id: "${projectId}") {
          id
          name
          services {
            edges {
              node {
                id
                name
                deployments(first: 5) {
                  edges {
                    node {
                      id
                      status
                      createdAt
                      meta
                      environment {
                        name
                      }
                    }
                  }
                }
              }
            }
          }
        }
      }
    `
    : `
      query {
        projects {
          edges {
            node {
              id
              name
              services {
                edges {
                  node {
                    id
                    name
                    deployments(first: 5) {
                      edges {
                        node {
                          id
                          status
                          createdAt
                          meta
                          environment {
                            name
                          }
                        }
                      }
                    }
                  }
                }
              }
            }
          }
        }
      }
    `;

  try {
    const response = await fetch('https://backboard.railway.com/graphql/v2', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        // Project tokens use this header instead of Authorization
        'Authorization': `Bearer ${token}`,
      },
      body: JSON.stringify({ query }),
      cache: 'no-store'
    });

    if (!response.ok) {
      console.error('Railway API error:', response.status, response.statusText);
      return [];
    }

    const data = await response.json();

    // Check for GraphQL errors
    if (data.errors) {
      console.error('Railway GraphQL errors:', JSON.stringify(data.errors, null, 2));
      console.warn('Railway API authentication failed - check token permissions');
      return [];
    }

    const deployments: RailwayDeployment[] = [];

    // Handle single project response (when using project ID)
    if (data?.data?.project) {
      const project = data.data.project;
      const projectName = project.name;
      project.services?.edges?.forEach((service: any) => {
        const serviceName = service.node.name;
        service.node.deployments?.edges?.forEach((deployment: any) => {
          deployments.push({
            id: deployment.node.id,
            status: deployment.node.status,
            createdAt: deployment.node.createdAt,
            meta: deployment.node.meta,
            projectName,
            serviceName,
            environmentName: deployment.node.environment?.name || 'production',
          });
        });
      });
    }

    // Handle multiple projects response
    data?.data?.projects?.edges?.forEach((project: any) => {
      const projectName = project.node.name;
      project.node.services?.edges?.forEach((service: any) => {
        const serviceName = service.node.name;
        service.node.deployments?.edges?.forEach((deployment: any) => {
          deployments.push({
            id: deployment.node.id,
            status: deployment.node.status,
            createdAt: deployment.node.createdAt,
            meta: deployment.node.meta,
            projectName,
            serviceName,
            environmentName: deployment.node.environment?.name || 'production',
          });
        });
      });
    });

    console.log(`Railway: Found ${deployments.length} deployments`);
    return deployments.slice(0, 10);
  } catch (error) {
    console.error('Failed to fetch Railway deployments:', error);
    return [];
  }
}
