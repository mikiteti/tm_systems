const element = {
    canvas: document.querySelector("svg"),
}

const ui = {
    adjust_canvas_height (height) {
        element.canvas.setAttribute("viewBox", `0 0 1000 ${height}`);
    },
}
