#pragma once
#include <stdint.h>

inline uint64_t os_perf_frequency();
inline uint64_t os_tick();
static string time_str(uint64_t t, uint64_t perf);


struct scoped_timer
{
    scoped_timer(const char *msg = "execution") : m(msg), t(os_tick()){}
    ~scoped_timer()
    {
        printf("%s time: %s\n", m, time_str(os_tick()-t, os_perf_frequency()).c_str());
    }
    const char *m;
    uint64_t t;
};


#if defined(_WIN32)
#define NOMINMAX
#define WIN32_LEAN_AND_MEAN
#include <Windows.h>

inline uint64_t os_perf_frequency()
{
    uint64_t timer_pf;
    QueryPerformanceFrequency(reinterpret_cast<LARGE_INTEGER*>(&timer_pf));
    return timer_pf;
}

inline uint64_t os_tick()
{
    uint64_t ts;
    QueryPerformanceCounter(reinterpret_cast<LARGE_INTEGER*>(&ts));
    return ts;
}

#else // Linux
#include <sys/time.h>

inline uint64_t os_perf_frequency()
{
    return 1000000000ULL;
}

inline uint64_t os_tick()
{
    struct timespec ts;
    clock_gettime(CLOCK_MONOTONIC, &ts);
    return ts.tv_sec * 1000000000ULL + ts.tv_nsec;
}

#endif

static string time_str(uint64_t t, uint64_t perf)
{
    uint64_t ms = (1000 * t / perf);
    string ret = to_string(ms);
    if (ms < 100)
    {
        ret += '.';
        ret += to_string((10000 * t / perf) % 10);
        if (ms < 10)
            ret += to_string((100000 * t / perf) % 10);
    }
    return ret + "ms";
}
