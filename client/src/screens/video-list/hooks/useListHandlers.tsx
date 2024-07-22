import { useMutation, useQuery } from '@tanstack/react-query';
import { queryClient } from 'App';
import { getVideoList, updateVideoList } from 'services';
import { UpdateVideoListBody, UpdateVideoListData } from 'typing/services';

export default function useListHandlers({
  listId,
}: {
  listId: string | undefined;
}) {
  const listQuery = useQuery({
    queryKey: [listId],
    queryFn: () => getVideoList({ id: listId || '' }),
    enabled: Boolean(listId),
  });

  const updateMutation = useMutation({
    mutationFn: updateVideoList,
    onSuccess: (updatedList) => {
      console.log('updatedList: ', updatedList);
      queryClient.setQueryData([listId], updatedList);
    },
    onError: () => {},
  });

  function handleUpdateList(body: UpdateVideoListBody) {
    if (!listId) return;

    const payload: UpdateVideoListData = {
      body,
      id: listId,
    };

    updateMutation.mutate(payload);
  }

  const { data: list, isPending } = listQuery;

  return {
    list,
    isPending: isPending,
    handleUpdateList,
  };
}
