#include <limits>

#include "Hashes.h"


int Hashes::getHashH37(const char * str, int length, unsigned int seed)
{
  unsigned int hash = seed;

  while (*str && length)
  {
    hash = 37 * hash + *str;
    str++;
    length--;
  }

  return hash;
}


int Hashes::getHashLy(const char * str, int length, unsigned int seed)
{
  unsigned int hash = seed;

  while (*str && length)
  {
    hash = (hash * 1664525) + (unsigned char)(*str) + 1013904223;
    str++;
    length--;
  }

  return hash;
}


int Hashes::getHashFAQ6(const char * str, int length, unsigned int seed)
{
  unsigned int hash = seed;

  while (*str && length)
  {
    hash += (unsigned char)(*str);
    hash += (hash << 10);
    hash ^= (hash >> 6);
    str++;
    length--;
  }

  hash += (hash << 3);
  hash ^= (hash >> 11);
  hash += (hash << 15);

  return hash;
}


int Hashes::getHashRot13(const char * str, int length, int seed)
{
  unsigned int hash = seed * 37;

  while (*str && length)
  {
    hash += (unsigned char)(*str);
    hash -= (hash << 13) | (hash >> 19);
    str++;
    length--;
  }

  return hash;
}
