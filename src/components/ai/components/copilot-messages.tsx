import { MessagesProps } from "@copilotkit/react-ui";

export function CopilotMessages({
  messages,
  inProgress,
  RenderTextMessage,
  RenderActionExecutionMessage,
  RenderResultMessage,
  RenderAgentStateMessage,
}: MessagesProps) {
  /*
    Message types handled:
    - TextMessage: Regular chat messages
    - ActionExecutionMessage: When the LLM executes an action
    - ResultMessage: Results from actions
    - AgentStateMessage: Status updates from CoAgents
  */

  return (
    <div className="p-4 flex flex-col gap-2 h-full overflow-y-auto bg-background">
      {messages.map((message, index) => {
        if (message.isTextMessage()) {
          return (
            <RenderTextMessage
              key={message.id}
              message={message}
              inProgress={inProgress}
              index={index}
              isCurrentMessage={index === messages.length - 1}
            />
          );
        } else if (message.isActionExecutionMessage()) {
          return (
            <RenderActionExecutionMessage
              key={message.id}
              message={message}
              inProgress={inProgress}
              index={index}
              isCurrentMessage={index === messages.length - 1}
            />
          );
        } else if (message.isResultMessage()) {
          return (
            <RenderResultMessage
              key={message.id}
              message={message}
              inProgress={inProgress}
              index={index}
              isCurrentMessage={index === messages.length - 1}
            />
          );
        } else if (message.isAgentStateMessage()) {
          return (
            <RenderAgentStateMessage
              key={message.id}
              message={message}
              inProgress={inProgress}
              index={index}
              isCurrentMessage={index === messages.length - 1}
            />
          );
        }
      })}
    </div>
  );
}
