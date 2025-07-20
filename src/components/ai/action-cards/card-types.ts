import React from "react";
import { DevboxListCard } from "./devbox-cards";

interface ActionCardProps {
  data: any;
  actionName: string;
}

type ActionCardRenderer = (props: ActionCardProps) => React.ReactElement;

const cardTypes: Record<string, ActionCardRenderer> = {
  listDevbox: ({ data }: ActionCardProps) =>
    React.createElement(DevboxListCard, { devboxList: data }),
};

export default cardTypes;
