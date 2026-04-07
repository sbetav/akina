import { type QueryKey, useQueryClient } from "@tanstack/react-query";
import { useEffect, useState } from "react";

function useHasPendingQueries(queryKey: QueryKey) {
  const queryClient = useQueryClient();
  const [hasPending, setHasPending] = useState(false);

  useEffect(() => {
    return queryClient.getQueryCache().subscribe(() => {
      setTimeout(() => {
        setHasPending(
          queryClient
            .getQueryCache()
            .findAll({ queryKey })
            .some((q) => q.state.status === "pending"),
        );
      }, 0);
    });
  }, [queryClient, queryKey]);

  return hasPending;
}

export default useHasPendingQueries;
