import React from "react";
import {
  // DevboxListCard,
  DevboxGetCard,
  DevboxDeleteCard,
} from "./devbox-action-cards";

interface ActionCardProps {
  data: any;
  actionName: string;
}

type ActionCardRenderer = (props: ActionCardProps) => React.ReactElement;

const cardTypes: Record<string, ActionCardRenderer> = {
  // listDevbox: ({ data }: ActionCardProps) =>
  //   React.createElement(DevboxListCard, data),
  getDevbox: ({ data }: ActionCardProps) =>
    React.createElement(DevboxGetCard, data),
  deleteDevbox: ({ data }: ActionCardProps) =>
    React.createElement(DevboxDeleteCard, data),
};

export default cardTypes;
