#pragma once

#include <cmath>
#include <map>
#include <string>
#include <vector>

#include <initializer_list>

#include "constants.h"
#include "tree_file_strength.h"
#include <algorithm>    // std::find
#include "file_utils.h"
#include "converter.h"

#include <stdlib.h>     /* srand, rand */
#include <iostream>     /* srand, rand */
#include "char_combination.h"
#include "combination_filewriter.h"


template <unsigned int n> class TreeFileElimination{
public:
  TreeFileElimination();
  ~TreeFileElimination();
  bool process(const TreeFileStrength<n> & inTreeFile, unsigned int threshold);
  bool contains(const Combination<n> & inCombination) const;

  template <unsigned int nn> bool eliminate(const TreeFileElimination<nn> & inOtherTreeFile);

  bool read(const std::string & inFilename);
  bool write(const std::string & inFilename) const;
  bool writeToCSV(const std::string & inFilename) const;

  void generateDummyValues(int inCount = 1000);

private:
  void reset();

  std::vector<Combination<n>> mInvalidCombinations;
  const CombinationFileWriter<n> mCombinationFileWriter;
};

#include "tree_file_elimination.tpp"
