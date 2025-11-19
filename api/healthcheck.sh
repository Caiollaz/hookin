#!/bin/sh
PORT=${PORT:-3333}
wget --no-verbose --tries=1 --spider "http://localhost:${PORT}/health" || exit 1

