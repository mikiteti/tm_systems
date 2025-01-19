const constant = {
    grid_columns: 10, // maximal stroke width: 125
};
const current  = {
    tool: {
        type: "monoline",
        rad: 10,
        color: "white",
        smoothness: 3,
    },
    stroke_count: 0,
    iterations: [],
    page_height: 1000,
}, strokes = [], grid = [];

const toolbar = {
    tools: [
        {
            type: "monoline",
            rad: 10,
            color: "white",
            smoothness: 3,
        },
        {
            type: "eraser",
            rad: 0,
        },
        {
            type: "selector",
        },
    ]
}

class Stroke {
    create_element () {
        if (this.element) return -1;

        const e = document.createElementNS('http://www.w3.org/2000/svg', 'path');
        this.element = e;

        if (this.tool.type == "monoline") {
            e.setAttributeNS(null, "stroke", this.tool.color);
            e.setAttributeNS(null, "stroke-width", this.tool.rad);
            e.setAttributeNS(null, "fill", "none");
            e.setAttributeNS(null, "stroke-linecap", "round");
        }

        this.d = `M ${this.nodes[0][0]}, ${this.nodes[0][1]} h 0`;
        e.setAttributeNS(null, "d", this.d);

        element.canvas.appendChild(e);
    }

    create_last_node(pos) {
        let index = current.iterations[0].length;

        for (let d = 0; d <= Math.min(this.tool.smoothness, this.nodes.length); d++) {
            current.iterations[d][index-d] = boring.calculate_iteration_value(index-d, d);
        }
    
        index = current.iterations[0].length;
        let new_coord = undefined;
        if (this.nodes.length <= this.tool.smoothness) {
            if (index % 2 == 1) new_coord = current.iterations[(index-1) / 2][(index-1) / 2];
        } else {
            new_coord = current.iterations.at(-1).at(-1);
            for (const i of current.iterations) i.shift();
        }

        if (!new_coord) return;
        pos = new_coord;
    
        // if (Math.hypot(pos[0] - this.nodes.at(-1)[0], pos[1] - this.nodes.at(-1)[1]) < 3) return;

        this.nodes.push(JSON.parse(JSON.stringify(pos)));
        boring.check_min_max_and_grid(this);
       
        if (this.nodes.length == 2) return;

        const relative_pos = [this.nodes.at(-3)[0] - pos[0], this.nodes.at(-3)[1] - pos[1]];
        if (this.nodes.length > 3) { // id there are enough nodes, continue a Catmull-Rom spline
            this.d += ` S ${ this.nodes.at(-1)[0] + relative_pos[0] / 6 }, ${ this.nodes.at(-1)[1] + relative_pos[1] / 6 } ${this.nodes.at(-1)[0]}, ${this.nodes.at(-1)[1]}`;
        } else if (this.nodes.lengh == 3) { // if there are enough nodes, initialize a Catmull-Rom spline
            this.d = this.d.split("h")[0] + ` C ${ this.nodes.at(-1)[0] + relative_pos[0] / 6 }, ${ this.nodes.at(-1)[1] + relative_pos[1] / 6 } ${ this.nodes.at(-1)[0] + relative_pos[0] / 6 }, ${ this.nodes.at(-1)[1] + relative_pos[1] / 6 } ${this.nodes.at(-1)[0]}, ${this.nodes.at(-1)[1]}`
        }

        this.element.setAttributeNS(null, "d", this.d);
    }

    delete () {
        this.element.remove();
        for (const cell of this.grid_cells) cell.splice(cell.indexOf(this), 1);

        delete this;
    }

    constructor (tool, nodes) {
        strokes.push(this);

        this.index = current.stroke_count;
        current.stroke_count++;
        this.tool = tool;
        this.nodes = nodes;

        this.min = {x: nodes[0][0] - tool.rad, y: nodes[0][0] - tool.rad};
        this.max = {x: nodes[0][0] + tool.rad, y: nodes[0][0] + tool.rad};
        this.grid_cells = [];
        boring.check_min_max_and_grid(this); // only works for currently drawn strokes

        current.iterations = [];
        for (let i = 0; i <= tool.smoothness; i++) current.iterations.push([]);
        current.iterations[0].push(this.nodes[0]);

        current.stroke = this;

        this.create_element();
    }
}

const pointer = {
    pointers: {},

    down(e) {
        if (!pointer.active) return;

        down.initialize_globals(e);

        switch (current.tool.type) {
            case "monoline": 
                down.create_stroke(e);
                break;
            case "eraser":
                boring.object_erase();
                break;
        }
    },

    move(e) {
        if (pointer.pointers[e.pointerId] == undefined) return;

        move.initialize_globals(e);

        switch (current.tool.type) {
            case "monoline": 
                move.continue_stroke();
                break;
            case "eraser":
                boring.object_erase();
                break;
        }
    },

    up(e) {
        up.initialize_globals(e);

        switch (current.tool.type) {
            case "monoline":
                boring.check_page_height();
                boring.fill_grid();
                break;
            case "eraser":
                break;
        }
    },

    get pen() { return Object.values(this.pointers).find(p => p.type == "pen") },

    get mouse() { return Object.values(this.pointers).find(p => p.type == "mouse") },
 
    get active() { return this.pen || this.mouse || (current.draw_with_finger) ? Object.values(this.pointers)[0] : undefined },
}

const down = {
    initialize_globals(e) {
        const {pointerId, pointerType} = e;
        pointer.pointers[pointerId] = {
            pos: boring.get_coordinates(e),
            type: pointerType,
            prev_pos: boring.get_coordinates(e),
        }
    },

    create_stroke(e) {
        new Stroke(JSON.parse(JSON.stringify(current.tool)), JSON.parse(JSON.stringify([pointer.active.pos])));
    }
}


const move = {
    initialize_globals(e) {
        const { pointerId, pointerType } = e;
        if (pointer.pointers[pointerId] == undefined) return;

        const current_pointer = pointer.pointers[pointerId];
        current_pointer.prev_pos = [...current_pointer.pos];
        current_pointer.pos = boring.get_coordinates(e);
    },

    continue_stroke() {
        current.stroke.create_last_node(pointer.active.pos);
    }
}

const up = {
    initialize_globals(e) {
        delete pointer.pointers[e.pointerId];
    },

}
