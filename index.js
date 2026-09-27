export default {
  async fetch(request, env) {
    const url = new URL(request.url);

    // Persistent Like API.
    // Visitors never receive the like count.
    if (url.pathname === "/api/like" && request.method === "POST") {
      try {
        const body = await request.json();
        const workId = String(body.workId || "").trim();
        const userId = String(body.userId || "").trim();

        if (!workId || !userId || workId.length > 200 || userId.length > 200) {
          return Response.json({ error: "Missing or invalid data" }, { status: 400 });
        }

        const work = await env.DB
          .prepare("SELECT id FROM works WHERE id = ?")
          .bind(workId)
          .first();

        if (!work) {
          return Response.json({ error: "Work not found" }, { status: 404 });
        }

        const existing = await env.DB
          .prepare("SELECT 1 FROM user_likes WHERE work_id = ? AND user_id = ?")
          .bind(workId, userId)
          .first();

        if (existing) {
          return Response.json({ success: false, alreadyLiked: true });
        }

        await env.DB.batch([
          env.DB
            .prepare("INSERT INTO user_likes (work_id, user_id) VALUES (?, ?)")
            .bind(workId, userId),
          env.DB
            .prepare("UPDATE works SET like_count = like_count + 1 WHERE id = ?")
            .bind(workId)
        ]);

        return Response.json({ success: true });
      } catch (error) {
        return Response.json({ error: "Server error" }, { status: 500 });
      }
    }

    // Owner-only count endpoint. Set ADMIN_TOKEN as a Worker secret.
    if (url.pathname === "/api/admin/likes" && request.method === "GET") {
      const supplied = request.headers.get("X-Admin-Token") || "";
      if (!env.ADMIN_TOKEN || supplied !== env.ADMIN_TOKEN) {
        return Response.json({ error: "Unauthorized" }, { status: 401 });
      }

      const rows = await env.DB
        .prepare("SELECT id, title, like_count FROM works ORDER BY title COLLATE NOCASE")
        .all();

      return Response.json({
        works: rows.results || []
      });
    }

    // All normal website requests are served from public/.
    return env.ASSETS.fetch(request);
  }
};
