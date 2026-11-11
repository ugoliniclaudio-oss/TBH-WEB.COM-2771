import { useQuery } from "@tanstack/react-query";
import { orpc } from "../lib/api";

/** Feed della HOME: live DM, breaking news, partner, conteggi. */
export function useHomeFeed() {
  return useQuery(orpc.home.feed.queryOptions());
}
