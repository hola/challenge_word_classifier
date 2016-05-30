#pragma once

class Grams
{
private:
  typedef std::unordered_map<std::string, int> GramUMap;
  GramUMap grams_;
  BitField * bitField_;

public:
  Grams();
  ~Grams();

  void add(const char * str, int length);
  bool test(const char * str, int length);
  int limit(int limitSize);
  int size() { return (int)grams_.size(); };
  void createBitField(int size = 0);
  BitField * bitField() { return bitField_; }
  void clear();
};
