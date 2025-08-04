"use client";

export type KindMap = Record<string, string[]>;

export interface Connection {
  connectFrom: KindMap;
  external?: Record<string, KindMap>;
}

export type ResourceConnections = Record<string, Record<string, Connection>>;
