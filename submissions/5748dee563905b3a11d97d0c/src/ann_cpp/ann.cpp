#include "ann.hpp"
#include "stemmer.hpp"

#include "lib/fann/floatfann.h"
#include "lib/nlohmann_json/json.hpp"

#include <boost/filesystem.hpp>
#include <iostream>
#include <fstream>
#include <cstdio>
#include <cstdlib>
#include <string>
#include <vector>
#include <cmath>
#include <algorithm>
#include <ctime>
#include <unistd.h>
#include <omp.h>

using namespace std;
namespace fs = boost::filesystem;
using json = nlohmann::json;

vector<ann_dataset> main_datasets_full,
                    main_datasets_stem;

void halt(const char *msg) {
  cerr << "Halt: " << msg << endl;
  exit(1);
}

void create_datasets(const struct ann_user_data &user_data,
    const vector<ann_dataset> &datasets_full, vector<ann_dataset> &datasets)
{
  datasets.resize(datasets_full.size());
  for (int i = 0; i < datasets_full.size(); i++) {
    for (int j = 0; j < user_data.length; j++) {
      datasets[i].input.push_back(datasets_full[i].input[j]);
    }
    datasets[i].output = datasets_full[i].output;
  }
}

// split datasets in train / test
void split_datasets(vector<ann_dataset> &main_datasets,
                    vector<ann_dataset> &train_datasets, vector<ann_dataset> &test_datasets)
{
  int split = 0.8 * main_datasets.size();
  for (int i = main_datasets.size() - 1; i >= 0; i--) {
    if (i < split) train_datasets.push_back(main_datasets[i]);
    else           test_datasets.push_back(main_datasets[i]);  
    main_datasets.erase(main_datasets.end());
  }
}

float ann_test(struct fann *ann, const vector<ann_dataset> &test_datasets) {
  const int max_tests = 1000;
  int num_tests = 0;
  fann_type error, test_error = 0,
            error_pct, test_error_pct = 0;
  
  fann_type *input;
  fann_type *calc_out;
  fann_type true_output;
  ann_dataset test_dataset;
  
  for (int i = 0; i < test_datasets.size(); i += max(int(test_datasets.size()) / max_tests, 1)) {
    test_dataset = test_datasets[i];
    input = test_dataset.input.data();
    
    if (num_tests >= max_tests) break;
    true_output = test_dataset.output[0];
  
    calc_out = fann_run(ann, input);
    error = abs(calc_out[0] - true_output);
    test_error += error;
    
    num_tests++;
  }
  
  return (num_tests > 0) ? float(test_error) / num_tests : 0;
}

int ann_checkpoint(struct fann *ann, struct fann_train_data *data, unsigned int max_epochs,
    unsigned int epochs_between_reports, float desired_error, unsigned int epoch)
{
  float train_error, test_error;
  ann_user_data *user_data;
  static thread_local vector<fann_type> train_errors, test_errors;
  static json jdata = {};
  static fann_type best_test_error = 1;
  
  user_data = (ann_user_data*)(ann->user_data);
  train_error = ann_test(ann, *(user_data->train_datasets));
  test_error = ann_test(ann, *(user_data->test_datasets));
  
  // discard poor net  -  openmp will start new train on same thread
  {
    fann_type min_train, max_train,
              min_test,  max_test;
    
    train_errors.push_back(train_error);
    test_errors.push_back(test_error);
    
    min_train = *min_element(train_errors.begin(), train_errors.end());
    max_train = *max_element(train_errors.begin(), train_errors.end());
    min_test  = *min_element(test_errors.begin(), test_errors.end());
    max_test  = *max_element(test_errors.begin(), test_errors.end());
    
    if (  (train_errors.size() > 200 && train_errors.back() > train_errors.front()
          && max_train / min_train < 1.01 && max_test / min_test < 1.01)
       || (train_errors.size() > 20 && train_errors.back() > 2.0 * min_train))
    {
      train_errors.clear();
      test_errors.clear();
      return -1;
    }
    
    // adjust rate
    if (train_errors.size() > 30 && train_errors.back() > train_errors[train_errors.size() - 30] * 1.05) {
      fann_set_learning_rate(ann, fann_get_learning_rate(ann) * 0.1);
      train_errors.clear();
      test_errors.clear();
    }
    
    if (train_errors.size() > 200) {
      train_errors.erase(train_errors.begin());
      test_errors.erase(test_errors.begin());
    }
  }
  
  #pragma omp critical
  {
    if (test_error < best_test_error) {
      best_test_error = test_error;
      if (save(*user_data, ann))
           cout << "Saved best net so far, test error: " << best_test_error << endl;
      else cout << "Failure: saving net failed." << endl;
    }
  }
  
  return 0;
}

void train() {
  const float desired_error = 0.0;
  const unsigned int max_epochs = 10000;
  const unsigned int epochs_between_reports = 1;
  
  struct fann_train_data *data;
  vector<ann_dataset> main_datasets, train_datasets, test_datasets;
  
  struct ann_user_data udata;
  udata.name            = "net_name";
  udata.train_datasets  = &train_datasets;
  udata.test_datasets   = &test_datasets;
  udata.length          = 25;
  udata.stem            = true;

  int h1 = 10,
      h2 = 75,
      h3 = 120,
      h4 = 45;
  
  // create datasets
  create_datasets(udata, (udata.stem ? main_datasets_stem : main_datasets_full), main_datasets);
  split_datasets(main_datasets, train_datasets, test_datasets);
  
  data = fann_create_train_noalloc(train_datasets.size(),
      train_datasets[0].input.size(), train_datasets[0].output.size());
  
  for (int i = 0; i < train_datasets.size(); i++) {
    data->input[i] = train_datasets[i].input.data();
    data->output[i] = train_datasets[i].output.data();
  }
  fann_shuffle_train_data(data);

  #pragma omp parallel for
  for (int i = 0; i < 50; i++) {
    struct fann *ann;
    struct ann_user_data udata_local = udata;
    unsigned int num_layers;
    num_layers = 6;
    ann = fann_create_standard(num_layers, train_datasets[0].input.size(),
	       h1, h2, h3, h4, train_datasets[0].output.size());
    
    fann_set_activation_function_hidden(ann, FANN_SIGMOID_SYMMETRIC);
    fann_set_activation_function_output(ann, FANN_SIGMOID_SYMMETRIC);
    
    fann_set_training_algorithm(ann, FANN_TRAIN_INCREMENTAL);
    fann_set_callback(ann, fann_callback_type(&ann_checkpoint));
    fann_set_learning_rate(ann, 0.01);
    fann_set_learning_momentum(ann, 0.9);
    
    udata_local.thread_num = omp_get_thread_num();
    ann->user_data = &udata_local;
    
    cout << "Start train for net " << i << endl;
    fann_train_on_data(ann, data, max_epochs, epochs_between_reports, desired_error);
    
    fann_destroy(ann);
  }
}

bool save(const struct ann_user_data &udata, /*const*/ struct fann *ann) {
  string dirname;
  ofstream file;
  json jdata = {};
  
  jdata = {
    {"name",              udata.name},
    {"length",            udata.length},
    {"stem",              udata.stem}
  };
  
  // create container directory
  dirname = string("nets/") + (udata.name != "" ? udata.name : "default_name") + ".d" + "/";
  if (! fs::exists(dirname)) {
    fs::create_directories(dirname);
  }
  
  // save JSON data
  file = ofstream(dirname + "data.json");
  file << jdata.dump();
  file.close();
  
  // save ANN
  fann_save(ann, (dirname + "fann.net").c_str());
  
  return true;
}

bool load(const string &name, struct ann_user_data &udata, struct fann *&ann) {
  string dirname = string("nets/") + name + ".d" + "/";
  ifstream file;
  string rawfile;
  json jdata = {};
  
  if (! fs::exists(dirname)) {
    cerr << "Cannot load: directory \"" + dirname + "\" does not exist." << endl;
    return false;
  }
  
  // load JSON data
  file = ifstream(dirname + "data.json");
  file >> rawfile;
  file.close();

  jdata = json::parse(rawfile);
  udata.name    = jdata["name"];
  udata.length  = jdata["length"];
  udata.stem    = jdata["stem"];
  
  // load ANN
  ann = fann_create_from_file((dirname + "fann.net").c_str());
  if (! ann) {
    cerr << "Failed to load FANN net file." << endl;
    return false;
  }
  
  return true;
}

bool load_data_only(const string &name, struct ann_user_data &udata) {
    struct fann *ann;
    bool r;
    
    r = load(name, udata, ann);
    fann_destroy(ann);
    return r;
}

value_t normalize_char(char c) {
  value_t v = 0;
  
  /*v = (str[j] - 'a') / value_t('z' - 'a') * 1.8 - 0.9;
   *           if (str[j] == '\'') v = 1;*/
  switch (c) {
    case 'a': v = -0.9 + 1.8 / 29 * 0 ; break;
    case 'e': v = -0.9 + 1.8 / 29 * 1 ; break;
    case 'i': v = -0.9 + 1.8 / 29 * 2 ; break;
    case 'o': v = -0.9 + 1.8 / 29 * 3 ; break;
    case 'u': v = -0.9 + 1.8 / 29 * 4 ; break;
    case 'y': v = -0.9 + 1.8 / 29 * 5 ; break;
    case 'b': v = -0.9 + 1.8 / 29 * 6 ; break;
    case 'c': v = -0.9 + 1.8 / 29 * 7 ; break;
    case 'd': v = -0.9 + 1.8 / 29 * 8 ; break;
    case 'f': v = -0.9 + 1.8 / 29 * 9 ; break;
    case 'g': v = -0.9 + 1.8 / 29 * 10 ; break;
    case 'h': v = -0.9 + 1.8 / 29 * 11 ; break;
    case 'j': v = -0.9 + 1.8 / 29 * 12 ; break;
    case 'k': v = -0.9 + 1.8 / 29 * 15 ; break;
    case 'l': v = -0.9 + 1.8 / 29 * 16 ; break;
    case 'm': v = -0.9 + 1.8 / 29 * 17 ; break;
    case 'n': v = -0.9 + 1.8 / 29 * 18 ; break;
    case 'p': v = -0.9 + 1.8 / 29 * 19 ; break;
    case 'q': v = -0.9 + 1.8 / 29 * 20 ; break;
    case 'r': v = -0.9 + 1.8 / 29 * 21 ; break;
    case 's': v = -0.9 + 1.8 / 29 * 22 ; break;
    case 't': v = -0.9 + 1.8 / 29 * 23 ; break;
    case 'v': v = -0.9 + 1.8 / 29 * 24 ; break;
    case 'w': v = -0.9 + 1.8 / 29 * 25 ; break;
    case 'x': v = -0.9 + 1.8 / 29 * 26 ; break;
    case 'z': v = -0.9 + 1.8 / 29 * 27 ; break;
    case '\'':v = -0.9 + 1.8 / 29 * 29 ; break;
  }
  
  return v;
}

int main(int argc, char **argv) {
  // load words lists
  {
    ifstream infile;
    string str;
    int i = -1;
    
    /* -1:           NULL
     *[-0.9, +0.9]:  [a,z]
     * +1:           '
     */
    infile = ifstream("./words.lst");
    while (getline(infile, str)) {
      i++;
      main_datasets_full.resize(i + 1);
      main_datasets_full[i].input.assign(MAX_STRING_LENGTH, EMPTY_CHAR);
      for (int j = 0; j < str.length(); j++) {
        if (str[j] == ' ') {
          if (str.find(" true") == std::string::npos)
               main_datasets_full[i].output.push_back(-1);
          else main_datasets_full[i].output.push_back(+1);
          // create stem datasets
          {
            string word = str.substr(0, str.find(" "));
            word.resize(min(MAX_STRING_LENGTH, int(word.length())));
            word = stem::stem(word);
            main_datasets_stem.push_back(main_datasets_full[i]);
            for (int k = 0; k < MAX_STRING_LENGTH; k++) {
              if (k < word.length())
                   main_datasets_stem[i].input[k] = normalize_char(word[k]);
              else main_datasets_stem[i].input[k] = EMPTY_CHAR;
            }
          }
          break;
        }
        if (j < MAX_STRING_LENGTH) {
          main_datasets_full[i].input[j] = normalize_char(str[j]);
        }
      }
    }
    infile.close();
  }

  train();
  
  cout << "Training completed." << endl;
 }
