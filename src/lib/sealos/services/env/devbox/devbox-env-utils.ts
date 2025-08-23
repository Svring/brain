"use server";

import { NodeSSH } from "node-ssh";
import { SSHConfig } from "@/lib/sealos/resources/devbox/devbox-schemas/devbox-object-query-schema";

export interface EnvVarValue {
  type: "value";
  key: string;
  value: string;
}

export async function establishSSHConnection(
  host: string,
  port: number,
  username: string,
  privateKey: string
): Promise<NodeSSH> {
  const ssh = new NodeSSH();

  try {
    await ssh.connect({
      host,
      port,
      username,
      privateKey,
    });

    return ssh;
  } catch (error) {
    ssh.dispose();
    throw new Error(
      `Failed to establish SSH connection: ${
        error instanceof Error ? error.message : "Unknown error"
      }`
    );
  }
}

export async function getOrCreateEnvFile(
  sshConfig: SSHConfig
): Promise<EnvVarValue[]> {
  if (
    !sshConfig.host ||
    !sshConfig.user ||
    !sshConfig.workingDir ||
    !sshConfig.privateKey
  ) {
    throw new Error("Missing required SSH configuration parameters");
  }

  const ssh = await establishSSHConnection(
    sshConfig.host,
    sshConfig.port || 22,
    sshConfig.user,
    sshConfig.privateKey
  );

  try {
    // Check if .env file exists in working directory
    const checkResult = await ssh.execCommand("test -f .env", {
      cwd: sshConfig.workingDir,
    });

    if (checkResult.code !== 0) {
      // .env file does not exist, create empty .env file
      await ssh.execCommand("touch .env", { cwd: sshConfig.workingDir });
      return [];
    }

    // .env file exists, read and parse its content
    const readResult = await ssh.execCommand("cat .env", {
      cwd: sshConfig.workingDir,
    });

    if (readResult.stderr) {
      throw new Error(`Failed to read .env file: ${readResult.stderr}`);
    }

    const envContent = readResult.stdout;
    if (!envContent.trim()) {
      return [];
    }

    // Parse .env content and convert to EnvVarValue format
    const envVars: EnvVarValue[] = [];
    const lines = envContent.split("\n");

    for (const line of lines) {
      const trimmedLine = line.trim();

      // Skip empty lines and comments
      if (!trimmedLine || trimmedLine.startsWith("#")) {
        continue;
      }

      // Parse key=value format
      const equalIndex = trimmedLine.indexOf("=");
      if (equalIndex > 0) {
        const key = trimmedLine.substring(0, equalIndex).trim();
        const value = trimmedLine.substring(equalIndex + 1).trim();

        // Remove quotes if present
        const cleanValue = value.replace(/^["']|["']$/g, "");

        envVars.push({
          type: "value",
          key,
          value: cleanValue,
        });
      }
    }

    return envVars;
  } finally {
    ssh.dispose();
  }
}

export async function upsertEnvVar(
  sshConfig: SSHConfig,
  key: string,
  value: string
): Promise<void> {
  if (
    !sshConfig.host ||
    !sshConfig.user ||
    !sshConfig.workingDir ||
    !sshConfig.privateKey
  ) {
    throw new Error("Missing required SSH configuration parameters");
  }

  const ssh = await establishSSHConnection(
    sshConfig.host,
    sshConfig.port || 22,
    sshConfig.user,
    sshConfig.privateKey
  );

  try {
    // Check if .env file exists, create if not
    const checkResult = await ssh.execCommand("test -f .env", {
      cwd: sshConfig.workingDir,
    });

    if (checkResult.code !== 0) {
      await ssh.execCommand("touch .env", { cwd: sshConfig.workingDir });
    }

    // Read current .env content
    const readResult = await ssh.execCommand("cat .env", {
      cwd: sshConfig.workingDir,
    });

    if (readResult.stderr && readResult.stderr.trim()) {
      throw new Error(`Failed to read .env file: ${readResult.stderr}`);
    }

    const envContent = readResult.stdout || "";
    const lines = envContent.split("\n");
    const updatedLines: string[] = [];
    let keyFound = false;

    // Process existing lines
    for (const line of lines) {
      const trimmedLine = line.trim();

      // Skip empty lines and comments
      if (!trimmedLine || trimmedLine.startsWith("#")) {
        updatedLines.push(line);
        continue;
      }

      // Check if this line contains the key we want to update
      const equalIndex = trimmedLine.indexOf("=");
      if (equalIndex > 0) {
        const currentKey = trimmedLine.substring(0, equalIndex).trim();

        if (currentKey === key) {
          // Update the existing key
          updatedLines.push(`${key}=${value}`);
          keyFound = true;
        } else {
          // Keep other keys unchanged
          updatedLines.push(line);
        }
      } else {
        // Keep malformed lines unchanged
        updatedLines.push(line);
      }
    }

    // Add the key if it wasn't found
    if (!keyFound) {
      updatedLines.push(`${key}=${value}`);
    }

    // Write the updated content back to .env file
    const newContent = updatedLines.join("\n");
    const writeResult = await ssh.execCommand(
      `echo '${newContent.replace(/'/g, "'\"'\"'")}' > .env`,
      {
        cwd: sshConfig.workingDir,
      }
    );

    if (writeResult.stderr && writeResult.stderr.trim()) {
      throw new Error(`Failed to write .env file: ${writeResult.stderr}`);
    }
  } finally {
    ssh.dispose();
  }
}

export async function deleteEnvVar(
  sshConfig: SSHConfig,
  key: string
): Promise<void> {
  if (
    !sshConfig.host ||
    !sshConfig.user ||
    !sshConfig.workingDir ||
    !sshConfig.privateKey
  ) {
    throw new Error("Missing required SSH configuration parameters");
  }

  const ssh = await establishSSHConnection(
    sshConfig.host,
    sshConfig.port || 22,
    sshConfig.user,
    sshConfig.privateKey
  );

  try {
    // Check if .env file exists
    const checkResult = await ssh.execCommand("test -f .env", {
      cwd: sshConfig.workingDir,
    });

    if (checkResult.code !== 0) {
      // .env file doesn't exist, nothing to delete
      return;
    }

    // Read current .env content
    const readResult = await ssh.execCommand("cat .env", {
      cwd: sshConfig.workingDir,
    });

    if (readResult.stderr && readResult.stderr.trim()) {
      throw new Error(`Failed to read .env file: ${readResult.stderr}`);
    }

    const envContent = readResult.stdout || "";
    const lines = envContent.split("\n");
    const updatedLines: string[] = [];

    // Process lines and exclude the key to delete
    for (const line of lines) {
      const trimmedLine = line.trim();

      // Skip empty lines and comments
      if (!trimmedLine || trimmedLine.startsWith("#")) {
        updatedLines.push(line);
        continue;
      }

      // Check if this line contains the key we want to delete
      const equalIndex = trimmedLine.indexOf("=");
      if (equalIndex > 0) {
        const currentKey = trimmedLine.substring(0, equalIndex).trim();

        if (currentKey !== key) {
          // Keep lines that don't match the key to delete
          updatedLines.push(line);
        }
        // Skip lines that match the key to delete
      } else {
        // Keep malformed lines unchanged
        updatedLines.push(line);
      }
    }

    // Write the updated content back to .env file
    const newContent = updatedLines.join("\n");
    const writeResult = await ssh.execCommand(
      `echo '${newContent.replace(/'/g, "'\"'\"'")}' > .env`,
      {
        cwd: sshConfig.workingDir,
      }
    );

    if (writeResult.stderr && writeResult.stderr.trim()) {
      throw new Error(`Failed to write .env file: ${writeResult.stderr}`);
    }
  } finally {
    ssh.dispose();
  }
}
