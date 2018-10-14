const svg = d3.select('#exec-space');
const constants = {
    H_MARGIN: 100, // Horizontal margin of left or right
    V_MARGIN: 100  // Vertical margin of top and down
}

// Get height and width of the svg where the animation will be presented and convert the height and width to integer.
// SVG must have inline heignt and width declared for this to happen
const dimension = { height: null, width: null }
dimension.height = +svg.attr('height');
dimension.width = +svg.attr('width');

class Grid {
    constructor (lineFrom, lineTo, dim) {
        this.lineFrom = lineFrom;
        this.lineTo = lineTo;
        this.m = lineFrom.length;
        this.n = lineTo.length;
        this.dim = dim;
        this.transition = d3.transition().duration(1000);
        this.cellDim = {
            width: (dim.width - 2 * constants.H_MARGIN) / this.m,
            height: (dim.height - 2 * constants.V_MARGIN) / this.n
        }

        this._models = this._prepareModels();
        this._els = this._createGroups()
    }

    // Prepare the model to draw the matrix
    _prepareModels () {
        const models = { line: [], point: [] };
        const m = this.m;
        const n = this.n;
        const cellWidth = this.cellDim.width;
        const cellHeight = this.cellDim.height;
        const lineFrom = this.lineFrom;
        const lineTo = this.lineTo;
        let x, y;

        // Point model.
        let model = models.point

        // lineFrom is horizontally placed
        for (let i = 0; i <= m; i++) {
            // lineTo is vertically placed
            for (let j = 0; j <= n; j++) {
                // Populate the model with x, y information for all points and diagonal information. If horizontal and
                // vertical char are same then create a diagonal edge for that
                model.push({
                    i: i,
                    j: j,
                    x: i * cellWidth,
                    y: j * cellHeight,
                    isDiagonal: lineFrom[i] === lineTo[j]
                });
            }         
        }

        // Line model
        model = models.line;

        for (let j = 0; j <= n; j++) {
            // Horizontal lines
            model.push({
                x1: 0,
                y1: j * cellHeight,
                x2: m * cellWidth,
                y2: j * cellHeight,
                type: 'h'
            });
        }

        for (let i = 0; i <= m; i++) {
            // Vertical lines
            model.push({
                x1: i * cellWidth,
                y1: 0,
                x2: i * cellWidth,
                y2: n * cellHeight,
                type: 'v'
            });       
        }

        return models;
    }

    _createGroups () {
        const g = svg.append('g').classed('grid', true).attr('transform', 
            `translate(${constants.H_MARGIN}, ${constants.V_MARGIN})`); // Group to hold grid

        const linesG = g.append('g').classed('lines', true); // Group to hold points of grid
        const pointsG = g.append('g').classed('points', true); // Group to hold points of grid

        return {
            g: g,
            linesG: linesG,
            pointsG: pointsG
        };
    }

    // Draws the grid with points
    async drawPoints () {
        return new Promise((res, rej) => {
            let sel = this._els.pointsG
                .selectAll('circle.grid-point')
                .data(this._models.point);

            sel.exit().remove();
            sel.
                enter()
                    .append('circle')
                    .attr('class', 'grid-point')
                .merge(sel)
                    .attr('cx', d => d.x)
                    .attr('cy', d => d.y)
                    .attr('r', 8);

            res();
        });
    }

    drawLines () {
        return new Promise((res, rej) => {
            let sel = this._els.linesG
                .selectAll('line.grid-line')
                .data(this._models.line);

            sel.exit().remove();
            sel.
                enter()
                    .append('line')
                    .attr('class', 'grid-line')
                .merge(sel)
                    .attr('x1', d => d.x1)
                    .attr('y1', d => d.y1)
                    .attr('x2', d => d.type === 'h' ? 0 : d.x2)
                    .attr('y2', d => d.type === 'v' ? 0: d.y2)
                    .transition(this.transition)
                    .attr('x2', d => d.x2)
                    .attr('y2', d => d.y2);

            res();
        });
    }
}

const grid = new Grid('Akash', 'Batash', dimension);
grid.drawPoints();
grid.drawLines();
