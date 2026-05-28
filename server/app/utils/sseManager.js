// hospitalId (string) → Set<res>
const clients = new Map();

const addClient = (hospitalId, res) => {
  const id = hospitalId.toString();
  if (!clients.has(id)) clients.set(id, new Set());
  clients.get(id).add(res);
};

const removeClient = (hospitalId, res) => {
  const id = hospitalId.toString();
  const set = clients.get(id);
  if (!set) return;
  set.delete(res);
  if (set.size === 0) clients.delete(id);
};

const broadcastVisitUpdate = (hospitalId) => {
  if (!hospitalId) return;
  const id = hospitalId.toString();
  const set = clients.get(id);
  if (!set || set.size === 0) return;
  const payload = `data: ${JSON.stringify({ type: "visits_updated" })}\n\n`;
  set.forEach((res) => {
    try {
      res.write(payload);
    } catch (_) {
      // client already disconnected
    }
  });
};

module.exports = { addClient, removeClient, broadcastVisitUpdate };
