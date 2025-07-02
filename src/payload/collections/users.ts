import type { CollectionConfig } from "payload";

export const Users: CollectionConfig = {
  slug: "users",
  admin: {
    useAsTitle: "email",
  },
  auth: true,
  fields: [
    {
      name: "context",
      type: "text",
    },
    {
      name: "regionUrl",
      type: "text",
    },
    {
      name: "kubeconfig",
      type: "text",
      required: true,
    },
    {
      name: "regionToken",
      type: "text",
    },
    {
      name: "appToken",
      type: "text",
    },
    {
      name: "devboxToken",
      type: "text",
    },
  ],
};
