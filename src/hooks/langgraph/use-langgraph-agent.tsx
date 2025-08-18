import { useCoAgent, useCoAgentStateRender } from "@copilotkit/react-core";
import { BrainState } from "@/contexts/langgraph/langgraph-schema";
import ProjectPlanCard from "@/components/chat/state-cards/project-plan-card";

export function useLanggraphAgent() {
  const agent = useCoAgent<BrainState>({
    name: "brain",
    initialState: {
      // base_url: "",
      // api_key: "",
      // model: "",
      stage: "project",
      // project_proposal: {
      //   name: "",
      //   description: "",
      //   resources: {
      //     devboxes: [],
      //     databases: [],
      //     buckets: [],
      //   },
      // },
      // resource_context: null,
      // project_context: {},
    },
  });

  useCoAgentStateRender<BrainState>({
    name: "brain",
    render: ({ state }) => {
      // Only render when we have a project proposal and we're in project stage
      if (!state.project_proposal || state.stage !== "project") {
        return null;
      }

      console.log("state.project_proposal", state.project_proposal);

      return (
        <div className="h-96">
          <ProjectPlanCard
            title="AI Project Planning"
            projectData={state.project_proposal}
          />
        </div>
      );
    },
  });

  return agent;
}
