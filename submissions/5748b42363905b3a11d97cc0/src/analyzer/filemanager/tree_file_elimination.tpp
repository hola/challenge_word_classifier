#include "tree_file_elimination.h"

template <unsigned int n> TreeFileElimination<n>::TreeFileElimination() :
mCombinationFileWriter()
{

}

template <unsigned int n> TreeFileElimination<n>::~TreeFileElimination()
{

}

template <unsigned int n> bool TreeFileElimination<n>::read(const std::string & inFilename)
{

}

template <unsigned int n> bool TreeFileElimination<n>::write(const std::string & inFilename) const
{
  mCombinationFileWriter.write(inFilename, mInvalidCombinations);
}

template <unsigned int n> bool TreeFileElimination<n>::writeToCSV(const std::string & inFilename) const
{
  mCombinationFileWriter.writeToCSV(inFilename, mInvalidCombinations);
}

template <unsigned int n> void TreeFileElimination<n>::generateDummyValues(int inCount)
{
  reset();
  for(int _i(0); _i < inCount; _i++)
  {
    mInvalidCombinations.push_back({(unsigned int) (rand()%27),(unsigned int) (rand()%27),(unsigned int) (rand()%27)});
  }
}

template <unsigned int n> void TreeFileElimination<n>::reset()
{
  mInvalidCombinations.clear();
}

template <unsigned int n> bool TreeFileElimination<n>::contains(const Combination<n> & inCombination) const
{
  if(std::find(mInvalidCombinations.begin(), mInvalidCombinations.end(), inCombination) != mInvalidCombinations.end())
  {
    return true;
  }
  return false;
}


#include <iostream>
template <unsigned int n> bool TreeFileElimination<n>::process(const TreeFileStrength<n> & inTreeFile, unsigned int inThreshold /*= 0*/)
{
  const unsigned int * _data = inTreeFile.getData();
  unsigned int _v;
  for(int _i(0); _i < pow(27, n); _i++)
  {

    if(_data[_i] <= inThreshold)
    {
      std::vector<char> _chars(Converter::getChars(n, _i));
      std::vector<unsigned int> _convertedChars;

      for(auto _it(_chars.begin()); _it != _chars.end(); _it++)
      {
        if(!Converter::fromChar(*_it, _v))
        {
          std::cerr << "Fatal error !" << std::endl;
          std::exit(1);
        }
        _convertedChars.push_back(_v);
      }
      mInvalidCombinations.push_back(_convertedChars);
    }
  }
}


template <unsigned int n>
template <unsigned int nn> bool TreeFileElimination<n>::eliminate(const TreeFileElimination<nn> & inOtherTreeFile)
{
  int _combinationCount(n-nn+1);
  Combination<nn> _combinations[_combinationCount];

  for(auto _it(mInvalidCombinations.begin()); _it != mInvalidCombinations.end(); )
  {
    for(int _startOffset(0); _startOffset < _combinationCount; _startOffset++)
    {
      for(int _i(_startOffset); _i < _startOffset + nn; _i++)
      {
        _combinations[_startOffset].mValues[_i-_startOffset] = _it->mValues[_i];
      }
    }
    bool _keep(true);
    for(int _i(0); _i < _combinationCount && _keep; _i++)
    {
      _keep = _keep && !inOtherTreeFile.contains(_combinations[_i]);
    }

    if(!_keep)
    {
      _it = mInvalidCombinations.erase(_it);
    }
    else
    {
      _it++;
    }
  }
}
