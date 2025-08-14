import React from "react";

interface DevboxInfoMessageProps {
  payload: any;
}

export const DevboxInfoMessageCard: React.FC<DevboxInfoMessageProps> = ({
  payload,
}) => {
  return (
    <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg">
      {/* <p className="text-blue-800">{target.name}</p> */}
    </div>
  );
};

export default DevboxInfoMessageCard;
