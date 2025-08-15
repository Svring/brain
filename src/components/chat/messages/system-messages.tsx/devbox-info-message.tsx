import React from "react";
import { DevboxObject } from "@/lib/sealos/resources/devbox/devbox-schemas/devbox-object-schema";

interface DevboxInfoMessageProps {
  payload: DevboxObject;
}

export const DevboxInfoMessageCard: React.FC<DevboxInfoMessageProps> = ({
  payload,
}) => {
  return (
    <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg space-y-4">
      {/* Header */}
      <div className="flex items-center gap-3">
        <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
        <h3 className="font-semibold text-blue-900 text-lg">{payload.name}</h3>
        <span className={`px-2 py-1 rounded-full text-xs font-medium ${
          payload.status === 'Running' ? 'bg-green-100 text-green-800' :
          payload.status === 'Stopped' ? 'bg-red-100 text-red-800' :
          payload.status === 'Creating' ? 'bg-yellow-100 text-yellow-800' :
          'bg-gray-100 text-gray-800'
        }`}>
          {payload.status}
        </span>
      </div>

      {/* Basic Info */}
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <p className="text-sm text-blue-700">
            <span className="font-medium">Kind:</span> {payload.kind}
          </p>
          <p className="text-sm text-blue-700">
            <span className="font-medium">Image:</span> {payload.image}
          </p>
        </div>
        <div className="space-y-2">
          <p className="text-sm text-blue-700">
            <span className="font-medium">CPU:</span> {payload.resources.cpu}
          </p>
          <p className="text-sm text-blue-700">
            <span className="font-medium">Memory:</span> {payload.resources.memory}
          </p>
        </div>
      </div>

      {/* SSH Connection Info */}
      {payload.ssh && (
        <div className="bg-blue-100 p-3 rounded-md">
          <h4 className="font-medium text-blue-800 mb-2">SSH Connection</h4>
          <div className="grid grid-cols-2 gap-2 text-sm text-blue-700">
            <p><span className="font-medium">Host:</span> {payload.ssh.host}</p>
            <p><span className="font-medium">Port:</span> {payload.ssh.port}</p>
            <p><span className="font-medium">User:</span> {payload.ssh.user}</p>
            <p><span className="font-medium">Working Dir:</span> {payload.ssh.workingDir}</p>
          </div>
          {payload.ssh.privateKey && (
            <p className="text-xs text-blue-600 mt-2">
              <span className="font-medium">Private Key:</span> Available
            </p>
          )}
        </div>
      )}

      {/* Ports */}
      {payload.ports && payload.ports.length > 0 && (
        <div className="bg-blue-100 p-3 rounded-md">
          <h4 className="font-medium text-blue-800 mb-2">Ports ({payload.ports.length})</h4>
          <div className="space-y-2">
            {payload.ports.map((port, index) => (
              <div key={index} className="bg-white p-2 rounded border border-blue-200">
                <div className="grid grid-cols-2 gap-2 text-sm text-blue-700">
                  <p><span className="font-medium">Port:</span> {port.number}</p>
                  {port.name && <p><span className="font-medium">Name:</span> {port.name}</p>}
                  {port.protocol && <p><span className="font-medium">Protocol:</span> {port.protocol}</p>}
                  {port.serviceName && <p><span className="font-medium">Service:</span> {port.serviceName}</p>}
                </div>
                {port.privateAddress && (
                  <p className="text-xs text-blue-600 mt-1">
                    <span className="font-medium">Private:</span> {port.privateAddress}
                  </p>
                )}
                {port.publicAddress && (
                  <p className="text-xs text-green-600 mt-1">
                    <span className="font-medium">Public:</span> {port.publicAddress}
                  </p>
                )}
                {port.host && (
                  <p className="text-xs text-purple-600 mt-1">
                    <span className="font-medium">Host:</span> {port.host}
                  </p>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Pods */}
      {payload.pods && payload.pods.length > 0 && (
        <div className="bg-blue-100 p-3 rounded-md">
          <h4 className="font-medium text-blue-800 mb-2">Pods ({payload.pods.length})</h4>
          <div className="space-y-2">
            {payload.pods.map((pod, index) => (
              <div key={index} className="bg-white p-2 rounded border border-blue-200">
                <div className="flex items-center justify-between">
                  <p className="text-sm text-blue-700">
                    <span className="font-medium">Name:</span> {pod.name}
                  </p>
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                    pod.status === 'Running' ? 'bg-green-100 text-green-800' :
                    pod.status === 'Pending' ? 'bg-yellow-100 text-yellow-800' :
                    pod.status === 'Failed' ? 'bg-red-100 text-red-800' :
                    'bg-gray-100 text-gray-800'
                  }`}>
                    {pod.status}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default DevboxInfoMessageCard;
