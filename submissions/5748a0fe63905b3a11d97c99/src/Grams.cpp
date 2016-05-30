#include <map>
#include <unordered_map>
#include <string>

#include "Hashes.h"
#include "BitField.h"
#include "Grams.h"

Grams::Grams() :
  bitField_(NULL)
{

}

Grams::~Grams()
{
  if (bitField_)
    delete bitField_;
}

void Grams::add(const char * str, int length)
{
  grams_[std::string(str, length)]++;
}

int Grams::limit(int limitSize)
{
  typedef std::multimap<int, GramUMap::iterator> SortedGrams;
  SortedGrams sortedGrams;

  for (GramUMap::iterator it = grams_.begin(); it != grams_.end(); ++it)
    sortedGrams.insert(std::make_pair(it->second, it));

  for (SortedGrams::iterator it = sortedGrams.end(); it != sortedGrams.begin();)
  {
    --it;

    if (!limitSize)
      grams_.erase(it->second);
    else
      limitSize--;
  }

  return sortedGrams.size() - grams_.size();
}

bool Grams::test(const char * str, int length)
{
  if (bitField_)
    return bitField_->get(Hashes::getHashLy(str, length));
  else
    return grams_.find(std::string(str, length)) != grams_.end();
}

void Grams::createBitField(int size)
{
  if (!size)
    size = grams_.size() / 4;

  if (bitField_)
    delete bitField_;

  bitField_ = new BitField(size);

  for (GramUMap::iterator it = grams_.begin(); it != grams_.end(); ++it)
    bitField_->set(Hashes::getHashLy(it->first.c_str()));
}

void Grams::clear()
{
  grams_.clear();

  if (bitField_)
    delete bitField_;

  bitField_ = NULL;
}
