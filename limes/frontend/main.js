const setup = () => {
    window.addEventListener("pointerdown", (e) => {
        if (e.target == element.canvas) pointer.down(e);
    });
    window.addEventListener("pointermove", (e) => {
        if (e.target == element.canvas) pointer.move(e);
    });
    window.addEventListener("pointerup", (e) => {
        if (e.target == element.canvas) pointer.up(e);
    });
}
setup();
