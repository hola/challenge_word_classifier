#pragma once


#include <cmath>
#include <map>
#include <string>
#include <vector>
#include "constants.h"
#include "char_combination.h"
#include "tree_file_strength.h"

template <unsigned int n > class StartAnalyzer : public TreeFileStrength<n> {
public:
  StartAnalyzer();
  ~StartAnalyzer();
  virtual bool analyze(const std::string & inFilename, int inNormalization) override;
};

#include "start_analyzer.tpp"
