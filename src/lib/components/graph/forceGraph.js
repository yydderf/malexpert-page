// Copyright 2021-2024 Observable, Inc.
// Released under the ISC license.
// https://observablehq.com/@d3/force-directed-graph

import * as d3 from "d3";
import { GRAPH } from "$lib/consts/graph.ts";
import { FIXED_DIGITS } from "$lib/consts/analysis.ts";

// TODO: add zooming
// TODO: add drag to move
// TODO: attaction force ∝ importance

export function ForceGraph({
    nodes, // an iterable of node objects (typically [{id}, …])
    links // an iterable of link objects (typically [{source, target}, …])
}, {
        nodeId = d => d.id, // given d in nodes, returns a unique identifier (string)
        nodeGroup, // given d in nodes, returns an (ordinal) value for color
        nodeGroups, // an array of ordinal values representing the node groups
        nodeTitle, // given d in nodes, a title string
        nodeFill = "currentColor", // node stroke fill (if not using a group color encoding)
        nodeStroke = "#fff", // node stroke color
        nodeStrokeWidth = GRAPH.DEFAULT.NODE_STROKE_WIDTH, // node stroke width, in pixels
        nodeStrokeOpacity = GRAPH.DEFAULT.NODE_STROKE_OPACITY, // node stroke opacity
        nodeRadius = GRAPH.DEFAULT.NODE_RADIUS, // node radius, in pixels
        nodeStrength,
        linkSource = ({source}) => source, // given d in links, returns a node identifier string
        linkTarget = ({target}) => target, // given d in links, returns a node identifier string
        linkStroke = "#999", // link stroke color
        linkStrokeOpacity = GRAPH.DEFAULT.LINK_STROKE_OPACITY, // link stroke opacity
        linkStrokeWidth = GRAPH.DEFAULT.LINK_STROKE_WIDTH, // given d in links, returns a stroke width in pixels
        linkStrokeLinecap = "round", // link stroke linecap
        linkStrength,
        colors = d3.schemeTableau10, // an array of color strings, for the node groups
        width = GRAPH.DEFAULT.WIDTH, // outer width, in pixels
        height = GRAPH.DEFAULT.HEIGHT, // outer height, in pixels
        invalidation // when this promise resolves, stop the simulation
    } = {}) {
    // Compute values.
    const N = d3.map(nodes, nodeId).map(intern);
    const R = typeof nodeRadius !== "function" ? null : d3.map(nodes, nodeRadius);
    const LS = d3.map(links, linkSource).map(intern);
    const LT = d3.map(links, linkTarget).map(intern);
    if (nodeTitle === undefined) nodeTitle = (_, i) => N[i];
    const T = nodeTitle == null ? null : d3.map(nodes, nodeTitle);
    const G = nodeGroup == null ? null : d3.map(nodes, nodeGroup).map(intern);
    const W = typeof linkStrokeWidth !== "function" ? null : d3.map(links, linkStrokeWidth);
    const L = typeof linkStroke !== "function" ? null : d3.map(links, linkStroke);


    // Replace the input nodes and links with mutable objects for the simulation.
    nodes = d3.map(nodes, (d, i) => ({ ...d, id: N[i]}));
    links = d3.map(links, (d, i) => ({ ...d, source: LS[i], target: LT[i]}));

    // Compute default domains.
    if (G && nodeGroups === undefined) nodeGroups = d3.sort(G);

    // Construct the scales.
    const color = nodeGroup == null ? null : d3.scaleOrdinal(nodeGroups, colors);

    // Construct the forces.
    const forceNode = d3.forceManyBody();
    const forceLink = d3.forceLink(links).id(({index: i}) => N[i]);
    if (nodeStrength !== undefined) forceNode.strength(nodeStrength);
    if (linkStrength !== undefined) forceLink.strength(linkStrength);

    const simulation = d3.forceSimulation(nodes)
    .force("link", forceLink)
    .force("charge", forceNode)
    .force("center",  d3.forceCenter())
    .on("tick", ticked);

    const svg = d3.create("svg")
    .attr("width", width)
    .attr("height", height)
    .attr("viewBox", [-width / 2, -height / 2, width, height])
    .attr("style", "max-width: 100%; height: auto; height: intrinsic;");

    const hoverG = svg.append("g")
    .attr("pointer-events", "none")
    .attr("visibility", "hidden")

    const hoverBg = hoverG.append("rect")
    .attr("fill", "rgba(0,0,0,0.8)");

    const hoverText = hoverG.append("text")
    .attr("font-size", GRAPH.OBJ.FONT.SIZE)
    .attr("fill", "white")
    .attr("text-anchor", "middle")
    .attr("dominant-baseline", "middle");

    const node_opacity_scale = d3.scalePow()
    .exponent(0.5)
    .domain(d3.extent(nodes, d => d.importance))
    .range([0.15, 1.0])
    .clamp(true);

    const link = svg.append("g")
    .attr("stroke", typeof linkStroke !== "function" ? linkStroke : null)
    .attr("stroke-opacity", linkStrokeOpacity)
    .attr("stroke-width", typeof linkStrokeWidth !== "function" ? linkStrokeWidth : null)
    .attr("stroke-linecap", linkStrokeLinecap)
    .selectAll("line")
    .data(links)
    .join("line");

    const node = svg.append("g")
    .attr("fill", nodeFill)
    .attr("stroke", nodeStroke)
    .attr("stroke-opacity", nodeStrokeOpacity)
    .attr("stroke-width", nodeStrokeWidth)
    .selectAll("circle")
    .data(nodes)
    .join("circle")
    .attr("r", nodeRadius)
    .attr("opacity", d => node_opacity_scale(d.importance))
    .call(drag(simulation))
    .on("mouseover", function(event, d) {
        const curr_node = d3.select(this);
        curr_node
            .transition()
            .duration(GRAPH.OBJ.TRANS.OVER_DURATION)
            .attr("r", nodeRadius * GRAPH.DRAG.MAGNIFICATION);

        setHoverLabel([
            "# " + (d.id ?? "unknown"),
            "importance: " + (d.importance.toFixed(FIXED_DIGITS) ?? "unknown"),
            d.label ?? "",
        ]);

        hoverG
            .attr("visibility", "visible")
            .attr("transform", `translate(${d.x + GRAPH.OBJ.POS.X_OFFSET * 2}, ${d.y + GRAPH.OBJ.POS.Y_OFFSET * 2})`)
            .raise();
    })
    .on("mouseout", function(event, d) {
        d3
            .select(this)
            .transition()
            .duration(GRAPH.OBJ.TRANS.OUT_DURATION)
            .attr("r", nodeRadius);

        hoverG
            .attr("visibility", "hidden");
    });

    if (W) link.attr("stroke-width", ({index: i}) => W[i]);
    if (L) link.attr("stroke", ({index: i}) => L[i]);
    if (G) node.attr("fill", ({index: i}) => color(G[i]));
    if (R) node.attr("r", ({index: i}) => R[i]);
    // if (T) node.append("title").text(({index: i}) => T[i]);
    if (invalidation != null) invalidation.then(() => simulation.stop());

    function intern(value) {
        return value !== null && typeof value === "object" ? value.valueOf() : value;
    }

    function ticked() {
        // trigonometry is required to prevent each link
        // from going to the center of each node
        // derive unit vector
        link
            .attr("x1", d => d.source.x)
            .attr("y1", d => d.source.y)
            .attr("x2", d => d.target.x)
            .attr("y2", d => d.target.y);

        node
            .attr("cx", d => d.x)
            .attr("cy", d => d.y);
    }

    function setHoverLabel(lines) {
        // const text = d.label ?? "# " + d.id;
        hoverText.selectAll("tspan").remove();

        let bg_x_offset = -GRAPH.OBJ.BG.X_OFFSET;
        let bg_y_offset = -GRAPH.OBJ.BG.Y_OFFSET;

        // hoverText.text(text);
        const filtered_lines = lines.filter(line => line !== "");
        filtered_lines
            .forEach((line, i) => {
                hoverText
                    .append("tspan")
                    .attr("x", 0)
                    .attr("dy", i === 0 ? "0em" : "1.2em")
                    .text(line);
                if (i !== 0) bg_y_offset += GRAPH.OBJ.BG.Y_OFFSET * 2;
            });

        const b = hoverText.node().getBBox();

        hoverBg
            .attr("width", b.width + GRAPH.OBJ.BG.X_OFFSET * 2)
            .attr("height", b.height + GRAPH.OBJ.BG.Y_OFFSET * 2)
            .attr("x", -b.width / 2 + bg_x_offset)
            .attr("y", -b.height / 2 + bg_y_offset);
            // .attr("y", -b.height / 2 - GRAPH.OBJ.BG.Y_OFFSET + GRAPH.OBJ.Y_OFFSET * filtered_lines.length);
    }

    function drag(simulation) {    
        function dragstarted(event) {
            if (!event.active) simulation.alphaTarget(0.3).restart();
            event.subject.fx = event.subject.x;
            event.subject.fy = event.subject.y;
        }

        function dragged(event) {
            event.subject.fx = event.x;
            event.subject.fy = event.y;
            // assumption: dragging == hovering
            hoverG.attr("transform", `translate(${event.x + GRAPH.OBJ.POS.X_OFFSET * 2}, ${event.y + GRAPH.OBJ.POS.Y_OFFSET * 2})`);
        }

        function dragended(event) {
            if (!event.active) simulation.alphaTarget(0);
            event.subject.fx = null;
            event.subject.fy = null;
        }

        return d3.drag()
            .on("start", dragstarted)
            .on("drag", dragged)
            .on("end", dragended);
    }

    return Object.assign(svg.node(), {scales: {color}});
}
