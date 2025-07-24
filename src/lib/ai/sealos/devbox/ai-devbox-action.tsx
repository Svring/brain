"use client";

import { useQuery, useQueryClient } from "@tanstack/react-query";
import {
  listDevboxOptions,
  getDevboxOptions,
} from "@/lib/sealos/devbox/devbox-method/devbox-query";
import { useDeleteDevboxMutation } from "@/lib/sealos/devbox/devbox-method/devbox-mutation";
import { useCopilotAction } from "@copilotkit/react-core";
import { createDevboxContext } from "@/lib/sealos/devbox/devbox-utils";
import {
  DevboxListCard,
  DevboxGetCard,
  DevboxDeleteCard,
} from "@/components/ai/action-cards/devbox-action-cards/index";
import { RenderActionWrapper, RenderAndWaitActionWrapper } from "@/components/ai/action-cards/action-wrapper";

export const listDevboxAction = () => {
  const context = createDevboxContext();
  const { data } = useQuery(listDevboxOptions(context));

  useCopilotAction({
    name: "listDevbox",
    description: "Get the list of devboxes",
    handler: async () => data,
    render: (props) => {
      return (
        <RenderActionWrapper
          title="List DevBoxes"
          status={props.status}
          args={props.args}
          result={props.result}
        >
          <DevboxListCard devboxList={props.result} />
        </RenderActionWrapper>
      );
    },
  });
};

export const getDevboxAction = () => {
  const context = createDevboxContext();
  const queryClient = useQueryClient();

  useCopilotAction({
    name: "getDevbox",
    description: "Get the devbox",
    parameters: [
      {
        name: "devboxName",
        type: "string",
        description:
          "The name of the devbox to get. Can be a single devbox name or array of devbox names.",
        required: true,
      },
    ],
    handler: async ({ devboxName }) => {
      return await queryClient.fetchQuery(
        getDevboxOptions(context, devboxName)
      );
    },
    render(props) {
      return (
        <RenderActionWrapper
          title="Get DevBox"
          status={props.status}
          args={props.args}
          result={props.result}
        >
          {props.result ? (
            (() => {
              const devboxData = JSON.parse(props.result);
              return <DevboxGetCard data={devboxData?.data} />;
            })()
          ) : (
            <></>
          )}
        </RenderActionWrapper>
      );
    },
  });
};

export const deleteDevboxAction = () => {
  const context = createDevboxContext();

  useCopilotAction({
    name: "deleteDevbox",
    description: "Delete the devbox",
    parameters: [
      {
        name: "devboxName",
        type: "string",
        description:
          "The name of the devbox to delete. Can be a single devbox name or array of devbox names.",
        required: true,
      },
    ],
    renderAndWaitForResponse(props) {
      const { status, args, respond, result } = props;

      // Ensure respond is defined
      const safeRespond = respond || (() => {});

      return (
        <RenderAndWaitActionWrapper
          title="Delete DevBox"
          status={status}
          args={args}
          respond={safeRespond}
          result={result}
        >
          {!args?.devboxName ? (
            <div className="flex flex-col gap-2 p-4">
              <p className="text-destructive">Error: Devbox name is required</p>
            </div>
          ) : (
            <DevboxDeleteCard
              status={status}
              args={args as { devboxName: string }}
              respond={safeRespond}
              result={result}
            />
          )}
        </RenderAndWaitActionWrapper>
      );
    },
  });
};

export const activateDevboxActions = () => {
  listDevboxAction();
  getDevboxAction();
  deleteDevboxAction();
};
