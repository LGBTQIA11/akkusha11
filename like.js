/*
  Akkusha Like button helper.
  Add a work card with:
    <div class="work" data-work-id="unique-id">
      <h2>Work title</h2>
      <button class="like-button" type="button" aria-label="Bəyən">👍</button>
    </div>

  The visitor sees only 👍. The count is never returned to the visitor.
*/
(function () {
  function getUserId() {
    let id = localStorage.getItem("akkusha_user_id");
    if (!id) {
      id = (crypto.randomUUID ? crypto.randomUUID() : "u-" + Date.now() + "-" + Math.random().toString(36).slice(2));
      localStorage.setItem("akkusha_user_id", id);
    }
    return id;
  }

  function bindLikeButtons(root) {
    (root || document).querySelectorAll(".like-button").forEach((button) => {
      if (button.dataset.likeBound === "1") return;
      button.dataset.likeBound = "1";

      button.addEventListener("click", async () => {
        const work = button.closest("[data-work-id]");
        if (!work) return;

        const workId = work.dataset.workId;
        button.disabled = true;

        try {
          const response = await fetch("/api/like", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              workId,
              userId: getUserId()
            })
          });

          const result = await response.json();

          if (result.success || result.alreadyLiked) {
            button.classList.add("liked");
            button.setAttribute("aria-pressed", "true");
          } else {
            button.disabled = false;
          }
        } catch (error) {
          button.disabled = false;
        }
      });
    });
  }

  window.AkkushaLikes = { bind: bindLikeButtons };
  document.addEventListener("DOMContentLoaded", () => bindLikeButtons());
})();
