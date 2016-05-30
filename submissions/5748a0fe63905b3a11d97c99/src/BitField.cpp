#include <memory>
#include <vector>
#include <map>

#include "BitField.h"


BitField::BitField(int size) : 
  size_(size), 
  bitCount_(size * 8), 
  field_((size_t)size, (unsigned char)0)
{
}


void BitField::set(unsigned int index)
{
  index %= bitCount_;
  int bytePos = index / 8;
  int bitPos = index % 8;
  field_[bytePos] |= (1 << bitPos);
  //stats_[index]++;
}


void BitField::reset(unsigned int index)
{
  index %= bitCount_;
  int bytePos = index / 8;
  int bitPos = index % 8;
  field_[bytePos] &= ~(1 << bitPos);
}


bool BitField::get(unsigned int index)
{
  index %= bitCount_;
  int bytePos = index / 8;
  int bitPos = index % 8;

  return (field_[bytePos] & (1 << bitPos)) != 0;
}

void BitField::resize(int size)
{
  size_ = size;
  bitCount_ = size * 8;
  field_.clear();
  field_.resize(size, 0);
}


//int BitField::resetLowest()
//{
//  int lowestKey = 0;
//  int lowestVal = INT_MAX;
//
//  for (std::map<int, int>::iterator it = stats_.begin(); it != stats_.end(); ++it)
//  {
//    if (it->second < lowestVal)
//    {
//      lowestKey = it->first;
//      lowestVal = it->second;
//    }
//  }
//
//  //stats_.erase(lowestKey);
//  //reset(lowestKey);
//  int eraseCount = 0;
//
//  for (std::map<int, int>::iterator it = stats_.begin(); it != stats_.end();)
//  {
//    if (it->second == lowestVal)
//    {
//      reset(it->first);
//      std::map<int, int>::iterator eraseIt = it;
//      ++it;
//      stats_.erase(eraseIt);
//      eraseCount++;
//    }
//    else
//      ++it;
//  }
//
//  return eraseCount;
//}
