import { ListData } from 'typing/shared';

export async function createVideoList(body: ListData) {
  const res = await fetch('http://localhost:8080/api/video-list', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Accept: 'application/json',
    },
    body: JSON.stringify(body),
  });

  if (!res.ok) {
    const error = await res.json();
    console.error(error);

    throw Error(error);
  }

  return await res.json();
}

export async function deleteVideoList({ listId }: { listId: string }) {
  const res = await fetch(`http://localhost:8080/api/video-list/${listId}`, {
    method: 'DELETE',
    headers: {
      'Content-Type': 'application/json',
      Accept: 'application/json',
    },
  });

  if (!res.ok) {
    const error = await res.json();
    console.error(error);

    throw Error(error);
  }

  return await res.json();
}
