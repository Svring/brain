import StepEdge from "./step-edge";
import TrafficEdge from "./traffic-edge";
import FloatingEdge from "./floating-edge";
import FloatingErrorEdge from "./floating-error-edge";

const edgeTypes = {
  step: StepEdge,
  traffic: TrafficEdge,
  floating: FloatingEdge,
  floatingError: FloatingErrorEdge,
};

export default edgeTypes;
