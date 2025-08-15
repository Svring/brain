"use server";

import { NodeSSH } from "node-ssh";
import * as path from "path";
import type { DevboxSsh } from "../devbox-schemas/devbox-object-schema";

// Schema for tree data structure
export interface TreeNode {
  id: string;
  label: string;
  children?: TreeNode[];
}

export async function listFolderFiles(
  sshConfig: DevboxSsh,
  relativePath: string = ""
): Promise<TreeNode[]> {
  const ssh = new NodeSSH();

  try {
    await ssh.connect({
      host: sshConfig.host,
      port: sshConfig.port,
      username: sshConfig.user,
      privateKey: sshConfig.privateKey,
    });

    // Construct the full path by combining workingDir with relativePath
    const fullPath = path.join(sshConfig.workingDir, relativePath);

    // List files and directories in the specified path
    const result = await ssh.execCommand("ls -la", { cwd: fullPath });

    if (result.stderr) {
      throw new Error(`SSH command error: ${result.stderr}`);
    }

    // Parse the ls -la output to extract file information
    const lines = result.stdout.split("\n").filter((line) => line.trim());
    const treeNodes: TreeNode[] = [];

    for (const line of lines) {
      const parts = line.split(/\s+/);
      if (parts.length >= 9) {
        const permissions = parts[0];
        const name = parts.slice(8).join(" ");

        // Skip . and .. entries
        if (name === "." || name === "..") continue;

        const isDirectory = permissions.startsWith("d");
        const nodeId = path
          .join(relativePath, name)
          .replace(/[^a-zA-Z0-9-_]/g, "_");

        const treeNode: TreeNode = {
          id: nodeId,
          label: name,
        };

        // If it's a directory, we could potentially add children
        // For now, we'll just mark it as having potential children
        if (isDirectory) {
          treeNode.children = [];
        }

        treeNodes.push(treeNode);
      }
    }

    return treeNodes;
  } catch (error) {
    console.error("Error listing folder files:", error);
    throw error;
  } finally {
    ssh.dispose();
  }
}

/**
 * Recursively builds a complete tree structure by fetching children for directories
 */
export async function buildCompleteTree(
  sshConfig: DevboxSsh,
  maxDepth: number = 3
): Promise<TreeNode[]> {
  const rootNodes = await listFolderFiles(sshConfig, "");

  // Recursively populate children for directories
  for (const node of rootNodes) {
    if (node.children && maxDepth > 0) {
      await populateChildren(sshConfig, node, "", maxDepth - 1);
    }
  }

  return rootNodes;
}

async function populateChildren(
  sshConfig: DevboxSsh,
  parentNode: TreeNode,
  parentPath: string,
  remainingDepth: number
): Promise<void> {
  if (remainingDepth <= 0 || !parentNode.children) return;

  const fullPath = path.join(parentPath, parentNode.label);
  const children = await listFolderFiles(sshConfig, fullPath);

  // Update the parent node's children
  parentNode.children = children;

  // Recursively populate children for subdirectories
  for (const child of children) {
    if (child.children && remainingDepth > 1) {
      await populateChildren(sshConfig, child, fullPath, remainingDepth - 1);
    }
  }
}
