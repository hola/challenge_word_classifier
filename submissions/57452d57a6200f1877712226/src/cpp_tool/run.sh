#!/bin/bash

function printLine {
    printf '%80s\n' | tr ' ' $1
}

while true; do
    printLine -
    date
    ./hola
done
