import { exec } from "child_process";
import { promisify } from "util";

const execAsync = promisify(exec);

// Protocol types
export type Protocol = "http" | "https" | "grpc" | "ws" | "wss" | "tcp" | "udp";

// URL parsing result
export interface ParsedUrl {
  protocol: Protocol;
  host: string;
  port: number;
  originalUrl: string;
}

// Check result
export interface PortCheckResult {
  url: string;
  protocol: Protocol;
  host: string;
  port: number;
  isOpen: boolean;
  isProtocolValid: boolean;
  responseTime?: number;
  error?: string;
  details?: any;
}

// Protocol check result type
interface ProtocolCheckResult {
  isOpen: boolean;
  responseTime?: number;
  details?: any;
  error?: string;
}

// Parse URL to extract protocol, host, and port
export function parseUrl(url: string): ParsedUrl {
  // Handle custom protocols like grpc://, ws://, tcp://, udp://
  const protocolMatch = url.match(/^([a-zA-Z]+):\/\/(.+)$/);
  if (!protocolMatch) {
    throw new Error(`Invalid URL format: ${url}`);
  }

  const protocol = protocolMatch[1] as Protocol;
  const hostPort = protocolMatch[2];

  // Handle host:port format
  const hostPortMatch = hostPort.match(/^([^:]+):(\d+)$/);
  if (!hostPortMatch) {
    throw new Error(`Invalid host:port format: ${hostPort}`);
  }

  const host = hostPortMatch[1];
  const port = parseInt(hostPortMatch[2], 10);

  if (isNaN(port) || port < 1 || port > 65535) {
    throw new Error(`Invalid port number: ${port}`);
  }

  return {
    protocol,
    host,
    port,
    originalUrl: url,
  };
}

// Basic TCP port check using netcat or telnet
async function checkTcpPort(host: string, port: number): Promise<boolean> {
  try {
    // Try using netcat first (more reliable)
    try {
      const { stdout } = await execAsync(`nc -z -w3 ${host} ${port}`);
      return stdout.trim() === "";
    } catch {
      // Fallback to telnet if netcat is not available
      try {
        const { stdout } = await execAsync(`timeout 3 telnet ${host} ${port}`);
        return (
          stdout.includes("Connected") || stdout.includes("Escape character")
        );
      } catch {
        // If both fail, try a simple connection test
        return await checkTcpPortSimple(host, port);
      }
    }
  } catch (error) {
    console.error("TCP check error:", error);
    return false;
  }
}

// Simple TCP port check using Node.js net module
async function checkTcpPortSimple(
  host: string,
  port: number
): Promise<boolean> {
  return new Promise((resolve) => {
    const net = require("net");
    const socket = new net.Socket();

    socket.setTimeout(3000);

    socket.on("connect", () => {
      socket.destroy();
      resolve(true);
    });

    socket.on("timeout", () => {
      socket.destroy();
      resolve(false);
    });

    socket.on("error", () => {
      socket.destroy();
      resolve(false);
    });

    socket.connect(port, host);
  });
}

// UDP port check (approximate - UDP is connectionless)
async function checkUdpPort(host: string, port: number): Promise<boolean> {
  try {
    // UDP check is more complex, using nmap if available
    try {
      const { stdout } = await execAsync(
        `nmap -sU -p ${port} ${host} | grep "open"`
      );
      return stdout.includes("open");
    } catch {
      // Fallback: try to send a UDP packet and see if we get any response
      return await checkUdpPortSimple(host, port);
    }
  } catch (error) {
    console.error("UDP check error:", error);
    return false;
  }
}

// Simple UDP check using Node.js dgram module
async function checkUdpPortSimple(
  host: string,
  port: number
): Promise<boolean> {
  return new Promise((resolve) => {
    const dgram = require("dgram");
    const socket = dgram.createSocket("udp4");

    socket.setTimeout(3000);

    // Send a simple probe packet
    const message = Buffer.from("ping");
    socket.send(message, port, host, (err: any) => {
      if (err) {
        socket.close();
        resolve(false);
        return;
      }

      // Wait for any response
      socket.on("message", () => {
        socket.close();
        resolve(true);
      });

      // Timeout if no response
      setTimeout(() => {
        socket.close();
        resolve(false);
      }, 3000);
    });
  });
}

// HTTP/HTTPS check
async function checkHttpPort(
  host: string,
  port: number,
  protocol: "http" | "https"
): Promise<ProtocolCheckResult> {
  return new Promise((resolve) => {
    const startTime = Date.now();
    const http = require("http");
    const https = require("https");

    const client = protocol === "https" ? https : http;
    const url = `${protocol}://${host}:${port}`;

    const req = client.get(url, { timeout: 5000 }, (res: any) => {
      const responseTime = Date.now() - startTime;
      resolve({
        isOpen: true,
        responseTime,
        details: {
          statusCode: res.statusCode,
          headers: res.headers,
        },
      });
    });

    req.on("error", (err: any) => {
      resolve({
        isOpen: false,
        error: err.message,
      });
    });

    req.on("timeout", () => {
      req.destroy();
      resolve({
        isOpen: false,
        error: "Request timeout",
      });
    });
  });
}

// WebSocket check
async function checkWebSocketPort(
  host: string,
  port: number,
  protocol: "ws" | "wss"
): Promise<ProtocolCheckResult> {
  return new Promise((resolve) => {
    const startTime = Date.now();

    // Try to import ws module dynamically
    let WebSocket: any;
    try {
      WebSocket = require("ws");
    } catch (error) {
      resolve({
        isOpen: false,
        error: "WebSocket module not available. Install with: npm install ws",
      });
      return;
    }

    const url = `${protocol}://${host}:${port}`;
    const ws = new WebSocket(url);

    ws.on("open", () => {
      const responseTime = Date.now() - startTime;
      ws.close();
      resolve({
        isOpen: true,
        responseTime,
        details: {
          protocol: ws.protocol,
          extensions: ws.extensions,
        },
      });
    });

    ws.on("error", (err: any) => {
      resolve({
        isOpen: false,
        error: err.message,
      });
    });

    // Timeout after 5 seconds
    setTimeout(() => {
      ws.terminate();
      resolve({
        isOpen: false,
        error: "Connection timeout",
      });
    }, 5000);
  });
}

// gRPC check
async function checkGrpcPort(
  host: string,
  port: number
): Promise<ProtocolCheckResult> {
  return new Promise((resolve) => {
    const startTime = Date.now();

    // Try to import gRPC modules dynamically
    let grpc: any, protoLoader: any;
    try {
      grpc = require("@grpc/grpc-js");
      protoLoader = require("@grpc/proto-loader");
    } catch (error) {
      resolve({
        isOpen: false,
        error:
          "gRPC modules not available. Install with: npm install @grpc/grpc-js @grpc/proto-loader",
      });
      return;
    }

    // For gRPC, we can only check if the port is open since we don't have the proto definition
    // We'll use a simple TCP check as fallback
    checkTcpPortSimple(host, port).then((isOpen: boolean) => {
      const responseTime = Date.now() - startTime;
      resolve({
        isOpen,
        responseTime,
        details: {
          note: "gRPC port check is limited without proto definition. Consider using TCP check instead.",
        },
      });
    });
  });
}

// Main port check function
export async function checkPort(url: string): Promise<PortCheckResult> {
  const startTime = Date.now();

  try {
    const parsed = parseUrl(url);

    // First check if the port is open at TCP level
    const isOpen = await checkTcpPort(parsed.host, parsed.port);

    if (!isOpen) {
      return {
        url,
        protocol: parsed.protocol,
        host: parsed.host,
        port: parsed.port,
        isOpen: false,
        isProtocolValid: false,
        error: "Port is not open",
      };
    }

    // Now check protocol-specific functionality
    let protocolCheck: ProtocolCheckResult;

    switch (parsed.protocol) {
      case "http":
      case "https":
        protocolCheck = await checkHttpPort(
          parsed.host,
          parsed.port,
          parsed.protocol
        );
        break;

      case "ws":
      case "wss":
        protocolCheck = await checkWebSocketPort(
          parsed.host,
          parsed.port,
          parsed.protocol
        );
        break;

      case "grpc":
        protocolCheck = await checkGrpcPort(parsed.host, parsed.port);
        break;

      case "tcp":
        protocolCheck = { isOpen: true, details: { note: "TCP port is open" } };
        break;

      case "udp":
        const udpCheck = await checkUdpPort(parsed.host, parsed.port);
        protocolCheck = {
          isOpen: udpCheck,
          details: {
            note: "UDP check is approximate due to connectionless nature",
          },
        };
        break;

      default:
        protocolCheck = {
          isOpen: false,
          error: `Unsupported protocol: ${parsed.protocol}`,
        };
    }

    const totalTime = Date.now() - startTime;

    return {
      url,
      protocol: parsed.protocol,
      host: parsed.host,
      port: parsed.port,
      isOpen: isOpen && protocolCheck.isOpen,
      isProtocolValid: protocolCheck.isOpen,
      responseTime: protocolCheck.responseTime || totalTime,
      error: protocolCheck.error,
      details: protocolCheck.details,
    };
  } catch (error) {
    return {
      url,
      protocol: "tcp" as Protocol, // fallback
      host: "unknown",
      port: 0,
      isOpen: false,
      isProtocolValid: false,
      error: error instanceof Error ? error.message : "Unknown error",
    };
  }
}

// Batch check multiple URLs
export async function checkMultiplePorts(
  urls: string[]
): Promise<PortCheckResult[]> {
  const results: PortCheckResult[] = [];

  for (const url of urls) {
    try {
      const result = await checkPort(url);
      results.push(result);
    } catch (error) {
      results.push({
        url,
        protocol: "tcp" as Protocol,
        host: "unknown",
        port: 0,
        isOpen: false,
        isProtocolValid: false,
        error: error instanceof Error ? error.message : "Unknown error",
      });
    }
  }

  return results;
}

// Utility function to check if a port is available for binding
export async function isPortAvailable(
  port: number,
  host: string = "localhost"
): Promise<boolean> {
  try {
    const net = require("net");
    return new Promise((resolve) => {
      const server = net.createServer();

      server.listen(port, host, () => {
        server.close();
        resolve(true);
      });

      server.on("error", () => {
        resolve(false);
      });
    });
  } catch (error) {
    return false;
  }
}

// Example usage and testing
export async function testPortChecker() {
  const testUrls = [
    "http://ai.ns-gapyo0ig.svc.cluster.local:81",
    "grpc://ai.ns-gapyo0ig.svc.cluster.local:82",
    "ws://ai.ns-gapyo0ig.svc.cluster.local:83",
    "tcp://ai-nodeport.ns-gapyo0ig.svc.cluster.local:8000",
    "udp://ai-nodeport.ns-gapyo0ig.svc.cluster.local:80",
  ];

  console.log("Testing port checker with sample URLs...");

  for (const url of testUrls) {
    console.log(`\nChecking: ${url}`);
    const result = await checkPort(url);
    console.log("Result:", JSON.stringify(result, null, 2));
  }
}

// Export default function for easy import
export default checkPort;
