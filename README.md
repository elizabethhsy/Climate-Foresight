# Climate-Foresight

## Description

Dynamic Causal Modeling is a Bayesian statistical technique for reverse 
engineering time series data. One of the ongoing challenges in applying 
such statistical models is how to visualise the multiverse of possible 
outcomes that the algorithm derives. Your goal is to create an 
evidence-based visualisation of possible climate futures that allows users 
to interrogate and compare projections from a complete simplified 
carbon-climate model within the Dynamic Causal Modeling framework.

## Dependencies

- The SRCF only runs `python3.8`, so if possible make your venv use that version of Python as well.

## Current API
- Climate:
    - `GET /api/climate?scenario=XXX[&file=YYY]`<br>
        - `scenario`: one of `['ssp119', 'ssp126', 'ssp245', 'ssp370', 'ssp434', 'ssp460', 'ssp534-over', 'ssp585']`[(described here)](https://github.com/elizabethhsy/Climate-Foresight/tree/plotly?tab=readme-ov-file#ssp-rcp-scenarios).<br>
        - `file`: one of `['true_generative', 'pos_generative', 'pos_generative_rand', 'prior_generative_rand', 'prior_generative', 'param_covariances']` [(described here)](https://github.com/elizabethhsy/Climate-Foresight/tree/plotly?tab=readme-ov-file#embecosm-dcm). Default: `pos_generative_rand`.

- 3body: This is expected to undergo significant changes, since the 3body team hasn't gotten back to me just yet...
    - `GET /api/3body?x=XXX`<br>
    where `x` is the noise introduced to `default_prior_expectations`. 
