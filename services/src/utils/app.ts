export function setupPing(clients: any) {
  const interval = setInterval(() => {
    for (let client of clients.values()) {
      // terminate stalled clients
      if (client.isAlive === false || client.is_authenticated === false) {
        client.terminate();
      }

      // initiate ping
      client.isAlive = false;
      client.ping(() => {});
    }
  }, 5000);

  return interval;
}
