export function createInput(canvas) {
  const keys = {};
  const state = { left: false, right: false, jump: false, attack: false, attackPressed: false };

  const setKey = (e, down) => {
    const k = e.key;
    if (["ArrowLeft", "a", "A"].includes(k)) keys.left = down;
    if (["ArrowRight", "d", "D"].includes(k)) keys.right = down;
    if (["ArrowUp", "w", "W", " "].includes(k)) keys.jump = down;
    if (["z", "Z", "j", "J"].includes(k)) {
      if (down && !keys.attackHeld) state.attackPressed = true;
      keys.attackHeld = down;
      keys.attack = down;
    }
  };

  window.addEventListener("keydown", (e) => {
    if (["ArrowLeft", "ArrowRight", "ArrowUp", " ", "a", "d", "w", "z", "j"].includes(e.key)) e.preventDefault();
    setKey(e, true);
  });
  window.addEventListener("keyup", (e) => setKey(e, false));

  const touch = { left: false, right: false, jump: false, attack: false };

  document.querySelectorAll("[data-game-btn]").forEach((btn) => {
    const action = btn.dataset.gameBtn;
    const down = () => {
      touch[action] = true;
      if (action === "attack") state.attackPressed = true;
    };
    const up = () => (touch[action] = false);
    btn.addEventListener("mousedown", (e) => {
      e.preventDefault();
      down();
    });
    btn.addEventListener("mouseup", up);
    btn.addEventListener("mouseleave", up);
    btn.addEventListener("touchstart", (e) => {
      e.preventDefault();
      down();
    });
    btn.addEventListener("touchend", up);
  });

  canvas.addEventListener("click", () => canvas.focus());

  return {
    poll() {
      state.left = keys.left || touch.left;
      state.right = keys.right || touch.right;
      state.jump = keys.jump || touch.jump;
      state.attack = keys.attack || touch.attack;
      const ap = state.attackPressed;
      state.attackPressed = false;
      return { ...state, attackPressed: ap };
    },
  };
}
