#define NOMINMAX
#define WIN32_LEAN_AND_MEAN
#include <windows.h>
#include <assert.h>
#include <limits>
#include <iostream>


#define ALIGN(sz, n) ( ((sz)+(n)-1) & (~((size_t)((n)-1))) )

class my_alloc_state
{
public:
    long long int total_alloc, total_alloc_aligned, total_free;
    uintptr_t m_addr;
    size_t m_size, m_off;
    bool m_recording;

    static my_alloc_state& singleton()
    {
        static my_alloc_state s = {0, 0, 0, 0, 0, 0, false};
        return s;
    }
    void* my_malloc(size_t size)
    {
        int sz = ALIGN(size, 8);
        total_alloc += size;
        total_alloc_aligned += sz;
        if (!m_recording)
            return ::operator new(size);
        m_off += sz;
        assert(m_off <= m_size);
        return (void*)(m_addr+m_off-sz);
    }
    void my_free(void *ptr, size_t size)
    {
        total_free += size;
        if ((uintptr_t)ptr < m_addr || (uintptr_t)ptr >= m_addr+m_size)
            ::operator delete(ptr);
        else if (m_addr == (uintptr_t)ptr)
        {
            m_addr = 0;
            m_size = m_off = 0;
            m_recording = false;
            ::VirtualFree(ptr, 0, MEM_RELEASE);
        }
    }
    void start_recording(size_t size)
    {
        m_size = ALIGN(size, 16*1024);
        m_addr = (uintptr_t)::VirtualAlloc(NULL, m_size, MEM_COMMIT|MEM_RESERVE, PAGE_READWRITE);
        m_off = 0;
        m_recording = true;
    }
    bool stop_recording(uintptr_t &addr, size_t &sz)
    {
        if (!m_recording)
            return false;
        m_recording = false;
        addr = m_addr;
        sz = m_off;
        return true;
    }
};

template <class T>
class my_alloc
{
public:
    typedef T        value_type;
    typedef T*       pointer;
    typedef const T* const_pointer;
    typedef T&       reference;
    typedef const T& const_reference;
    typedef std::size_t    size_type;
    typedef std::ptrdiff_t difference_type;

    // rebind allocator to type U
    template<class U> struct rebind
    {
        typedef my_alloc<U> other;
    };

    pointer address(reference value) const { return &value; }
    const_pointer address(const_reference value) const { return &value; }

    my_alloc() throw() {}
    my_alloc(const my_alloc&) throw() {}
    template<class U> my_alloc(const my_alloc<U>&) throw() {}
    ~my_alloc() throw() {}

    size_type max_size() const throw()
    {
        return std::numeric_limits<std::size_t>::max() / sizeof(T);
    }
    pointer allocate(size_type num, const void* = 0)
    {
        return (pointer)(my_alloc_state::singleton().my_malloc(num*sizeof(T)));
    }
    template<class T2>
    void construct(pointer p, const T2& value)
    {
        new((void*)p)T(value);
    }
    void construct(pointer p, const T& value)
    {
        new((void*)p)T(value);
    }
    void destroy(pointer p)
    {
        p->~T();
    }
    void deallocate(pointer p, size_type num)
    {
        my_alloc_state::singleton().my_free(p, num*sizeof(*p));
    }
};

// return that all specializations of this allocator are interchangeable
template <class T1, class T2>
bool operator==(const my_alloc<T1>&, const my_alloc<T2>&) throw()
{
    return true;
}
template <class T1, class T2>
bool operator!=(const my_alloc<T1>&, const my_alloc<T2>&) throw()
{
    return false;
}

template<class T>
std::pair<T*, size_t> create_copy(const T &obj)
{
    my_alloc<obj_with_padding<T> > al;
    obj_with_padding<T> *copy;
    long long s0 = my_alloc_state::singleton().total_alloc_aligned;
#if 0
    //my_alloc_state::singleton().start_recording((size_t)s0);
    copy = al.allocate(1);
    al.construct(copy, obj);
    al.destroy(copy);
    al.deallocate(copy, 1);
    long long s1 = my_alloc_state::singleton().total_alloc_aligned;
    my_alloc_state::singleton().start_recording((size_t)(s1-s0));
#else
    my_alloc_state::singleton().start_recording((size_t)700000000);
#endif
    copy = al.allocate(1);
    al.construct(copy, obj);
    uintptr_t addr;
    size_t sz;
    my_alloc_state::singleton().stop_recording(addr, sz);
    return make_pair((T*)addr, sz);
}

template<class T>
void delete_copy(T *copy, size_t size, bool do_destroy = true)
{
    my_alloc_state::singleton().m_addr = (uintptr_t)copy;
    my_alloc_state::singleton().m_size = size;
    my_alloc<T> al;
    if (do_destroy)
        al.destroy(copy);
    al.deallocate(copy, 1);
}
