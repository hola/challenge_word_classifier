#include "file_utils.h"
#include <iostream>
#include <cmath>
#include "converter.h"
#include <string>
#include "logger.h"

#define MAX_8_BITS 256
#define MAX_16_BITS 65536

/*************
 * BIN UTILS *
 *************/
void FileUtils::insertPadding(unsigned char * data, int from, int to)
{
    for(int i(from); i < to; i++)
        data[i] = 0x00;
}

unsigned char* FileUtils::toBin(unsigned int value, int n_bytes)
{
    unsigned char* ret = new unsigned char[n_bytes];
    int byte_index(0);
    // First the padding
    if(n_bytes > 4)
    {
        insertPadding(ret, 0, n_bytes-4);
        byte_index += (n_bytes-4);
    }

    // Now the data
    int remaining_bytes(std::min(n_bytes, 4));
    for(int i(0); i < remaining_bytes; i++)
    {
        unsigned char data ( (value >> ((remaining_bytes-1-i)*8)) & int(0x00000FF));
        ret[byte_index++] = data;
    }

    return ret;
}

/**
  Very simple modeling of floating point values where the first 16 bits represent the integral part and the next 16 bits represent
  the fractional part.
 * @brief Binutils::toBin
 * @param value
 * @param n_bytes
 * @return
 */
unsigned char* FileUtils::toBin(float value, int n_bytes)
{
    if(n_bytes < 4)
    {
        std::cerr << "Can't represent a float in " << n_bytes << " bytes";
        exit(1);
    }

    unsigned char* ret = new unsigned char[n_bytes];
    int byte_index(0);

    // first the padding
    // First the padding
    if(n_bytes > 4)
    {
        insertPadding(ret, 0, n_bytes-4);
        byte_index += (n_bytes-4);
    }

    // Now the data
    unsigned int integral_part(value);
    unsigned int fractional_part;
    {
        float tmp_fractional_part(value-integral_part + 1.0f);

        while((tmp_fractional_part*10) < MAX_16_BITS)
            tmp_fractional_part *= 10;
        fractional_part = (unsigned int) tmp_fractional_part;
    }

    unsigned char * bin_integral_part (toBin(integral_part,2)) ;
    unsigned char * bin_fractional_part (toBin(fractional_part, 2));

//    std::cout << "integral_part " << integral_part << std::endl;
//    std::cout << "fractional " << fractional_part << std::endl;

    ret[byte_index++] = bin_integral_part[0];
    ret[byte_index++] = bin_integral_part[1];
    ret[byte_index++] = bin_fractional_part[0];
    ret[byte_index++] = bin_fractional_part[1];

    delete [] bin_integral_part;
    delete [] bin_fractional_part;

    return ret;
}

int FileUtils::readInt32(unsigned char * data, int n_bytes)
{
    int value(0);

    int padding_bytes(std::max(0,n_bytes-4));

    int remaining_bytes(n_bytes-padding_bytes);
    int coefficient((remaining_bytes-1)*8);
    for(int i(0); i < remaining_bytes; i++,coefficient -= 8)
    {
        value += (data[i+padding_bytes] * pow(2, coefficient));
    }

    return value;
}

float FileUtils::readFloat32(unsigned char * data, int n_bytes)
{
    if(n_bytes < 4)
    {
        std::cerr << "Can't represent a float in " << n_bytes << " bytes";
        exit(1);
    }

    unsigned char bin_integral_part[2] = {data[n_bytes-4], data[n_bytes-3]};
    unsigned char bin_fractional_part[2] = {data[n_bytes-2], data[n_bytes-1]};

    int integral_part(readInt32(bin_integral_part,2));
    float fractional_part(readInt32(bin_fractional_part,2));

    while(fractional_part > 2)
        fractional_part /= 10;

    fractional_part -= 1.0f;

    return (integral_part+fractional_part);
}

bool FileUtils::open(const std::string & inFilename, std::ios_base::openmode inOpenMode, std::ifstream & outFile)
{
  outFile.open(inFilename.c_str(), inOpenMode );

  return outFile.is_open();
}


bool FileUtils::open(const std::string & inFilename, std::ios_base::openmode inOpenMode, std::ofstream & outFile)
{
  outFile.open(inFilename.c_str(), inOpenMode );

  return outFile.is_open();
}

const std::set<char> FileUtils::sVowels = FileUtils::getVowels();
bool FileUtils::getVowelStatistics(const std::string & inFilename, double & outMeanVowelRatio, double & outVowelSD)
{
  std::ifstream _file;
  if(FileUtils::open(inFilename, std::ios_base::in | std::ios_base::ate, _file))
  {
    unsigned int _nVowels= 0;
    unsigned int _totalVowelCount = 0;
    unsigned int _totalCharCount = 0;

    std::vector<std::string> _words;
    std::vector<unsigned int> _vowelCounts;
    std::string _currentWord;
    std::streampos _size = _file.tellg(); // Get size
    _file.seekg(0, std::ios_base::beg); // Go back to beginning
    char _c;
    while(_file.tellg() < _size)
    {
      if(_file.tellg() % 1000 == 0)
      {
        LOG(std::to_string((1.0*_file.tellg() / _size) * 100) << " %");
      }
      _file.read(&_c, 1);
      if(_c == '\n')
      {
        _words.push_back(_currentWord);
        _vowelCounts.push_back(_nVowels);
        _currentWord.clear();
        _nVowels = 0;
      }
      else if(Converter::isAlphaCharacter(_c))
      {
        _totalCharCount++;
        _currentWord += _c;
        if(sVowels.find(Converter::toLowerCase(_c)) != sVowels.end())
        {
          _totalVowelCount++;
          _nVowels++;
        }
      }
    }
    _file.close();

    if(_vowelCounts.size() != _words.size())
    {
      std::cerr << "Should be equal! FATAL ERROR " << std::endl;
      exit(1);
    }

    outMeanVowelRatio = (_totalVowelCount*1.0)/_totalCharCount;

    double _squaredDiff = 0;
    for(int _i(0); _i < _words.size(); _i++)
    {
      double _vowelRatio = (1.0 * _vowelCounts.at(_i))/_words.at(_i).length();
      _squaredDiff += pow(outMeanVowelRatio-_vowelRatio, 2);
    }
    _squaredDiff /= _words.size();

    outVowelSD = sqrt(_squaredDiff);
    return true;
  }
  return false;
}

bool FileUtils::getStatistics(const std::string & inFilename, int & outMaxLength, std::string & outLongestWord,
  double & outMeanLength, double & outSD)
{
  std::vector<std::string> _words;
  outMaxLength = 0;
  double _lengthSum;
  std::ifstream _file;
  if(FileUtils::open(inFilename, std::ios_base::in | std::ios_base::ate, _file))
  {
    std::streampos _size = _file.tellg(); // Get size
    _file.seekg(0, std::ios_base::beg); // Go back to beginning
    int _currentLength = 0;
    std::string _currentWord;
    char _c;
    while(_file.tellg() < _size)
    {
      _file.read(&_c, 1);
      if(_c != '\n')
      {
        _currentWord += _c;
        _currentLength++;
      }
      else
      {
        if(_currentLength > outMaxLength)
        {
          outMaxLength = _currentLength;
          outLongestWord = _currentWord;
        }
        _lengthSum += _currentLength;
        _words.push_back(_currentWord);
        _currentWord.clear();
        _currentLength = 0;
      }
    }
    _file.close();
    outMeanLength = _lengthSum/_words.size();

    // Standard deviation
    double _squaredDiff = 0;
    for(auto _it(_words.begin()); _it != _words.end(); _it++)
    {
      _squaredDiff += pow(_it->length() - outMeanLength, 2);
    }
    _squaredDiff /= _words.size();
    outSD = std::sqrt(_squaredDiff);

    return true;
  }
  return false;
}

std::string FileUtils::getLongestWord(const std::string & inFilename, int & inLength)
{
  std::string _longestWord("");
  inLength = 0;
  std::ifstream _file;
  if(FileUtils::open(inFilename, std::ios_base::in | std::ios_base::ate, _file))
  {
    std::streampos _size = _file.tellg(); // Get size
    _file.seekg(0, std::ios_base::beg); // Go back to beginning
    int _currentLength = 0;
    std::string _currentWord;
    char _c;
    while(_file.tellg() < _size)
    {
      _file.read(&_c, 1);
      if(_c != '\n')
      {
        _currentWord += _c;
        _currentLength++;
      }
      else
      {
        if(_currentLength > inLength)
        {
          inLength = _currentLength;
          _longestWord = _currentWord;
        }
        _currentWord.clear();
        _currentLength = 0;
      }
    }
    _file.close();
  }
  return _longestWord;
}

std::set<char> FileUtils::getVowels()
{
  std::set<char> _vowels;
  _vowels.insert('a');
  _vowels.insert('e');
  _vowels.insert('i');
  _vowels.insert('o');
  _vowels.insert('u');

  return _vowels;
}

#include <sys/types.h>
#include <sys/stat.h>
#include <stdio.h>
#include <stdlib.h>

bool FileUtils::dirExists(const char *path)
{
    struct stat info;

    if(stat( path, &info ) != 0)
        return false;
    else if(info.st_mode & S_IFDIR)
        return true;

    return false;
}

