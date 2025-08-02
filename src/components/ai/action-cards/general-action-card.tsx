"use client";

import React from "react";
import ReactJson from "react-json-view";

// Simple GeneralActionCard component
export function GeneralActionCard<T = any>({
  props,
  data,
  action,
  actionName,
}: {
  props: any;
  data?: any;
  action?: any;
  actionName: string;
}) {
  const handleConfirm = () => {
    // Handle confirm action
    props.respond?.(data);
  };

  const handleCancel = () => {
    // Handle cancel action
    props.respond?.("action cancalled.");
  };

  console.log("props", props);
  console.log("data", data);
  console.log("action", action);
  console.log("actionName", actionName);

  return (
    <div className="border rounded-lg p-4 bg-white shadow-sm">
      {/* Header with action name and buttons */}
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-lg font-semibold text-gray-800">{actionName}</h3>
        <div className="flex gap-2">
          <button
            onClick={handleCancel}
            className="px-3 py-1 text-sm border border-gray-300 rounded hover:bg-gray-50 transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleConfirm}
            className="px-3 py-1 text-sm bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors"
          >
            Confirm
          </button>
        </div>
      </div>

      {/* Body with parameters */}
      <div className="space-y-3">
        <div className="bg-gray-50 p-3 rounded">
          <div className="text-sm font-medium text-gray-600 mb-1">Status:</div>
          <div className="text-gray-800">{props.status}</div>
        </div>

        <div className="bg-gray-50 p-3 rounded">
          <div className="text-sm font-medium text-gray-600 mb-1">
            Arguments:
          </div>
          <ReactJson
            src={props.args || {}}
            theme="rjv-default"
            displayDataTypes={false}
            displayObjectSize={false}
            enableClipboard={false}
            collapsed={false}
            name={false}
          />
        </div>

        {/* {props.result && (
          <div className="bg-gray-50 p-3 rounded">
            <div className="text-sm font-medium text-gray-600 mb-1">
              Result:
            </div>
            <ReactJson
              src={props.result}
              theme="rjv-default"
              displayDataTypes={false}
              displayObjectSize={false}
              enableClipboard={false}
              collapsed={false}
              name={false}
            />
          </div>
        )} */}
      </div>
    </div>
  );
}
