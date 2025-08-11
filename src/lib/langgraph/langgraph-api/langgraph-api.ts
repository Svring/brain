import { Client, ThreadState } from "@langchain/langgraph-sdk";

const createClient = () => {
  const apiUrl = process.env["NEXT_PUBLIC_LANGGRAPH_DEPLOYMENT_URL"];
  return new Client({
    apiUrl,
  });
};

export const createThread = async () => {
  const client = createClient();
  return await client.threads.create();
};

export const listThreads = async () => {
  const client = createClient();
  return await client.threads.search({ limit: 10 });
};

export const getThread = async (threadId: string) => {
  const client = createClient();
  return await client.threads.get(threadId);
};
