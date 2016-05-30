# Require:
# libboost-filesystem-dev
# boost_thread, boost_system

all:
	# -pg for profiling
	# -fprofile-generate, -fprofile-use
	g++ -o ann -march=native -O3 -funroll-loops -flto -std=c++11 -fopenmp \
	ann.cpp \
	lib/fann/floatfann.c \
	-lboost_filesystem \
	-lboost_thread \
	-lboost_system
