import StepEdge from "./step-edge";
import TrafficEdge from "./traffic-edge";
import FaultEdge from "./fault-edge";
import FloatingEdge from "./floating-edge";
import { SmartBezierEdge } from "@tisoap/react-flow-smart-edge";
import { SmartEdgeWithButtonLabel } from "./smart-edge";

const edgeTypes = {
  step: StepEdge,
  fault: FaultEdge,
  traffic: TrafficEdge,
  floating: FloatingEdge,
  smart: SmartEdgeWithButtonLabel,
};

export default edgeTypes;
