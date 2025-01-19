const boring = {
    dist (p1, p2) {
        return Math.hypot(p1[0] - p2[0], p1[1] - p2[1]);
    },

    log_response(res) {
        if (res.error) {
            console.log({error: res.error});
            ui.message(res.error.name, "error");
            delete res.error;
            return "error";
        }
        if (res.success) {
            console.log({success: res.success});
            delete res.success;
        }
    },

    get_coordinates(e) {
        return [1000 / window.innerWidth * e.offsetX, 1000 / window.innerWidth * e.offsetY];
    },

    calculate_iteration_value (x, y) {
        if (y == 0) return pointer.active.pos;
        const csi = current.iterations;
        return [
            (csi[y-1][Math.max(x-1,0)][0] + csi[y-1][x][0] + csi[y-1][x+1][0]) / 3,
            (csi[y-1][Math.max(x-1,0)][1] + csi[y-1][x][1] + csi[y-1][x+1][1]) / 3
        ];
    },

    is_point_in_stroke (stroke, point) {
        if (stroke.nodes.length == 1) return (boring.dist(point, stroke.nodes[0]) < stroke.tool.rad); // as long as the tool always starts with its original width

        switch (stroke.tool.type) {
            case "monoline":
                let p1 = stroke.nodes[0];
                for (let i = 1; i < stroke.nodes.length; i++) {
                    let p2 = stroke.nodes[i];
                    let dist = Math.abs((p2[1] - p1[1]) * point[0] - (p2[0] - p1[0]) * point[1] + p2[0] * p1[1] - p2[1] * p1[0]) / Math.sqrt((p2[1] - p1[1]) ** 2 + (p2[0] - p1[0]) ** 2);
                    dist = Math.max(dist, Math.min(boring.dist(p1, point), boring.dist(p2, point)));
                    p1 = p2;
                    if (dist < stroke.tool.rad) return true;
                }
                return false;
                break;
        }
    },

    check_min_max_and_grid (stroke) { // adjusts the min, max and grid_cells properties of the given stroke based on its last node
        switch (stroke.tool.type) {
            case "monoline":
                const node = stroke.nodes.at(-1);
                stroke.min.x = Math.min(stroke.min.x, node[0] - stroke.tool.rad);
                stroke.min.y = Math.min(stroke.min.y, node[1] - stroke.tool.rad);
                stroke.max.x = Math.max(stroke.max.x, node[0] + stroke.tool.rad);
                stroke.max.y = Math.max(stroke.max.y, node[1] + stroke.tool.rad);

                const grid_cell = boring.get_grid_cell_at(node);
                if (!stroke.grid_cells.includes(grid_cell)) {
                    stroke.grid_cells.push(grid_cell);
                    grid_cell.push(stroke);
                }
                break;
        }
    },

    fill_grid () { // fills up the grid with empty rows until it convers the page
        while ((grid.length - 1) / constant.grid_columns <= current.page_height / 1000) {
            const row = [];
            for (let i = 0; i < constant.grid_columns; i++) row.push([]);
            grid.push(row);
        }
    },

    get_grid_cell_at (point) {
        let x_coord = parseInt(point[0] / 1000 * (constant.grid_columns - 2) + 1);
        x_coord = Math.max(Math.min(x_coord, constant.grid_columns - 1), 0);

        let y_coord = parseInt(point[1] / 1000 * (constant.grid_columns - 2) + 1);
        y_coord = Math.max(y_coord, 0);

        return grid[y_coord][x_coord];
    },

    check_page_height () { // checks if expanding page height was made necessary by the stroke just drawn
        if (current.stroke.max.y > current.page_height - 1000) current.page_height += 1000;
        ui.adjust_canvas_height(current.page_height);
    },

    select_tool (tool) {
        console.log("tool selected: ", tool);
        current.tool = JSON.parse(JSON.stringify(tool));
    },

    object_erase () {
        const pos = pointer.active.pos;
        const close_strokes = boring.get_grid_cell_at(pos);
        console.log("possibly deleted strokes: ", close_strokes);

        for (const stroke of close_strokes) {
            if (boring.is_point_in_stroke(stroke, pos)) stroke.delete();
        }
    },

    get_first_arc (stroke) {
        const rad = stroke.tool.rad;
        const p1 = stroke.nodes[0], p2 = stroke.nodes[1];
        const angle = Math.atan2(p2[1] - p1[1], p2[0] - p1[0]);
        const dx = rad * Math.cos(angle);
        const dy = rad * Math.sin(angle);

        let d = ` A ${rad}, ${rad}, 0, 0, 1, ${p1[0]+dy}, ${p1[1]-dx}`;
        return ` L ${p1[0] - dy}, ${p1[1] + dx}` + d;
    },

    get_last_arc (stroke) {
        const rad = stroke.tool.rad;
        const p1 = stroke.nodes.at(-2), p2 = stroke.nodes.at(-1);
        const angle = Math.atan2(p2[1] - p1[1], p2[0] - p1[0]);
        const dx = rad * Math.cos(angle);
        const dy = rad * Math.sin(angle);

        let d1 = ` M ${p2[0] - dy}, ${p2[1] + dx}`;
        let d2 = ` L ${p2[0] + dy}, ${p2[1] - dx} A${rad}, ${rad}, 0, 0, 1, ${p2[0] - dy}, ${p2[1] + dx} Z`;

        return [d1, d2];
    },
}
