import type { CollectionConfig } from "payload";

export const Users: CollectionConfig = {
  slug: "users",
  admin: {
    useAsTitle: "username",
  },
  auth: {
    loginWithUsername: true,
  },
  fields: [
    {
      name: "namespace",
      type: "text",
      required: true,
    },
    {
      name: "regionUrl",
      type: "text",
      required: true,
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
      required: true,
    },
    {
      name: "devboxToken",
      type: "text",
    },
    {
      name: "apiKey",
      type: "text",
      required: true,
    },
    {
      name: "baseUrl",
      type: "text",
      required: true,
    },
  ],
};
