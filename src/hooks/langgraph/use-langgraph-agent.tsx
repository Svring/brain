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
      project_brief: {
        briefs: [""],
        status: "pending",
      },
    },
  });

  useCoAgentStateRender<LanggraphAgentState>({
    name: "sealos_brain",
    render: ({ status, state }) => {
      const hasAnyData = state.project_brief || state.project_plan;

      if (!hasAnyData || state.project_brief?.status === "pending") {
        return null;
      }

      return (
        <div className="h-96 m-4">
          <ProjectPlanCard
            title="AI Project Planning"
            analyzingStatus={state.project_brief?.status}
            proposingStatus={state.project_plan?.status}
            analyzingData={state.project_brief}
            proposingData={state.project_plan}
          />
        </div>
      );
    },
  });

  return agent;
}
