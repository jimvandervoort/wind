#!/bin/bash

/usr/bin/docker logs wind_nginx |\
  /usr/bin/sed -n '/^[0-9]/p' |\
  /usr/bin/grep 'GET / HTTP' |\
  /usr/bin/docker run --rm -i -e LANG=nginx allinurl/goaccess -a -o html --log-format COMBINED - > /root/wind/dist/stats.html
