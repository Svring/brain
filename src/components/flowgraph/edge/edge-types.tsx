import StepEdge from "./step-edge";
import TrafficEdge from "./traffic-edge";
import FaultEdge from "./fault-edge";
import FloatingEdge from "./floating-edge";

const edgeTypes = {
  step: StepEdge,
  fault: FaultEdge,
  traffic: TrafficEdge,
  floating: FloatingEdge,
};

export default edgeTypes;
