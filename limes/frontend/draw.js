const constant = {
    grid_columns: 10, // maximal stroke width: 125
    minimal_stroke_radius: 1,
};
const toolbar = {
    tools: [
        {
            type: "monoline",
            rad: 5,
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
};
const current  = {
    tool: toolbar.tools.find(e => e.color),
    stroke_count: 0,
    iterations: [],
    page_height: 1000,
}, strokes = [], grid = [];


class Stroke {
    create_element () {
        if (this.element) return -1;

        const e = document.createElementNS('http://www.w3.org/2000/svg', 'path');
        this.element = e;

        if (this.tool.type == "monoline") {
            e.setAttributeNS(null, "stroke", this.tool.color);
            e.setAttributeNS(null, "stroke-width", this.tool.rad);
            e.setAttributeNS(null, "fill", this.tool.color);
            e.setAttributeNS(null, "stroke-linecap", "round");
        }

        this.d = `M ${this.nodes[0][0]}, ${this.nodes[0][1]} h 0`;
        e.setAttributeNS(null, "d", this.d);

        element.canvas.appendChild(e);
    }

    draw_last_node() {
        const pos = this.nodes.at(-1);

        // drawing straight line between two first points if there is no third
        if (this.nodes.length == 2) {
            this.element.setAttributeNS(null, "stroke", "none");
            //this.element.setAttributeNS(null, "stroke-width", "1");
            //this.element.setAttributeNS(null, "fill", "none");
            this.d = boring.get_first_arc(this);
            const last_arc = boring.get_last_arc(this);
            this.element.setAttributeNS(null, "d", last_arc[0] + this.d + last_arc[1]);
            return;
        }

        // adding last possible wraps
        (() => {
            const p = this.nodes.at(-3), c = this.nodes.at(-2), n = this.nodes.at(-1); // previous, current, next...
            const pn = [n[0] - p[0], n[1] - p[1]]; // vector from p to n...
            const len = Math.hypot(...pn); // getting length of pn
            pn[0] /= len; // normalizing pn
            pn[1] /= len; // also normalizing pn
            const rad = this.tool.rad;
            const dx = rad * pn[0];
            const dy = rad * pn[1];

            this.wraps.push([
                [c[0] - dy, c[1] + dx],
                [c[0] + dy, c[1] - dx]
            ]);

            // perpendicular helper lines -- just for testing
            // element.canvas.innerHTML += `<line x1="${this.wraps.at(-1)[0][0]}" y1="${this.wraps.at(-1)[0][1]}" x2="${this.wraps.at(-1)[1][0]}" y2="${this.wraps.at(-1)[1][1]}" stroke="red"/>`;
            // element.canvas.innerHTML += `
            // <circle cx="${this.wraps.at(-1)[0][0]}" cy="${this.wraps.at(-1)[0][1]}" r="1" fill="green">
            // `
        })();

        // connecting last possible wraps
        const connect = (side) => {
            const [p, c, n] = side ? [this.wraps.at(-3)[1], this.wraps.at(-2)[1], this.wraps.at(-1)[1]] : [this.wraps.at(-1)[0], this.wraps.at(-2)[0], this.wraps.at(-3)[0]];
            const pn = [n[0] - p[0], n[1] - p[1]];
            if (this.wraps.length == 3) { // if there are enough wraps, begin a spline
                return ` C ${c[0] - pn[0] / 6}, ${c[1] - pn[1] / 6} ${c[0] - pn[0] / 6}, ${c[1] - pn[1] / 6} ${c[0]}, ${c[1]}`;
            } else { // if there are enough wraps, continue the spline
                return ` S ${c[0] - pn[0] / 6}, ${c[1] - pn[1] / 6} ${c[0]}, ${c[1]}`;
            }
        }
        if (this.wraps.length >= 3) {
            this.d = connect(0) + this.d;
            this.d += connect(1);
        }

        const last_arc = boring.get_last_arc(this);
        this.element.setAttributeNS(null, "d", last_arc[0] + this.d + last_arc[1]);
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
    
        this.nodes.push(JSON.parse(JSON.stringify(pos)));
        boring.check_min_max_and_grid(this);
       
        this.draw_last_node();
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
        this.wraps = [];

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
        down.initialize_globals(e);

        if (pointer.active) {
            switch (current.tool.type) {
                case "monoline": 
                    down.create_stroke(e);
                    break;
                case "eraser":
                    boring.object_erase();
                    break;
            }
        }
    },

    move(e) {
        if (pointer.pointers[e.pointerId] == undefined) return;

        move.initialize_globals(e);

        if (pointer.active) {
            switch (current.tool.type) {
                case "monoline": 
                    move.continue_stroke();
                    break;
                case "eraser":
                    boring.object_erase();
                    break;
            }
        }
    },

    up(e) {
        up.initialize_globals(e);

        switch (current.tool.type) {
            case "monoline":
                up.end_stroke();
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

    end_stroke() {
        console.log("ending stroke");
        if (current.stroke.nodes.length > 1) {
            let y = Math.min(current.stroke.nodes.length-1, current.stroke.tool.smoothness),
                x = current.iterations[y].length-1;
                
            while (y > 0) {
                y--;
                x++;

                let new_coord = current.iterations[y][x];
                current.stroke.nodes.push(JSON.parse(JSON.stringify(new_coord)));
                boring.check_min_max_and_grid(current.stroke);
                current.stroke.draw_last_node();
            }
        }
    }
}
