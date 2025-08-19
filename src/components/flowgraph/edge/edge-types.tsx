import StepEdge from "./step-edge";
import TrafficEdge from "./traffic-edge";
import FloatingEdge from "./floating-edge";

const edgeTypes = {
  step: StepEdge,
  traffic: TrafficEdge,
  floating: FloatingEdge,
};

export default edgeTypes;
