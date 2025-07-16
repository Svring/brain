"use client";

import _ from "lodash";
import { SessionV1 } from "@zjy365/sealos-desktop-sdk/app";
import {
  getCurrentNamespace,
  getRegionUrlFromKubeconfig,
} from "@/lib/k8s/k8s-api/k8s-api-utils";
import type { Auth } from "@/contexts/auth-context";

export function parseAuthFromStorage(
  sealosBrainAuth: string,
  setSealosBrainAuth: (v: string) => void
): Auth | null {
  if (!_.isString(sealosBrainAuth) || _.isEmpty(sealosBrainAuth)) return null;
  const parsedAuth = _.attempt(() => JSON.parse(sealosBrainAuth) as Auth);
  if (_.isError(parsedAuth)) {
    setSealosBrainAuth("");
    return null;
  }
  return parsedAuth;
}

export async function extractAuthFromSession(
  session: SessionV1
): Promise<Auth | null> {
  if (!_.has(session, "kubeconfig") || !_.has(session, "token")) return null;
  const [namespace, regionUrl] = await Promise.all([
    getCurrentNamespace(session.kubeconfig),
    getRegionUrlFromKubeconfig(session.kubeconfig),
  ]);
  return _.every([namespace, regionUrl], _.isString)
    ? {
        namespace: namespace!,
        kubeconfig: encodeURIComponent(session.kubeconfig),
        regionUrl: regionUrl!,
        appToken: _.isString(session.token) ? session.token : "",
        baseUrl: "",
        apiKey: "",
      }
    : null;
}
