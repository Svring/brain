import StepEdge from "./step-edge";
import TrafficEdge from "./traffic-edge";
import FaultEdge from "./fault-edge";

const edgeTypes = {
  step: StepEdge,
  fault: FaultEdge,
  traffic: TrafficEdge,
};

export default edgeTypes;
