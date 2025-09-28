// Tool name constants for different categories

// First five tools from tool-result-message-types (deployment tools)
export const DEPLOY_PROJECT_TOOLS = [
  "search_app_store",
  "search_docker_hub",
  // "search_web",
  "propose_template_deployment",
  "propose_devenv_deployment",
  "propose_image_deployment",
];

// Create/delete tools for the three resource types
export const MANAGE_PROJECT_TOOLS = [
  "create_devbox",
  "delete_devbox",
  "create_cluster",
  "delete_cluster",
  "create_launchpad",
  "delete_launchpad",
];

// Devbox management tools (excluding create/delete)
export const MANAGE_DEVBOX_TOOLS = [
  "get_devbox",
  "get_devbox_monitor",
  "get_devbox_network",
  "update_devbox",
  "create_devbox_ports",
  "delete_devbox_ports",
  "start_devbox",
  "pause_devbox",
  "get_devbox_release",
  "deploy_devbox_release",
];

// Cluster management tools (excluding create/delete)
export const MANAGE_CLUSTER_TOOLS = [
  "get_cluster",
  "get_cluster_logs",
  "get_cluster_monitor",
  "update_cluster",
  "start_cluster",
  "pause_cluster",
];

// Launchpad management tools (excluding create/delete)
export const MANAGE_LAUNCHPAD_TOOLS = [
  "get_launchpad",
  "get_launchpad_logs",
  "get_launchpad_monitor",
  "get_launchpad_network",
  "update_launchpad",
  "create_launchpad_ports",
  "delete_launchpad_ports",
  "create_launchpad_env",
  "delete_launchpad_env",
  "update_launchpad_env",
  "update_launchpad_image",
  "update_launchpad_command",
  "start_launchpad",
  "pause_launchpad",
];

// Map for mapping string names to tool arrays
export const TOOL_CATEGORY_MAP = {
  deploy_project: DEPLOY_PROJECT_TOOLS,
  manage_project: MANAGE_PROJECT_TOOLS,
  manage_devbox: MANAGE_DEVBOX_TOOLS,
  manage_cluster: MANAGE_CLUSTER_TOOLS,
  manage_launchpad: MANAGE_LAUNCHPAD_TOOLS,
} as const;

// Type for tool category keys
export type ToolCategoryKey = keyof typeof TOOL_CATEGORY_MAP;
