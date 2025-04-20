import { trpcReact } from '../pages/_app';

export const query = <TQueryKey extends keyof typeof trpcReact, TInput>(
    queryKey: TQueryKey,
    input?: TInput
) => {
    // @ts-expect-error useQuery gives an error here, this is fine
    const { data, isLoading, error } = trpcReact[queryKey].useQuery(input as any);
    return [data, isLoading, error];
};