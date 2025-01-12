const current  = {
    tool: {
        type: "monoline",
        rad: 1,
        color: "white",
    },
    stroke_count: 0,
}, strokes = [];

class Stroke {
    create_element () {
        if (this.element) return -1;

        const e = document.createElementNS('http://www.w3.org/2000/svg', 'path');
        this.element = e;

        if (this.tool.type == "monoline") {
            e.setAttributeNS(null, "stroke", this.tool.color);
            e.setAttributeNS(null, "stroke-width", this.tool.rad);
            e.setAttributeNS(null, "fill", "none");
        }

        e.setAttributeNS(null, "d", "M" + ((this.nodes[0][0]-this.tool.rad)) + ", " + (this.nodes[0][1]) + 
            " a" + String(this.tool.rad) + ", " + String(this.tool.rad) + ", 0, 1, 1, " + String(2*this.tool.rad) + ", 0" + 
            " a " + String(this.tool.rad) + ", " + String(this.tool.rad) + ", 0, 1, 1, " + String(-2*this.tool.rad) + ", 0 z"
        );

        element.canvas.appendChild(e);
    }

    constructor (tool, nodes) {
        strokes.push(this);

        this.index = current.stroke_count;
        current.stroke_count++;
        this.tool = tool;
        this.nodes = nodes;

        this.create_element();
    }
}

const pointer = {
    pointers: {},

    down(e) {
        down.initialize_globals(e);

        down.create_stroke(e);
    },

    move(e) {
        move.initialize_globals(e);
    },

    up(e) {
        up.initialize_globals(e);
    },

    get pen() { return Object.values(this.pointers).find(p => p.type == "pen") },

    get active() { return this.pen || Object.values(this.pointers)[0] },
}

const down = {
    initialize_globals(e) {
        console.log("down");
        const {pointerId, pointerType} = e;
        pointer.pointers[pointerId] = {
            pos: boring.get_coordinates(e),
            type: pointerType,
            prev_pos: boring.get_coordinates(e),
        }
    },

    create_stroke(e) {
        console.log("new stroke");
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

}

const up = {
    initialize_globals(e) {
        delete pointer.pointers[e.pointerId];
    },

}
