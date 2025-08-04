import { useLangGraphInterrupt } from "@copilotkit/react-core";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { AlertTriangle } from "lucide-react";

export const activateInterruptActions = () => {
  useLangGraphInterrupt({
    // enabled: ({ eventValue }) => eventValue.type === "approval",
    render: ({ event, resolve }) => (
      <ApproveComponent
        content={event.value.content}
        onAnswer={(answer) => resolve(answer.toString())}
      />
    ),
  });
};

const ApproveComponent = ({
  content,
  onAnswer,
}: {
  content: string;
  onAnswer: (approved: boolean) => void;
}) => (
  <Card className="w-full max-w-md mx-auto">
    <CardHeader>
      <div className="flex items-center gap-2">
        <AlertTriangle className="h-4 w-4" />
        <CardTitle className="text-base">Approval Required</CardTitle>
      </div>
    </CardHeader>
    <CardContent className="space-y-4">
      <div className="p-3 bg-muted rounded-md">
        <p className="text-sm whitespace-pre-wrap">{content}</p>
      </div>
      <div className="flex gap-2 justify-end">
        <Button variant="outline" onClick={() => onAnswer(false)}>
          Reject
        </Button>
        <Button onClick={() => onAnswer(true)}>
          Approve
        </Button>
      </div>
    </CardContent>
  </Card>
);
