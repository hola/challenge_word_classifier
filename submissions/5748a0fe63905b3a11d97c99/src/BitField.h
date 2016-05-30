#pragma once
class BitField
{
private:
  int size_;
  int bitCount_;
  std::vector<unsigned char> field_;
  //std::map<int, int> stats_;
public:
  BitField(int size);
  void set(unsigned int index);
  void reset(unsigned int index);
  bool get(unsigned int index);
  void * data() { return field_.data(); }
  int size() { return size_; }
  void clear() { memset(field_.data(), 0, size_); };
  void resize(int size);
  //int resetLowest();
};

