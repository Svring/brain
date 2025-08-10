import { makeAssistantToolUI, makeAssistantTool } from "@assistant-ui/react";
import { useState } from "react";
import { z } from "zod";

export const RequestApprovalTool = makeAssistantTool({
  toolName: "requestApproval",
  description: "Request approval for an action",
  parameters: z.object({
    action: z.string(),
    details: z.any(),
  }),
  execute: async ({ action, details }) => {
    
  },
});

export const RequestApprovalToolUI = makeAssistantToolUI<
  { action: string; details: any },
  { approved: boolean; reason?: string }
>({
  toolName: "requestApproval",
  render: ({ args, result, addResult }) => {
    const [reason, setReason] = useState("");

    if (result) {
      return (
        <div className={result.approved ? "text-green-600" : "text-red-600"}>
          {result.approved ? "✅ Approved" : `❌ Rejected: ${result.reason}`}
        </div>
      );
    }

    return (
      <div className="rounded border-2 border-yellow-400 p-4">
        <h4 className="font-bold">Approval Required</h4>
        <p className="my-2">{args.action}</p>
        <pre className="rounded bg-gray-100 p-2 text-sm">
          {JSON.stringify(args.details, null, 2)}
        </pre>

        <div className="mt-4 flex gap-2">
          <button
            onClick={() => addResult({ approved: true })}
            className="rounded bg-green-500 px-4 py-2 text-white"
          >
            Approve
          </button>
          <button
            onClick={() => addResult({ approved: false, reason })}
            className="rounded bg-red-500 px-4 py-2 text-white"
          >
            Reject
          </button>
          <input
            type="text"
            placeholder="Rejection reason..."
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            className="flex-1 rounded border px-2"
          />
        </div>
      </div>
    );
  },
});
