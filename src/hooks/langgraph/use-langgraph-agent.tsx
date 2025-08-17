import { useCoAgent, useCoAgentStateRender } from "@copilotkit/react-core";
import { LanggraphAgentState } from "@/contexts/langgraph/langgraph-schema";
import ProjectPlanCard from "@/components/chat/state-cards/project-plan-card";

export function useLanggraphAgent() {
  const agent = useCoAgent<LanggraphAgentState>({
    name: "sealos_brain",
    initialState: {
      base_url: "",
      api_key: "",
      model: "",
      project_context: {},
      project_plan: {
        name: "",
        description: "",
        resources: {
          devboxes: [],
          databases: [],
          buckets: [],
        },
        status: "pending",
      },
    },
  });

  useCoAgentStateRender<LanggraphAgentState>({
    name: "sealos_brain",
    render: ({ status, state }) => {
      if (!state.project_plan || state.project_plan.status === "pending") {
        return null;
      }

      console.log("state.project_plan", state.project_plan);

      return (
        <div className="h-96">
          <ProjectPlanCard
            title="AI Project Planning"
            projectData={state.project_plan}
            projectStatus={state.project_plan.status}
          />
        </div>
      );
    },
  });

  return agent;
}
