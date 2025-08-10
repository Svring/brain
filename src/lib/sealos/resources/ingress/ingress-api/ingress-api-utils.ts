"use server";

import WebSocket from "ws";
import axios from "axios";
import grpc from "@grpc/grpc-js";
import { createParallelAction } from "next-server-actions-parallel";
import { ProtocolCheckResult } from "./ingress-api-schema";

/**
 * Check HTTPS availability for a given URL.
 */
export const checkHttps = createParallelAction(
  async (url: string): Promise<ProtocolCheckResult> => {
    const startTime = Date.now();
    try {
      const httpsUrl = url.startsWith("https://") ? url : `https://${url}`;
      const response = await axios.get(httpsUrl, {
        timeout: 5000,
        validateStatus: () => true,
      });

      const isAvailable = response.status < 500;
      return {
        protocol: "HTTPS",
        url: httpsUrl,
        available: isAvailable,
        responseTime: Date.now() - startTime,
        ...(isAvailable ? {} : { response: response.data }),
      };
    } catch (error) {
      return {
        protocol: "HTTPS",
        url: url.startsWith("https://") ? url : `https://${url}`,
        available: false,
        error: error instanceof Error ? error.message : "Unknown error",
        responseTime: Date.now() - startTime,
        response: error,
      };
    }
  }
);

/**
 * Check WSS (WebSocket Secure) availability for a given URL.
 */
export const checkWss = createParallelAction(
  async (url: string): Promise<ProtocolCheckResult> => {
    const startTime = Date.now();
    return new Promise((resolve) => {
      try {
        const wssUrl = url.startsWith("wss://") ? url : `wss://${url}`;
        const ws = new WebSocket(wssUrl);

        const timeout = setTimeout(() => {
          ws.terminate();
          resolve({
            protocol: "WSS",
            url: wssUrl,
            available: false,
            error: "Connection timeout",
            responseTime: Date.now() - startTime,
            response: { timeout: true },
          });
        }, 5000);

        ws.on("open", () => {
          clearTimeout(timeout);
          ws.close();
          resolve({
            protocol: "WSS",
            url: wssUrl,
            available: true,
            responseTime: Date.now() - startTime,
          });
        });

        ws.on("error", (error) => {
          clearTimeout(timeout);
          resolve({
            protocol: "WSS",
            url: wssUrl,
            available: false,
            error: error.message,
            responseTime: Date.now() - startTime,
            response: error,
          });
        });
      } catch (error) {
        resolve({
          protocol: "WSS",
          url: url.startsWith("wss://") ? url : `wss://${url}`,
          available: false,
          error: error instanceof Error ? error.message : "Unknown error",
          responseTime: Date.now() - startTime,
          response: error,
        });
      }
    });
  }
);

/**
 * Check gRPCS (gRPC Secure) availability for a given URL.
 */
export const checkGrpcs = createParallelAction(
  async (url: string): Promise<ProtocolCheckResult> => {
    const startTime = Date.now();
    return new Promise((resolve) => {
      try {
        const host = url.replace(/^grpcs:\/\//, "");
        const [hostname, port = "443"] = host.split(":");

        const client = new grpc.Client(
          `${hostname}:${port}`,
          grpc.credentials.createSsl()
        );

        const deadline = new Date();
        deadline.setSeconds(deadline.getSeconds() + 5);

        client.waitForReady(deadline, (error) => {
          client.close();

          if (error) {
            resolve({
              protocol: "gRPCS",
              url: `grpcs://${hostname}:${port}`,
              available: false,
              error: error.message,
              responseTime: Date.now() - startTime,
              response: error,
            });
          } else {
            resolve({
              protocol: "gRPCS",
              url: `grpcs://${hostname}:${port}`,
              available: true,
              responseTime: Date.now() - startTime,
            });
          }
        });
      } catch (error) {
        resolve({
          protocol: "gRPCS",
          url: url.startsWith("grpcs://") ? url : `grpcs://${url}`,
          available: false,
          error: error instanceof Error ? error.message : "Unknown error",
          responseTime: Date.now() - startTime,
          response: error,
        });
      }
    });
  }
);
