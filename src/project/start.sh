#!/bin/bash -e

source /societies/climateforesight/Climate-Foresight/env/bin/activate
exec gunicorn -w 2 -b unix:/societies/climateforesight/Climate-Foresight/web.sock \
    --log-file - project.wsgi
