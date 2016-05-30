#pragma once

#include <vector>

class Converter{
public:
  static bool fromChar(char c, unsigned int & value);
  static bool fromValue(unsigned int value, char & c);
  static bool isAlphaCharacter(const char & c);
  static char toLowerCase(const char & c);

  static bool getIndex(unsigned int dimension, char * inChars, unsigned int & outIndex);
  static std::vector<char> getChars(unsigned int dimension, int inIndex);

private:
  Converter();// pure static
};
