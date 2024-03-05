# Climate-Foresight

## Description

Dynamic Causal Modeling is a Bayesian statistical technique for reverse
engineering time series data. One of the ongoing challenges in applying
such statistical models is how to visualise the multiverse of possible
outcomes that the algorithm derives. Your goal is to create an
evidence-based visualisation of possible climate futures that allows users
to interrogate and compare projections from a complete simplified
carbon-climate model within the Dynamic Causal Modeling framework.

## Climate Visualisations

### Embecosm DCM

Embecosm Model
- 4 layer model: 1 atmosphere layer, 3 sea layers
- propose GHG emissions, etc.
- gases can pass between adjacent layers
- gases can also be created (modeled via 4-stage process, ugly eqns), go into atmosphere layer and seep into the sea layers
- FAIR model, top left box is box of emissions, some stuff happens, get global mean temperature
- heavily inspired by FAIR model, read documentation here: https://docs.fairmodel.net/en/latest/index.html

Data
- `true_generative.csv`: ground truth numbers for FAIR, i.e. using FAIR's model params as the ground truth; other runs are learning from these values, use this to tune model to go from prior to posterior
- `pos_generative.csv`: use the last run (each iteration is just a model inversion, so not important), finding better posterior estimates for each iteration
- `pos_generative_rand.csv`: n=10 iterations, i.e. 10 ribbons, sample from parameter distributions, running model with those
- `prior_generative_rand.csv`: in DEM_weather, run with prior parameter distributions (sampling using expectation and covariance of each prior)
- `prior_generative.csv`: same thing but just using expectations
- `param_covariances.csv`: storing intermediate param expectations

CSV Columns (from matrix dimensions)
- emissions: 5
- concentration: 5
- forcings: 5
- cummins: 4
- airborne_emissions: 5

Visualisation
- `default_prior_expectation << 1.876, 5.154, 0.6435, 2.632, 9.262, 52.93, 1.285, 2.691, 0.4395, 28.24, 8;` (DEM_weather.cc): could have users specify these
- priority: have different SSP scenarios to select from

### SSP-RCP Scenarios

Here is a list of possible scenarios: `['ssp119', 'ssp126', 'ssp245', 'ssp370', 'ssp434', 'ssp460', 'ssp534-over', 'ssp585']`. Currently, we have ssp585 as the default. Below is an explanation of each one:

- SSP1-1.9 (ssp119): A sustainability-focused pathway aiming for a low greenhouse gas concentration scenario, aiming to limit global warming to 1.5°C above pre-industrial levels by 2100. It corresponds to very strong mitigation efforts.
- SSP1-2.6 (ssp126): This scenario combines the SSP1 sustainable pathway with a radiative forcing level of 2.6 W/m² by 2100, aiming for strong mitigation strategies to limit warming.
- SSP2-4.5 (ssp245): A "middle of the road" scenario where neither significant shifts towards sustainability nor towards more fossil-fuel-intensive development occur, with radiative forcing reaching 4.5 W/m² by 2100.
- SSP3-7.0 (ssp370): A scenario of regional rivalry and less global cooperation, leading to high emissions and a radiative forcing level of 7.0 W/m² by 2100.
- SSP4-3.4 (ssp434): This scenario reflects a world with increasing inequalities, with mitigation efforts leading to a radiative forcing of 3.4 W/m².
- SSP4-6.0 (ssp460): Similar to SSP4-3.4 but with less effective mitigation efforts, resulting in higher radiative forcing of 6.0 W/m² by 2100.
- SSP5-3.4-Over (ssp534-over): An optimistic scenario assuming the use of extensive carbon dioxide removal technologies to overshoot and then reduce radiative forcing to 3.4 W/m² by 2100, despite initial high emissions.
- SSP5-8.5 (ssp585): A scenario of unchecked economic growth powered by fossil fuels, leading to the highest radiative forcing level of 8.5 W/m² by 2100.

### How to view the climate visualisations

Navigate to the climate page and select one of the 4 options:
1. bar chart
2. multi-line graph
3. ribbon graph
4. temperature graph

The left panel shows the available options for each of these graphs. Clicking on the options automatically changes the visualisation shown.

## Three Body Visualisations

### Embecosm DCM

Embecosm Model

- The forward model takes the initial state of our three planets (positions, masses, and velocities) and produce a time series of the state over a given period. This is done by using newtons law of gravitation to create equations of motion dictating the planets movements over time. We solve them using numerical methods (the runge-kutta method, implemented in dCEmbs utility module.)

- We have an “equation of motion” function evaluating the rate of change of the state, given the current state, and a main “generative model” function that iteratively applies the runge-kutta method to this to produce a time series.
- We invert the model by defining several extra parameters, including priors, the data we’re going to train on, and how this data relates to our generative model. When we add custom noises to the data we train on, this generates the posterior that we use for visualization.

### Data
- posterior generative data for noise level 0.00~0.08 (the number represents the divergence from initial position), calculated for 1,000 timesteps.


### Brainstorm

JS Visualization Libraries
- Three.js
    - ideal for custom visualizations
- Plotly.js
    - good for data science, quick graphs
- D3.js
    - more known for 2d, but can make 3d
    - suitable for complex, interactive visualizations where you also need to incorporate extensive 2D components
- ShaderGraph
    - library for linking together GLSL snippets into stand-alone shaders

## Current API
- Climate:
    - `GET /api/climate?scenario=XXX[&file=YYY]`<br>
        - `scenario`: one of `['ssp119', 'ssp126', 'ssp245', 'ssp370', 'ssp434', 'ssp460', 'ssp534-over', 'ssp585']`[(described here)](https://github.com/elizabethhsy/Climate-Foresight/tree/plotly?tab=readme-ov-file#ssp-rcp-scenarios).<br>
        - `file`: one of `['true_generative', 'pos_generative', 'pos_generative_rand', 'prior_generative_rand', 'prior_generative', 'param_covariances']` [(described here)](https://github.com/elizabethhsy/Climate-Foresight/tree/plotly?tab=readme-ov-file#embecosm-dcm). Default: `pos_generative_rand`.
    - static `GET /api/climate2/<scenario>/year/<year>/<column_name>.json`
    - static `GET /api/climate2/<scenario>/species/<specie>.json`

- 3body: This is expected to undergo significant changes, since the 3body team hasn't gotten back to me just yet...
    - static `GET /api/3body/<x>/deriv_generative.json`. x is one of `["0.00", "0.01", ..., "0.07"]` without quotes. (Trailing and leading zeroes are significant as they are statically served.)
    We can do it dynamically but this would be significantly faster in production.

## Setup

### Dependencies

- The project is designed to run on Python 3.8. This can usually be installed from your system's package manager (or from the web on Windows).
    - If Python3.8 is not set as your default Python version, ensure you use `python3.8` when setting up the virtual envionment.

### Setup Instructions

1. Clone the repository, and cd into the newly created directory.

    ```bash
    git clone https://github.com/elizabethhsy/Climate-Foresight.git
    cd Climate-Foresight
    ```

    ==TODO== setup submodules

2. Setup Python virtual enviornment and install dependencies.

    ```bash
    python3.8 -m venv env
    source env/bin/activate
    pip install -r requirements.txt
    ```

3. Setup node.js and npm, and install node dependencies.

    Ensure node and npm are installed (similarly to python, most likely from your system's package manager, or the web on Windows). This project is designed to work with node 21.6.1 - if your system uses a different version, you can either use `nvm` to setup an environment which uses 21.6.1, or simply run `npm install node@21.6.1` to install the newer version via npm.
    Finally, run the following from the project's base directory:

    ```bash
    npm install
    ```

4. Setup custom TS compiler

    ```bash
    ln bin/tsc-custom env/bin/tsc-custom
    ```

5. Ensure Django setup is complete

    ```bash
    cd src/project/
    ./manage.py migrate
    ```

    Also, if you're running in a production environment where Django's built in static file server doesn't work, run the following command:
    ```bash
    ./manage.py collectstatic
    ```
    This pulls all static files into `BASE_DIR/static`. All static files in this folder are specified as static files to be served manually, so will be served with no more effort.

6. Run the server!

    ```bash
    ./manage.py runserver
    ```

    This will run the server on the default port of 8000.
    To run on a different port, use:

    ```bash
    ./manage.py runserver 0.0.0.0:<port>
    ```
