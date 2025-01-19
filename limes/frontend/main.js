const setup = () => {
    window.addEventListener("pointerdown", (e) => {
        if (e.target == element.canvas) pointer.down(e);
    });
    window.addEventListener("pointermove", (e) => {
        if (e.target == element.canvas) pointer.move(e);
    });
    window.addEventListener("pointerup", (e) => {
        pointer.up(e);
    });

    window.addEventListener("keypress", (e) => {
        switch (e.code) {
            case "KeyS":
                boring.select_tool(toolbar.tools.find(e => e.type == "selector") || { type: "selector" });
                break;
            case "KeyD":
            case "KeyE":
                boring.select_tool(toolbar.tools.find(e => e.type == "eraser") || { type: "eraser", rad: 0 });
                break;
            case "KeyM":
                boring.select_tool(toolbar.tools.find(e => e.type == "monoline") || { type: "monoline", rad: 10, color: "white", smoothness: 3 });
                break;
        }
    });

    boring.fill_grid();
}
setup();
