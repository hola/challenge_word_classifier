cmake_minimum_required(VERSION 2.8)
project(WORD-CLASSIFIER)
set(CMAKE_MODULE_PATH ${CMAKE_MODULE_PATH} "${CMAKE_SOURCE_DIR}/cmake/Modules/")
set( CMAKE_VERBOSE_MAKEFILE on )

set(CMAKE_AUTOMOC ON)

SET(CMAKE_CXX_FLAGS_RELWITHDEBINFO "${CMAKE_CXX_FLAGS_RELWITHDEBINFO} -O2 -g -std=c++11 -pthread")
SET(CMAKE_CXX_FLAGS_RELEASE "${CMAKE_CXX_FLAGS_RELEASE} -O2 -std=c++11 -pthread")
SET(CMAKE_CXX_FLAGS_DEBUG "${CMAKE_CXX_FLAGS_DEBUG} -O0 -g -std=c++11 -pthread")
#SET(CMAKE_BUILD_TYPE DEBUG)
SET(CMAKE_BUILD_TYPE RELEASE)
#SET(CMAKE_BUILD_TYPE RELWITHDEBINFO)

SET(FILE_MANAGER_SRC filemanager/tree_file_strength filemanager/tree_file_strength.tpp
filemanager/utils filemanager/tree_file_elimination filemanager/constants filemanager/converter
filemanager/file_utils filemanager/tree_file_elimination.tpp filemanager/endings_analyzer filemanager/endings_analyzer.tpp
filemanager/start_analyzer filemanager/start_analyzer.tpp filemanager/settings
filemanager/char_combination filemanager/combination_filewriter filemanager/combination_filewriter.tpp
filemanager/character_occurence_analyzer filemanager/logger)
SET(SRC_FILES main)

add_executable(Analyzer ${SRC_FILES} ${FILE_MANAGER_SRC})

