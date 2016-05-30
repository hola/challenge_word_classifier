#pragma once

template <unsigned int n> struct Combination{
public:
  Combination(const std::initializer_list<unsigned int> & inValues);
  Combination(const std::vector<unsigned int> & inValues);
  Combination();

//  bool operator==(const Combination & otherCombination) const;
  template <unsigned int nn> bool operator==(const Combination<nn> & otherCombination) const;

  unsigned int mValues[n];
private:
  unsigned int mSize;
};

template <unsigned int n> Combination<n>::Combination() :
mSize(n)
{
  std::memset(&mValues[0], 0, sizeof(unsigned int) * 3);
}

template <unsigned int n> Combination<n>::Combination(const std::initializer_list<unsigned int> & inValues):
mSize(n)
{
  int _i(0);
  for(auto _it(inValues.begin()); _it != inValues.end() && _i < mSize; _it++, _i++)
  {
      mValues[_i] = *_it;
  }
}

template <unsigned int n> Combination<n>::Combination(const std::vector<unsigned int> & inValues):
mSize(n)
{
  int _i(0);
  for(auto _it(inValues.begin()); _it != inValues.end() && _i < mSize; _it++, _i++)
  {
      mValues[_i] = *_it;
  }
}

template <unsigned int n>
template <unsigned int nn> bool Combination<n>::operator==(const Combination<nn> & otherCombination) const
{
  bool _equal (true);
  for(int _i(0); _i < std::min(n,nn) && _equal;_i++)
  {
    _equal = _equal && (mValues[_i] == otherCombination.mValues[_i]);
  }
  return _equal;
}
