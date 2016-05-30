#pragma once
class Hashes
{
private:
  Hashes() {};
  ~Hashes() {};

public:
  static int getHashH37(const char * str, int length = INT_MAX, unsigned int seed = 0x7F7F7F7F);
  static int getHashLy(const char * str, int length = INT_MAX, unsigned int seed = 19);
  static int getHashFAQ6(const char * str, int length = INT_MAX, unsigned int seed = 0);
  static int getHashRot13(const char * str, int length = INT_MAX, int seed = 0);
};

