import { useQuery, useMutation } from "@tanstack/react-query";
import { orpc } from "../lib/api";

export function useProducts(category?: string) {
  return useQuery(orpc.catalog.products.queryOptions({ input: { category } }));
}

export function useProduct(slug: string) {
  return useQuery(orpc.catalog.product.queryOptions({ input: { slug } }));
}

export function useCompanies() {
  return useQuery(orpc.catalog.companies.queryOptions());
}

export function useTeams() {
  return useQuery(orpc.catalog.teams.queryOptions());
}

export function useCheckoutStatus() {
  return useQuery(orpc.checkout.status.queryOptions());
}

export function useCreateCheckout() {
  return useMutation(orpc.checkout.create.mutationOptions());
}
