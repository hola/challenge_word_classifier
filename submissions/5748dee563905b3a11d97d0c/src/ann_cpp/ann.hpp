#ifndef ANN_HPP
#define ANN_HPP

#include "constants.hpp"
#include "lib/fann/fann.h"
#include <vector>
#include <string>
#include <cassert>

typedef fann_type value_t;

struct ann_dataset {
  std::vector<fann_type> input;
  std::vector<fann_type> output;
  fann_type min;  // normalization min, max
  fann_type max;
};

struct ann_user_data {
  std::string name;
  int thread_num;
  std::vector<ann_dataset> *train_datasets;
  std::vector<ann_dataset> *test_datasets;
  
  int  length;
  bool stem;
  
  value_t mean_skew_train;
  value_t mean_skew_test;
};

float ann_test(struct fann *ann, const std::vector<ann_dataset> &test_dataset);
bool save(const struct ann_user_data &udata, struct fann *ann);
bool load(const std::string &name, struct ann_user_data &udata, struct fann *&ann);

#endif /* ANN_HPP */
