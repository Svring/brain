import React from "react";
import { DevboxListCard, DevboxCard } from "./devbox-action-cards";

interface ActionCardProps {
  data: any;
  actionName: string;
}

type ActionCardRenderer = (props: ActionCardProps) => React.ReactElement;

const cardTypes: Record<string, ActionCardRenderer> = {
  listDevbox: ({ data }: ActionCardProps) =>
    React.createElement(DevboxListCard, data),
  getDevbox: ({ data }: ActionCardProps) =>
    React.createElement(DevboxCard, data),
};

export default cardTypes;
