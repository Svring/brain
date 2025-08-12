import { useCoAgent, useCoAgentStateRender } from "@copilotkit/react-core";
import {
  LanggraphAgentAiState,
  LanggraphAgentNewProjectState,
} from "@/contexts/langgraph/langgraph-machine";

export function useLanggraphAgentAi() {
  const agent = useCoAgent<LanggraphAgentAiState>({
    name: "ai",
    initialState: {
      base_url: "",
      api_key: "",
      model: "",
    },
  });

  return agent;
}

export function useLanggraphAgentNewProject() {
  const agent = useCoAgent<LanggraphAgentNewProjectState>({
    name: "new_project",
    initialState: {
      base_url: "",
      api_key: "",
      model: "",
      project: undefined,
      project_brief: "",
    },
  });

  useCoAgentStateRender<LanggraphAgentNewProjectState>({
    name: "new_project",
    render: ({ status, state }) => {
      // Only render if both project_brief and project are present
      if (!state.project_brief || !state.project) {
        return null;
      }

      return (
        <div className="border-2 border-gray-600 rounded-lg p-6 m-4 bg-background-primary shadow-lg">
          <div className="space-y-4">
            {/* Project Brief Section */}
            <div className="border-l-4 border-blue-400 pl-4">
              <h3 className="text-lg font-semibold text-gray-100 mb-2">
                Project Brief
              </h3>
              <p className="text-gray-300 leading-relaxed">
                {state.project_brief}
              </p>
            </div>

            {/* Project Information Section */}
            <div className="border border-gray-700 rounded-md p-4 bg-gray-800">
              <h3 className="text-lg font-semibold text-gray-100 mb-3">
                Project Information
              </h3>
              
              {/* Project Name */}
              {state.project.name && (
                <div className="mb-2">
                  <span className="font-medium text-gray-300">Name: </span>
                  <span className="text-gray-200">{state.project.name}</span>
                </div>
              )}

              {/* Project Description */}
              {state.project.description && (
                <div className="mb-3">
                  <span className="font-medium text-gray-300">Description: </span>
                  <span className="text-gray-200">{state.project.description}</span>
                </div>
              )}

              {/* Project Resources */}
              {state.project.resources && (
                <div className="space-y-3">
                  <h4 className="font-medium text-gray-100">Resources:</h4>
                  
                  {/* DevBoxes */}
                  {state.project.resources.devboxes && state.project.resources.devboxes.length > 0 && (
                    <div className="ml-4">
                      <span className="font-medium text-sm text-blue-400">DevBoxes ({state.project.resources.devboxes.length}):</span>
                      <ul className="list-disc list-inside ml-4 text-sm text-gray-300">
                        {state.project.resources.devboxes.map((devbox, index) => (
                          <li key={index} className="mb-2">
                            <div className="flex flex-col space-y-1">
                              {devbox.runtime && (
                                <span className="text-blue-300 font-medium">Runtime: {devbox.runtime}</span>
                              )}
                              {devbox.description && (
                                <span className="text-gray-400 text-xs ml-4">{devbox.description}</span>
                              )}
                            </div>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {/* Databases */}
                  {state.project.resources.databases && state.project.resources.databases.length > 0 && (
                    <div className="ml-4">
                      <span className="font-medium text-sm text-green-400">Databases ({state.project.resources.databases.length}):</span>
                      <ul className="list-disc list-inside ml-4 text-sm text-gray-300">
                        {state.project.resources.databases.map((database, index) => (
                          <li key={index} className="mb-2">
                            <div className="flex flex-col space-y-1">
                              {database.type && (
                                <span className="text-green-300 font-medium">Type: {database.type}</span>
                              )}
                              {database.description && (
                                <span className="text-gray-400 text-xs ml-4">{database.description}</span>
                              )}
                            </div>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {/* Buckets */}
                  {state.project.resources.buckets && state.project.resources.buckets.length > 0 && (
                    <div className="ml-4">
                      <span className="font-medium text-sm text-purple-400">Storage Buckets ({state.project.resources.buckets.length}):</span>
                      <ul className="list-disc list-inside ml-4 text-sm text-gray-300">
                        {state.project.resources.buckets.map((bucket, index) => (
                          <li key={index} className="mb-2">
                            <div className="flex flex-col space-y-1">
                              {bucket.policy && (
                                <span className="text-purple-300 font-medium">Policy: {bucket.policy}</span>
                              )}
                              {bucket.description && (
                                <span className="text-gray-400 text-xs ml-4">{bucket.description}</span>
                              )}
                            </div>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Observed Steps (if any) */}
            {state.observed_steps && state.observed_steps.length > 0 && (
              <div className="border border-gray-700 rounded-md p-3 bg-yellow-900/20">
                <h4 className="font-medium text-gray-100 mb-2">Observed Steps:</h4>
                <div className="text-sm text-gray-300">
                  {state.observed_steps.join(", ")}
                </div>
              </div>
            )}

            {/* Create Button */}
            <div className="flex justify-center pt-4">
              <button
                className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition-colors duration-200 shadow-md hover:shadow-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 focus:ring-offset-gray-900"
                onClick={() => {
                  console.log("Create button clicked");
                  // Add your create logic here
                }}
              >
                Create
              </button>
            </div>
          </div>
        </div>
      );
    },
  });

  return agent;
}
