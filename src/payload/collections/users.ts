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
      name: "namespace",
      type: "text",
      required: true,
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
    {
      name: "apiKey",
      type: "text",
    },
    {
      name: "baseUrl",
      type: "text",
    },
  ],
};
