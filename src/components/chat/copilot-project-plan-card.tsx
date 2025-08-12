import React from 'react';

// Type definitions matching the Python data structure
type Runtime = 
  | "C++" | "Nuxt3" | "Hugo" | "Java" | "Chi" | "PHP" | "Rocket" | "Quarkus"
  | "Debian" | "Ubuntu" | "Spring Boot" | "Flask" | "Nginx" | "Vue.js" | "Python"
  | "VitePress" | "Node.js" | "Echo" | "Next.js" | "Angular" | "React" | "Svelte"
  | "Gin" | "Rust" | "UmiJS" | "Docusaurus" | "Hexo" | "Vert.x" | "Go" | "C"
  | "Iris" | "Astro" | "MCP" | "Django" | "Express.js" | ".Net";

type DatabaseType = 
  | "postgresql" | "mongodb" | "apecloud-mysql" | "redis" | "kafka"
  | "weaviate" | "milvus" | "pulsar";

type BucketPolicy = "Private" | "PublicRead" | "PublicReadwrite";

interface DevBox {
  runtime: Runtime;
  description: string;
}

interface Database {
  type: DatabaseType;
  description: string;
}

interface ObjectStorageBucket {
  policy: BucketPolicy;
  description: string;
}

interface ProjectResources {
  devboxes: DevBox[];
  databases: Database[];
  buckets: ObjectStorageBucket[];
}

interface ProjectInfo {
  name?: string;
  description?: string;
  resources?: ProjectResources;
}

interface CopilotProjectPlanCardProps {
  projectInfo: ProjectInfo;
  className?: string;
}

const CopilotProjectPlanCard: React.FC<CopilotProjectPlanCardProps> = ({
  projectInfo,
  className = ""
}) => {
  const { name, description, resources } = projectInfo;



  return (
    <div className={`bg-white rounded-lg shadow-md border border-gray-200 overflow-hidden ${className}`}>
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-600 to-purple-600 px-6 py-4">
        <h2 className="text-xl font-bold text-white">
          {name || "Project Plan"}
        </h2>
        {description && (
          <p className="text-blue-100 mt-1 text-sm">
            {description}
          </p>
        )}
      </div>

      {/* Resources Section */}
      {resources && (
        <div className="p-6 space-y-6">
          {/* DevBoxes */}
          {resources.devboxes && resources.devboxes.length > 0 && (
            <div>
              <h3 className="text-lg font-semibold text-gray-800 mb-3">
                Development Environments
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                {resources.devboxes.map((devbox, index) => (
                  <div
                    key={index}
                    className="bg-gray-50 rounded-lg p-3 border border-gray-200 hover:border-blue-300 transition-colors"
                  >
                    <div className="font-medium text-gray-800 mb-2">{devbox.runtime}</div>
                    <p className="text-sm text-gray-600">{devbox.description}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Databases */}
          {resources.databases && resources.databases.length > 0 && (
            <div>
              <h3 className="text-lg font-semibold text-gray-800 mb-3">
                Databases
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                {resources.databases.map((db, index) => (
                  <div
                    key={index}
                    className="bg-gray-50 rounded-lg p-3 border border-gray-200 hover:border-green-300 transition-colors"
                  >
                    <div className="font-medium text-gray-800 mb-2 capitalize">{db.type}</div>
                    <p className="text-sm text-gray-600">{db.description}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Storage Buckets */}
          {resources.buckets && resources.buckets.length > 0 && (
            <div>
              <h3 className="text-lg font-semibold text-gray-800 mb-3">
                Storage Buckets
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                {resources.buckets.map((bucket, index) => (
                  <div
                    key={index}
                    className="bg-gray-50 rounded-lg p-3 border border-gray-200 hover:border-orange-300 transition-colors"
                  >
                    <div className="flex items-center justify-between mb-2">
                      <span className="font-medium text-gray-800">Bucket</span>
                      <span className="px-2 py-1 rounded-full text-xs font-medium border bg-gray-100 text-gray-800 border-gray-200">
                        {bucket.policy}
                      </span>
                    </div>
                    <p className="text-sm text-gray-600">{bucket.description}</p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Empty State */}
      {(!resources || 
        (!resources.devboxes?.length && !resources.databases?.length && !resources.buckets?.length)) && (
        <div className="p-6 text-center">
          <p className="text-gray-500 text-lg">No resources defined</p>
          <p className="text-gray-400 text-sm mt-1">Add development environments, databases, or storage buckets to get started</p>
        </div>
      )}
    </div>
  );
};

export default CopilotProjectPlanCard;
