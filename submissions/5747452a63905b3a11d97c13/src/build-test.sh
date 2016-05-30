#!/usr/bin/env bash
node build &&
    node test --dist --chart --folder=l1 &&
    node test --dist --folder=s1 &&
    node test --dist --folder=s2 &&
    node test --dist --folder=s3 &&
    node test --dist --chart --folder=l2