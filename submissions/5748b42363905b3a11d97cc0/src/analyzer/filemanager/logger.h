#pragma once

//#define LOG

#ifdef LOG
#define LOG(x) std::cout << x << std::endl;
#else
#define LOG(x)
#endif

