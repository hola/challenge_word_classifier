#include "converter.h"
#include "constants.h"
#include <cmath>

bool Converter::fromChar(char c, unsigned int & value)
{
  value = (unsigned int) c;

  if(value >= Constants::sAsciiSmallCaseMin && value <= Constants::sAsciiSmallCaseMax) // Lowercase
  {
    value -= Constants::sAsciiSmallCaseMin;
    return true;
  }

  if(value >= Constants::sAsciiUpperCaseMin && value <= Constants::sAsciiUpperCaseMax) // Uppercase
  {
    value -= Constants::sAsciiUpperCaseMin;
    return true;
  }

  if(value == Constants::sAsciiAprostrophe ) // Apostrophe
  {
    value = Constants::sAprostropheValue; // hard coded
    return true;
  }
  return false; // Invalid char
}

bool Converter::fromValue(unsigned int value, char & c)
{
  if(value == Constants::sAprostropheValue)
  {
    c = '\'';
    return true;
  }
  if(value >= 0 && value < 26)
  {
    c = (char) (value + Constants::sAsciiSmallCaseMin);
    return true;
  }
  return false;
}

bool Converter::getIndex(unsigned int dimension, char * inChars , unsigned int & outIndex)
{
  outIndex = 0;
  unsigned int _v;
  bool _ok = true;
  for(int _i(0); _i < dimension && _ok; _i++)
  {
    if(_ok = Converter::fromChar(inChars[_i], _v))
    {
      outIndex += _v * (pow(27, dimension-_i-1));
    }
  }

  return _ok;
}

std::vector<char> Converter::getChars(unsigned int dimension, int inIndex)
{
  unsigned int _remains(inIndex);
  std::vector<char> _chars;
  char _c;
  for(int _pow(dimension-1); _pow >= 0; _pow--)
  {
    unsigned int _divisor(pow(27, _pow));
    unsigned int _thisRemains (_remains % _divisor);

    Converter::fromValue((unsigned int) (_remains/pow(27, _pow)), _c);
    _chars.push_back(_c);
     _remains = _thisRemains;
  }

  return _chars;
}

bool Converter::isAlphaCharacter(const char & c)
{
  return (c >= Constants::sAsciiSmallCaseMin && c <= Constants::sAsciiSmallCaseMax)  // Lowercase
  || (c >= Constants::sAsciiUpperCaseMin && c <= Constants::sAsciiUpperCaseMax);
}

char Converter::toLowerCase(const char & c)
{
  if(c >= Constants::sAsciiUpperCaseMin && c <= Constants::sAsciiUpperCaseMax) // Uppercase
  {
    return (char) (c + (Constants::sAsciiSmallCaseMin-Constants::sAsciiUpperCaseMin));
  }
  return c;
}

