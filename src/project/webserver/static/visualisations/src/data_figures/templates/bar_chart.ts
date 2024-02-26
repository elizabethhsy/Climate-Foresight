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

    static colorMap = { // TODO: move to parent class?
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
        console.log("Updating bar chart");

        // Check whether there is anything to update
        const checkedBoxes = this.getCheckedBoxes();
        if (
            this.scenario === this.config.values["radioBarChartScenario"].replace(' ', '_')
            && this.metric === this.config.values["radioBarChartMetric"].replace(' ', '_')
            && checkedBoxes.length === this.species.length
            && this.getCheckedBoxes().every((v, i) => v === this.species[i])
        ) {
            console.log("Everything up to date :)");
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

    private async getDataForScenario(scenario: string): void {
        if (!(this.scenario in this.data)) {
            const url = `/api/climate?scenario=${scenario}&file=pos_generative`;
            const data = await fetch(url);
            this.data[scenario] = await data.json();
            console.log("just fetched data for " + scenario);
            console.log(this.data);
        }
    }

    // Initialize bar chart without rendering
    public async init(): void {
        this.scenario = this.config.values["radioBarChartScenario"];
        this.metric = this.config.values["radioBarChartMetric"].replace(' ', '_');
        this.species = this.getCheckedBoxes();
        await this.getDataForScenario(this.scenario);
    }

    private getCheckedBoxes() {
        const checkedBoxes = [];
        for (const key in this.config.values) {
            if (key.includes("checkbox") && this.config.values[key]) {
                checkedBoxes.push(key.replace("checkbox", ""));
            }
        }
        return checkedBoxes;
    }

    public render(): void {
        const self = this; // capture this BarChart instance for later use within event handlers

        // Remove existing svg elements and replace with new figure
        if (d3.select(self.DOMElement).select("svg")) {
            d3.select(self.DOMElement).selectAll("svg").remove();
        }


        // Data processing
        console.log(self.species);
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

        // TODO: make this part extensible
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
        // console.log(xz);

        // Div properties
        const width = 1450;
        const height = 750;
        const margin = {
            top: 60,
            right: 70,
            bottom: 100,
            left: 100
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

        // Create labels for when hovering over the bar
        const tooltip = d3.select("#tooltip");

        const histData = {
            "CO2": Array.from({length: 1000}, (x, i) => 15 * Math.sin(Math.random() * Math.PI)),
            "CH4": [],
            "N2O": []
        };

        rect.on("mouseover", function(event, d) {
                console.log(self.config.values);
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

                // Create histogram
                const histSvg = self.createHoverFigure(histData["CO2"]);

                // Calculate position based on the hovered rectangle's position
                const rectBounds = this.getBoundingClientRect();
                histSvg.style("left", `${rectBounds.right + 10}px`) // 10px to the right of the rect
                        .style("top", `${rectBounds.top - 100}px`)
                        .style("visibility", "visible");



                // Display hover text
                // tooltip.style("visibility", "visible")
                //     .html(`Year: ${xz[rect.data().indexOf(d) % numPoints]}<br>Forcing: ${(d[1] - d[0]).toFixed(2)}`)
                //     .style("top", (event.pageY - 10) + "px")
                //     .style("left",(event.pageX + 10) + "px");
            })
            .on("mousemove", function(event, d) {
                tooltip.style("top", (event.pageY - 10) + "px")
                    .style("left",(event.pageX + 10) + "px");
            })
            .on("mouseout", function() {
                // Restore opacity for all rects
                svg.selectAll("rect").style("opacity", 1);

                // Hide hover label
                tooltip.style("visibility", "hidden");

                // Remove histogram
                d3.select(self.DOMElement).selectAll("svg.pdf-svg").style("visibility", "hidden");
            });

        // svg.append("title")
        //     .text("Double click to transition"); // hover label

        svg.append("g")
            .attr("class", "x axis")
            .attr("transform", `translate(0,${height - margin.bottom})`)
            .call(d3.axisBottom(x).tickSizeOuter(0))
            .call(xAxis); // ensure x-axis only shows correct labels
        
        // Add y axis to chart
        svg.append("g")
            .attr("class", "y axis")
            .attr("transform", `translate(${margin.left}, 0)`)
            .call(yAxis);
        
        // Style y axis (doesn't do anything at the moment)
        d3.selectAll(".y.axis path, .y.axis line")
            .style("stroke", "#000");

        d3.selectAll(".y.axis text")
            .style("font-size", "10px");

        

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

        // console.log(Date.now() - start);
    }

    private kernelDensityEstimation(data) {
        // Create a pdf from a discrete dataset

        function calculateVariance(data) {
            const mean = data.reduce((acc, val) => acc + val, 0) / data.length;
            const variance = data.reduce((acc, val) => acc + (val - mean) ** 2, 0) / data.length;
            return variance;
        }

        function gaussianKernel(x) {
            return (1 / Math.sqrt(2 * Math.PI)) * Math.exp(-0.5 * x * x);
        }

        // Generate x values for density estimation (e.g., from min to max of your data)
        const xMin = Math.min(...data);
        const xMax = Math.max(...data);
        const xValues = Array.from({ length: 1000 }, (_, i) => xMin + (xMax - xMin) * i / 999);

        // Choose a reasonable bandwidth (this may require experimentation)
        const bandwidth = 1.06 * Math.sqrt(calculateVariance(data)) * Math.pow(data.length, -1/5); // Silverman's rule of thumb

        const density = xValues.map(x => {
          const kernelSum = data.reduce((sum, xi) => {
            const xMinusXi = (x - xi) / bandwidth;
            return sum + gaussianKernel(xMinusXi);
          }, 0);
          return { val: x, density: kernelSum / (data.length * bandwidth) };
        });
        return density;
    }

    private createHoverFigure(data) {
        // data = this.kernelDensityEstimation(data);

        // Dummy data
        data = Array.from({length: 1000}, (v,i) => {return {val: (i-500)/170, density: 1 / Math.sqrt(2 * Math.PI) * Math.exp(-0.5 * ((i - 500) / 170) ** 2)};});
        // console.log(data);

        // Dimensions
        const width = 100, height = 200; // make this dynamic
        const margin = {
            top: 20,
            bottom: 20,
            left: 30,
            right: 30
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
            .y(d => y(d.val)); // d.x because we want plot to be sideways
        
        // Create an SVG element for the line graph
        const pdfSvg = d3.select(this.DOMElement).append("svg")
          .attr("class", "pdf-svg")
          .attr("width", width)
          .attr("height", height)
          .style("position", "absolute")
          .style("visibility", "hidden"); // Initially hidden; show it on hover

        // Add axes
        // pdfSvg.append("g")
        //     .attr("transform", `translate(0,${margin.top})`)
        //     .call(d3.axisTop(x).ticks(width / 40).tickSizeOuter(0));
        pdfSvg.append("g")
            .attr("transform", `translate(${margin.left},0)`)
            .call(d3.axisLeft(y).tickSizeOuter(0));

        // Append a path for the line
        pdfSvg.append("path")
            .attr("fill", "none")
            .attr("stroke", "black")
            .attr("stroke-width", 1.5)
            .attr("d", line(data));

        // Fill in area under curve
        const area = d3.area()
            .x(d => x(d.density))
            .y0(height - margin.bottom) // Base line - bottom of the graph
            .y1(d => y(d.val)); // Top line - your data line
        
        // const defs = pdfSvg.append("defs");

        // const gradient = defs.append("linearGradient")
        //     .attr("id", "densityGradient")
        //     .attr("gradientUnits", "userSpaceOnUse")
        //     .attr("x1", 0).attr("y1", y(d3.min(data, d => d.val)))
        //     .attr("x2", 0).attr("y2", y(d3.max(data, d => d.val)));

        // gradient.append("stop")
        //     .attr("offset", "0%")
        //     .attr("stop-color", "lightblue") // Light color for low density
        //     .attr("stop-opacity", 1.0);

        // gradient.append("stop")
        //     .attr("offset", "100%")
        //     .attr("stop-color", "darkblue") // Dark color for high density
        //     .attr("stop-opacity", 1);

        // pdfSvg.append("path")
        //     .datum(data) // Use datum since it's a single object
        //     .attr("fill", "url(#densityGradient)")
        //     .attr("d", area);

        const defs = pdfSvg.append("defs");

        const gradient = defs.append("linearGradient")
            .attr("id", "densityGradient")
            .attr("gradientUnits", "userSpaceOnUse")
            .attr("x1", 0).attr("y1", y(d3.min(data, d => d.val)))
            .attr("x2", 0).attr("y2", y(d3.max(data, d => d.val)));

        // Dynamically create gradient stops based on density values
        const densityValues = data.map(d => d.density);
        const maxDensity = d3.max(densityValues);
        const minDensity = d3.min(densityValues);
        const numStops = 10; // Number of gradient stops

        for (let i = 0; i <= numStops; i++) {
            const density = minDensity + (i / numStops) * (maxDensity - minDensity);
            const opacity = density / maxDensity; // Normalize the density to [0, 1] for opacity
            gradient.append("stop")
                .attr("offset", `${(i / numStops) * 100}%`)
                .attr("stop-color", `rgba(0, 0, 255, ${opacity})`); // Example: blue with variable opacity
        }

        pdfSvg.append("path")
            .datum(data)
            .attr("fill", "url(#densityGradient)")
            .attr("d", area);
        
        return pdfSvg;
    }
}
