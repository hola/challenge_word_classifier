cmake_minimum_required(VERSION 2.5)
project(hola_bloom_classifier)

set(CMAKE_CXX_FLAGS "${CMAKE_CXX_FLAGS} -std=c++11 -O2 -Wall")

set(SOURCE_FILES main.cpp Data.cpp Data.h Encoder.cpp Encoder.h Scorer.cpp Scorer.h Error.h Utils.h Breeder.h)
add_executable(hola_bloom_classifier ${SOURCE_FILES})