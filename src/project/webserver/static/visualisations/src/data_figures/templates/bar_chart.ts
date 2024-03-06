// import { Figure, Species } from './figure';

// import * as d3 from "d3";

class BarChart extends Figure {
    // For storing the current state of the bar chart
    private scenario: string;
    private metric: string;  // options: forcing, emissions, airborne_emissions, concentration
    private species: Array<string>;

    // For caching fetched data
    private data: Object;
    
    static INTERVAL = 5;  // bar chart is in 5 year intervals (i.e. taking every 5th data point)

    static colorMap = {
        CO2: '#4a8dbb',
        CH4: '#6ebd6e',
        N2O: '#ff9f4f'
    };

    constructor(DOMElement: HTMLElement, config) {
        super(DOMElement, config);
        this.scenario = "none";
        this.metric = "none";
        this.species = [];
        this.data = {};
    }

    public async update(render: boolean = true) {
        // Function that is called whenever the config is updated

        // Check whether there is anything to update
        const checkedBoxes = this.getCheckedBoxes();
        if (
            this.scenario === this.config.values["radioBarChartScenario"].replace(' ', '_')
            && this.metric === this.config.values["radioBarChartMetric"].replace(' ', '_')
            && checkedBoxes.length === this.species.length
            && this.getCheckedBoxes().every((v, i) => v === this.species[i])
        ) {
            return;
        }

        // Update internal state
        this.scenario = this.config.values["radioBarChartScenario"];
        this.metric = this.config.values["radioBarChartMetric"].replace(' ', '_');
        this.species = checkedBoxes;

        // Fetch data if necessary
        await this.getDataForScenario(this.scenario);

        if (render) {
            this.render();
        }
    }

    private async getDataForScenario(scenario: string): Promise<void> {
        // Function to fetch data for a specific scenario and store this data for future use
        if (!(this.scenario in this.data)) {
            const url = `/api/climate?scenario=${scenario}&file=pos_generative`;
            const data = await fetch(url);
            this.data[scenario] = await data.json();
        }
    }

    private async getPDFData(scenario: string, year: number, species: string, metric: string) {
        // Function to sample 1000 data points from the DCM run data
        const url = `/api/climate2/${scenario}/year/${year}/${species}_${metric.toLowerCase()}.json`;
        const response = await fetch(url);
        const data = await response.json();
        return data;
    }

    public async init(): Promise<void> {
        // Initialize bar chart without rendering
        this.scenario = this.config.values["radioBarChartScenario"];
        this.metric = this.config.values["radioBarChartMetric"].replace(' ', '_');
        this.species = this.getCheckedBoxes();
        await this.getDataForScenario(this.scenario);
    }

    private getCheckedBoxes() {
        // Function to determine which boxes the user has checked on the web page
        const checkedBoxes = [];
        for (const key in this.config.values) {
            if (key.includes("checkbox") && this.config.values[key]) {
                checkedBoxes.push(key.replace("checkbox", ""));
            }
        }
        return checkedBoxes;
    }

    public async render(): Promise<void> {
        // Function to call whenever there's an update to the bar chart
        // Renders the bar chart

        // Capture this BarChart instance for later use within event handlers
        const self = this; 

        // Remove existing svg elements and replace with new figure
        if (d3.select(self.DOMElement).select("svg")) {
            d3.select(self.DOMElement).selectAll("svg").remove();
        }

        // Data processing
        const data = self.data[self.scenario];
        const checkedBoxes = self.species;
        const n = checkedBoxes.length; // No. of groups
        const k = BarChart.INTERVAL;

        const numPoints = 1 + Math.floor(data["year"].length / k);  // No. data points per group
        const arr = [...Array(numPoints)];

        var years = arr.map((_, i) => data["year"][k * i]);
        var CO2 = arr.map((_, i) => data[`CO2_${this.metric}`][k * i]);
        var CH4 = arr.map((_, i) => data[`CH4_${this.metric}`][k * i]);
        var N2O = arr.map((_, i) => data[`N2O_${this.metric}`][k * i]);

        // Display data according to config chose by user
        const yz = [];
        if (self.species.includes("CO2")) {
            yz.push(CO2);
        }
        if (self.species.includes("CH4")) {
            yz.push(CH4);
        }
        if (self.species.includes("N2O")) {
            yz.push(N2O);
        }

        const xz = d3.range(numPoints).map(i => `${years[i]}`); // x-axis tick labels

        // Div properties
        const width = 1450;
        const height = 750;
        const margin = {
            top: 90,
            right: 130,
            bottom: 60,
            left: 70
        }

        // Transform data for stacked or grouped presentation
        const y01z = d3.stack().keys(d3.range(n))(d3.transpose(yz))
            .map((data, i) => data.map(([y0, y1]) => [y0, y1, i]));

        const yMax = d3.max(yz, y => d3.max(y));
        const y1Max = d3.max(y01z, y => d3.max(y, d => d[1]));

        const x = d3.scaleBand()
            .domain(xz)
            .rangeRound([margin.left, width - margin.right])
            .padding(0.08);

        const xAxis = d3.axisBottom(x).tickValues(x.domain().filter((d, i) => i % 2 === 0)); // only display every other x-tick label

        const y = d3.scaleLinear()
            .domain([0, y1Max])
            .range([height - margin.bottom, margin.top]);
        
        const yAxis = d3.axisLeft(y);


        const svg = d3.select(self.DOMElement).append("svg")
            .attr("viewBox", [0, 0, width, height])
            .attr("width", width)
            .attr("height", height)
            .attr("style", "max-width: 100%; height: auto; height: auto;");

        const rect = svg.selectAll("g")
            .data(y01z)
            .join("g")
            .attr("fill", (d, i) => BarChart.colorMap[self.species[i]])
            .selectAll("rect")
            .data(d => d)
            .join("rect")
            .attr("x", (d, i) => x(xz[i]))
            .attr("y", height - margin.bottom)
            .attr("width", x.bandwidth())
            .attr("height", 0);

        // Legend settings
        const legendSize = 14; // Size of the color swatches
        const legendSpacing = 4; // Space between swatches and text
        const legendPosition = { x: margin.left + 30, y: margin.top + 20 };

        // Create a legend container
        const legend = svg.append('g')
            .attr('class', 'legend')
            .attr('transform', `translate(${legendPosition.x},${legendPosition.y})`);

        // Add legend entries
        Object.entries(BarChart.colorMap).forEach(([key, value], index) => {
            if (self.species.includes(key)) {
                const legendEntry = legend.append('g')
                    .attr('class', 'legend-entry')
                    .attr('transform', `translate(0, ${index * (legendSize + legendSpacing)})`);
                
                // Append color swatch
                legendEntry.append('rect')
                    .attr('width', legendSize)
                    .attr('height', legendSize)
                    .attr('fill', value);
                
                // Append text label
                legendEntry.append('text')
                    .attr('x', legendSize + legendSpacing)
                    .attr('y', legendSize - legendSpacing)
                    .text(key);
            }
        });

        // Create labels for when hovering over the bar
        const tooltip = d3.select("#tooltip");

        // Event functions
        rect.on("mouseover", async function(event, d) {
                // Determine species associated with the rect being hovered over
                const currentSpecies = self.species[Math.floor(rect.data().indexOf(d) / numPoints)];

                // Display hover text
                tooltip.style("visibility", "visible")
                    .html(`Year: ${xz[rect.data().indexOf(d) % numPoints]}<br>${currentSpecies} ${self.metric}: ${(d[1] - d[0]).toFixed(2)}`)
                    .style("top", (event.pageY) + "px")
                    .style("left", (event.pageX - 150) + "px");
            
                // Reduce opacity of all rects
                svg.selectAll("rect")
                    .style("opacity", 0.35);
                const currentColumnIndex = rect.data().indexOf(d) % numPoints; // index of current rect
                
                // Set opacity of rects in the same column to 0.5
                svg.selectAll("rect").filter((_, i) => i % numPoints === currentColumnIndex)
                    .style("opacity", 0.5);
                
                svg.selectAll("rect").filter((_, i) => i % numPoints > currentColumnIndex)
                    .style("opacity", 0.05);

                // Set opacity of hovered over rect to 1
                d3.select(this)
                    .style("opacity", 1);

                // Create probability density plot
                const year = 1750 + currentColumnIndex * 5;
                const pdfData = await self.getPDFData(self.scenario, year, currentSpecies, self.metric)
                d3.select(self.DOMElement).selectAll("svg.pdf-svg").remove();
                const pdfSVG = await self.createPDFSVG(pdfData, currentSpecies);

                // Calculate position based on the hovered rectangle's position
                const rectBounds = this.getBoundingClientRect();
                pdfSVG.style("left", `${rectBounds.right + 10}px`) // 10px to the right of the rect
                        .style("top", `${Math.max(rectBounds.top - 85, height / 2 + 50)}px`)
                        .style("visibility", "visible");

            })
            .on("mousemove", function(event, d) {
                // tooltip moves with mouse
                tooltip.style("top", (event.pageY) + "px")
                    .style("left",(event.pageX - 150) + "px");
            })
            .on("mouseout", function() {
                // Restore opacity for all rects
                svg.selectAll("rect").style("opacity", 1);

                // Hide hover label
                tooltip.style("visibility", "hidden");

                // Remove density plot
                d3.select(self.DOMElement).selectAll("svg.pdf-svg").remove();
            });
        
        // x axis ticks
        svg.append("g")
            .attr("class", "x axis")
            .attr("transform", `translate(0,${height - margin.bottom})`)
            .call(d3.axisBottom(x).tickSizeOuter(0))
            .call(xAxis); // ensure x-axis only shows correct labels

        // Axis titles
        svg.append("text")
            .attr("class", "x label")
            .style("font-family", "Arial, sans-serif")
            .style("font-size", "16px")
            .attr("text-anchor", "middle")
            .attr("x", width / 2)
            .attr("y", height - margin.bottom / 3)
            .text("year");
        
        const yAxisTitle = this.metric + " (" + self.getUnit(this.metric) + ")";
        svg.append("text")
            .attr("class", "y label")
            .style("font-family", "Arial, sans-serif")
            .style("font-size", "16px")
            .attr("text-anchor", "middle")
            .attr("transform", "rotate(-90)") // Rotate the text
            .attr("x", -height / 2) // Position the text vertically centered
            .attr("y", margin.left / 3) // Adjust this value as needed for vertical positioning
            .text(yAxisTitle);

        // Figure title
        const metric = this.metric.replaceAll("_", " ");
        const title = metric + " over time";
        svg.append("text")
            .attr("class", "title")
            .style("font-family", "Arial, sans-serif")
            .style("font-size", "24px")
            .attr("text-anchor", "middle")
            .attr("x", width / 2)
            .attr("y", margin.top / 2)
            .text(title);
        
        
        // Add y axis to chart
        svg.append("g")
            .attr("class", "y axis")
            .attr("transform", `translate(${margin.left}, 0)`)
            .call(yAxis);
        
        // Style y axis
        d3.selectAll(".y.axis path, .y.axis line")
            .style("stroke", "#000");

        d3.selectAll(".y.axis text")
            .style("font-size", "10px");

        // Functions to transition between two views of data
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
        var currentState = "stacked";
        transitionStacked();

        // Transition between views when double clicked
        svg.on("dblclick", function(event) {
            // Determine the current state and toggle
            if (currentState === "grouped") {
                transitionStacked();
                currentState = "stacked";
            } else {
                transitionGrouped();
                currentState = "grouped";
            }
        });
    }

    private kernelDensityEstimation(data: Array<number>) {
        // Function to generate probability density data from a discrete data set (i.e. an array of numbers)
        
        // Helper function to calculate variance
        function calculateVariance(data: Array<number>) {
            const mean = data.reduce((acc, val) => acc + val, 0) / data.length;
            const variance = data.reduce((acc, val) => acc + (val - mean) ** 2, 0) / data.length;
            return variance;
        }

        // Helper function to calculate
        function gaussianKernel(x: number) {
            return (1 / Math.sqrt(2 * Math.PI)) * Math.exp(-0.5 * x * x);
        }

        // Sort data so that KDE works
        data = d3.sort(data);

        // Generate x values for density estimation
        const xMin = data[0];
        const xMax = data[data.length - 1];
        const xValues = Array.from({ length: 1000 }, (_, i) => xMin + (xMax - xMin) * i / 999);

        // Bandwidth chosen according to Silverman's rule of thumb (with extra 0.4 factor)
        const bandwidth = 1.06 * Math.sqrt(calculateVariance(data)) * Math.pow(data.length, -1/5) * 0.4;

        const density = xValues.map(x => {
            const kernelSum = data.reduce((sum, xi) => {
                const xMinusXi = (x - xi) / bandwidth;
                return sum + gaussianKernel(xMinusXi);
            }, 0);
            return { val: x, density: kernelSum / (data.length * bandwidth) };
        });

        return density;
    }

    private async createPDFSVG(dataPoints: Array<number>, species: string) {
        // Function to create a smoothed probability density plot from a list of numeric data

        // Get densities using kernel density estimation
        const data = this.kernelDensityEstimation(dataPoints);

        // SVG dimensions
        const width = 180, height = 280;
        const margin = {
            top: 20,
            bottom: 20,
            left: 60,
            right: 15
        }

        // Scales for the line graph
        const x = d3.scaleLinear()
            .domain([0, d3.max(data, d => d.density)])
            .range([margin.left, width - margin.right]);
        
        const y = d3.scaleLinear()
            .domain([d3.min(data, d => d.val), d3.max(data, d => d.val)])
            .range([margin.top, height - margin.bottom]); // graph grows from top to bottom

        // Line generator
        const line = d3.line()
            .x(d => x(d.density))
            .y(d => y(d.val)); // want plot to be sideways
        
        // Create an SVG element for the line graph
        const pdfSvg = d3.select(this.DOMElement).append("svg")
          .attr("class", "pdf-svg")
          .attr("width", width)
          .attr("height", height)
          .style("position", "absolute")
          .style("visibility", "hidden"); // Initially hidden; show it on hover

        // Add vertical axis
        pdfSvg.append("g")
            .attr("transform", `translate(${margin.left},0)`)
            .call(d3.axisLeft(y).ticks(width / 40).tickSizeOuter(0));

        // Append a path for the line
        pdfSvg.append("path")
            .attr("fill", "none")
            .attr("stroke", "black")
            .attr("stroke-width", 1.5)
            .attr("d", line(data));

        // Fill in area under curve
        const area = d3.area()
            .x0(d => x(0))
            .x1(d => x(d.density))
            .y(d => y(d.val)); // x0 x1 and y because vertical plot

        const defs = pdfSvg.append("defs");
        const densityGradientID = "densityGradient" + species;
        
        const gradient = defs.append("linearGradient")
            .attr("id", densityGradientID)
            .attr("gradientUnits", "userSpaceOnUse")
            .attr("x1", 0).attr("y1", y(d3.min(data, d => d.val)))
            .attr("x2", 0).attr("y2", y(d3.max(data, d => d.val)));

        // Define the color scale (interpolate colors to fill area below graph)
        const colorScale = d3.scaleSequential(t => d3.interpolateLab(d3.interpolateLab(BarChart.colorMap[species], "white")(0.9), d3.interpolateLab(BarChart.colorMap[species], "black")(0.3))(t))
            .domain([d3.max(data, d => d.density), 0]); // swapped so that high density means closer to white

        data.forEach((point, i, arr) => {
            const yPercentage = (y(point.val) - margin.bottom) / (height - margin.bottom - margin.top) * 100;
            gradient.append("stop")
                .attr("offset", `${yPercentage}%`)
                .attr("stop-color", colorScale(point.density));
        });

        pdfSvg.append("path")
            .datum(data) // Use datum since it's a single object
            .attr("fill", `url(#${densityGradientID})`)
            .attr("d", area);
        
        // Return SVG element
        return pdfSvg;
    }
}
