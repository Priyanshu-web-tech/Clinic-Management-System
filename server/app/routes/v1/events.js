const router = require("express").Router();
const { verifyAuthToken } = require("../../middlewares/index");
const { addClient, removeClient } = require("../../utils/sseManager");

/**
 * @swagger
 * tags:
 *   name: Events
 *   description: Server-Sent Events for real-time live updates
 */

/**
 * @swagger
 * /v1/events:
 *   get:
 *     summary: Subscribe to live visit/prescription updates (SSE)
 *     tags: [Events]
 *     description: >
 *       Opens a persistent Server-Sent Events stream scoped to the authenticated
 *       user's hospital. The server pushes an event whenever a visit is created,
 *       its status changes, or a prescription is generated. Clients should
 *       invalidate their local cache on receipt and refetch as needed.
 *
 *
 *       **Event format**
 *
 *       ```
 *       data: {"type":"visits_updated"}
 *       ```
 *
 *
 *       A keep-alive comment (`: ping`) is sent every 30 seconds to prevent
 *       proxy timeouts. The connection is hospital-scoped — events are never
 *       broadcast across tenants.
 *     security:
 *       - cookieAuth: []
 *     responses:
 *       200:
 *         description: SSE stream established. Events are pushed as they occur.
 *         content:
 *           text/event-stream:
 *             schema:
 *               type: string
 *               example: "data: {\"type\":\"visits_updated\"}\n\n"
 *       400:
 *         description: Authenticated user has no associated hospital.
 *       401:
 *         description: Missing or invalid session token.
 */
router.get("/", verifyAuthToken, (req, res) => {
  const hospitalId = req.data?.hospital?._id;
  if (!hospitalId) {
    return res.status(400).end();
  }

  res.set({
    "Content-Type": "text/event-stream",
    "Cache-Control": "no-cache",
    "Connection": "keep-alive",
    "X-Accel-Buffering": "no",
  });
  res.flushHeaders();

  addClient(hospitalId, res);

  // Keep connection alive through proxies
  const heartbeat = setInterval(() => {
    res.write(": ping\n\n");
  }, 30000);

  req.on("close", () => {
    clearInterval(heartbeat);
    removeClient(hospitalId, res);
  });
});

module.exports = router;
