#!/bin/sh
PID_ENT=$(ps -ef | grep vertx | grep -v grep | sed 's/\s\+/ /g' | cut -d' ' -f2)
kill $PID_ENT
