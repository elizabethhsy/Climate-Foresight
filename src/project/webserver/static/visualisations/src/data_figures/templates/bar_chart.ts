import { Figure } from './graph';

import * as d3 from "d3";

// TODO: move stuff from create to prepareData
export class BarChart extends Figure {
    private data: any[] = [];

    constructor(DOMElement: HTMLElement) {
        super(DOMElement);
    }

    public prepareData(data: any): void {
        this.data = data;
    }

    public create(): void {

        // Data processing
        const n = 3; // No. of forcing groups
        const k = 5; // take every 5th data point
        const numPoints = 1 + Math.floor(this.data["year"].length / k);  // No. data points per group
        const arr = [...Array(numPoints)];

        var years = arr.map((_, i) => this.data["year"][k * i]);
        var CO2Forcing = arr.map((_, i) => this.data["CO2_forcing"][k * i]);
        var CH4Forcing = arr.map((_, i) => this.data["CH4_forcing"][k * i]);
        var N2OForcing = arr.map((_, i) => this.data["N2O_forcing"][k * i]);

        const yz = [CO2Forcing, CH4Forcing, N2OForcing];
        const xz = d3.range(numPoints).map(i => `${years[i]}`); // x-axis tick labels
        console.log(xz);

        // Div properties
        const width = 1450;
        const height = 750;
        const marginTop = 250;
        const marginRight = 50;
        const marginBottom = 30;
        const marginLeft = 220;

        // Transform data for stacked or grouped presentation
        const y01z = d3.stack().keys(d3.range(n))(d3.transpose(yz))
            .map((data, i) => data.map(([y0, y1]) => [y0, y1, i]));

        const yMax = d3.max(yz, y => d3.max(y));
        const y1Max = d3.max(y01z, y => d3.max(y, d => d[1]));

        const x = d3.scaleBand()
            .domain(xz)
            .rangeRound([marginLeft, width - marginRight])
            .padding(0.08);

        const xAxis = d3.axisBottom(x).tickValues(x.domain().filter((d, i) => i % 2 === 0)); // only display every other x-tick label

        const y = d3.scaleLinear()
            .domain([0, y1Max])
            .range([height - marginBottom, marginTop]);

        const color = d3.scaleSequential(d3.interpolateBlues)
            .domain([-0.5 * n, 1.5 * n]);

        const svg = d3.select("#graph").append("svg")
            .attr("viewBox", [0, 0, width, height])
            .attr("width", width)
            .attr("height", height)
            .attr("style", "max-width: 100%; height: auto; height: auto;");

        const rect = svg.selectAll("g")
            .data(y01z)
            .join("g")
            .attr("fill", (d, i) => color(i))
            .selectAll("rect")
            .data(d => d)
            .join("rect")
            .attr("x", (d, i) => x(xz[i]))
            .attr("y", height - marginBottom)
            .attr("width", x.bandwidth())
            .attr("height", 0);

        // Create labels for when hovering over the bar
        const tooltip = d3.select("#tooltip");

        rect.on("mouseover", function(event, d) {
                tooltip.style("visibility", "visible")
                        .html(`Year: ${xz[rect.data().indexOf(d) % numPoints]}<br>Forcing: ${d[1] - d[0]}`)
                        .style("top", (event.pageY - 10) + "px")
                        .style("left",(event.pageX + 10) + "px");
            })
            .on("mousemove", function(event, d) {
                tooltip.style("top", (event.pageY - 10) + "px")
                        .style("left",(event.pageX + 10) + "px");
            })
            .on("mouseout", function() {
                tooltip.style("visibility", "hidden");
            });

        svg.append("g")
            .attr("class", "x axis")
            .attr("transform", `translate(0,${height - marginBottom})`)
            .call(d3.axisBottom(x).tickSizeOuter(0))
            .call(xAxis); // ensure x-axis only shows correct labels

        svg.append("title")
        .text("Double click to transition"); // hover label

        function transitionGrouped() {
            y.domain([0, yMax]);

            rect.transition()
                .duration(500)
                .delay((d, i) => i * 20)
                .attr("x", (d, i) => x(xz[i]) + x.bandwidth() / n * d[2])
                .attr("width", x.bandwidth() / n)
            .transition()
                .attr("y", d => y(d[1] - d[0]))
                .attr("height", d => y(0) - y(d[1] - d[0]));
        }

        function transitionStacked() {
            y.domain([0, y1Max]);

            rect.transition()
                .duration(500)
                .delay((d, i) => i * 20)
                .attr("y", d => y(d[1]))
                .attr("height", d => y(d[0]) - y(d[1]))
            .transition()
                .attr("x", (d, i) => x(xz[i]))
                .attr("width", x.bandwidth());
        }

        // Initial call to start in one of the states
        var currentState = "grouped";
        transitionGrouped();

        // Optional: Implement a way to trigger transitions, e.g., via button clicks
        svg.on("dblclick", function(event) {
            // Determine the current state and toggle
            if (currentState === "grouped") {
                transitionStacked();
                currentState = "stacked"; // Update the current state
            } else {
                transitionGrouped();
                currentState = "grouped"; // Update the current state
            }
        });
    }
}
