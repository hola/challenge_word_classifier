/*
 * Hola word classifier challenge
 *
 * Gabriel Vijiala < gabriel.vijiala@gmail.com >
 * May, 2016
 */

#ifndef HOLA_BLOOM_CLASSIFIER_ERROR_H
#define HOLA_BLOOM_CLASSIFIER_ERROR_H

#include <exception>
#include <string>
struct Error : public std::exception
{
   std::string s;
    Error(std::string ss) : s(ss) {}
   ~Error() throw () {} // Updated
   const char* what() const throw() { return s.c_str(); }
};


#endif //HOLA_BLOOM_CLASSIFIER_ERROR_H
