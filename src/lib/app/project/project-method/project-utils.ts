import { customAlphabet } from "nanoid";

export const inferProjectConnections = () => {};

export const generateNewProjectName = () => {
  const nanoid = customAlphabet("0123456789abcdefghijklmnopqrstuvwxyz", 7);
  return `project-${nanoid()}`;
};

export const generateProjectTemplate = (
  projectName: string,
  namespace: string
) => {
  return `apiVersion: app.sealos.io/v1
kind: Instance
metadata:
  name: ${projectName}
  namespace: ${namespace}
spec:
  templateType: inline
  defaults:
    app_name:
      type: string
      value: ${projectName}
  title: ${projectName}`;
};
