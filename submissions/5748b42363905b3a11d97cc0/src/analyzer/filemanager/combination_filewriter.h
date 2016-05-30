#pragma once
#include <vector>
#include "char_combination.h"
#include <fstream>
#include "file_utils.h"

template <unsigned int n> class CombinationFileWriter{
public:
  CombinationFileWriter();
  ~CombinationFileWriter();
  bool write(const std::string & inFilename, std::vector<Combination<n>> inCombinations) const;
  bool writeToCSV(const std::string & inFilename, std::vector<Combination<n>> inCombinations) const;
};


#include "combination_filewriter.tpp"
