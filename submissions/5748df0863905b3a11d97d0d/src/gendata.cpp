/*******************************************************************************
                     Word Classifier Database Generator
                           Last edited on 27-May-2016
          (C) Copyright by Dimitry Rotstein. All rights reserved
Notes:
 - This code uses the Elgrint library (http://miranor.com/elgrint)
 - This code can be compiled online using Miranor Cloud Compilation service:
   http://miranor.com/elgrint/compile.php (for MS-Windows only)
 - To run the program, "words.txt" and "exclude.txt" files
   must be located in the directory specified by the 'dir' constant below
 + The generated database is a sequence of 3 lists, as follows:
   - L0: 20-bit word signatures of all words with lengths in the [5,15] range
   - L1: Rarest 2- and 3-letter combinations in the dictionary (see "exclude.txt")
   - L2: Actual words with lengths in the [1,4] range (4 is partial)

********************************************************************************/
#include <elgrint.cpp>

// Constants
const MString dir     = "./";                             // Working directory
const MString GZipExe = "C:/Program Files/7-Zip/7z.exe";  // Location of the GZIP program (may not work with anything but '7z')
UInt32 c2 = 11283;                                        // Size of L2 (variable to adjust it to the 64KiB range) via trial and error

// Auxiliary function - sorts a vector, removing all the duplicates
//
template <class T>
void unique(MVector<T>& s)
{
  s.sort();
  typename MVector<T>::Iter it1(s), it2(s,1);
  for ( ; it2(); ++it2) if (*it2 != *it1) { ++it1; *it1 = *it2; }
  s.setCnt(it1.getPos()+1,0);
}


// Auxiliary function - converts a char to bit index for L0.
// The index specifies the bit that represents this char in the word signature
// The conversion is selected so that more frequently occurring chars have
// smaller indices (this improves the compression rate) and then optimized
// by variating index pairs until a local extremum point is reached
// Some chars share indices to reduce the signature size to 19 bits
// Index 0 is reserved for the length parity bit
//
UInt32 ch2int0(MChar ch)
{
  switch (ch)
  {
    case '*': return 0;
    case 's': return 1;
    case 'e': return 3;
    case 'a': return 2;
    case 'i': return 6;
    case 'o': return 4;
    case 'r': return 5;
    case 'n': return 7;
    case 'l': return 8;
    case 't': return 11;
    case 'u': return 9;
    case 'c': return 10;
    case 'h': return 12;
    case 'k': return 12;
    case 'f': return 13;
    case 'm': return 13;
    case 'p': return 15;
    case 'v': return 15;
    case 'd': return 14;
    case 'w': return 19;
    case'\'': return 19;
    case 'g': return 17;
    case 'z': return 17;
    case 'x': return 18;
    case 'y': return 18;
    case 'b': return 16;
    case 'j': return 16;
    case 'q': return 16;
    default : return 32;
  }
}


// Auxiliary function - converts char to bit index for L1
// Unlike L0 there's no degeneration here. Since L1 contains the rarest
// letter sequences, this ordering is largely a reversal of that in 'ch2int0'
// No 0 index here - it's reserved for the null terminator in 2-letter words
//
UInt32 ch2int1(MChar ch)
{
  switch (ch)
  {
    case 'q': return 2;
    case 'j': return 3;
    case 'x': return 1;
    case'\'': return 4;
    case 'v': return 5;
    case 'z': return 6;
    case 'w': return 7;
    case 'f': return 8;
    case 'k': return 9;
    case 'g': return 11;
    case 'b': return 10;
    case 'p': return 12;
    case 'h': return 13;
    case 'm': return 15;
    case 'd': return 14;
    case 'c': return 16;
    case 'n': return 17;
    case 't': return 18;
    case 'l': return 19;
    case 'y': return 21;
    case 'r': return 20;
    case 's': return 22;
    case 'u': return 24;
    case 'i': return 23;
    case 'o': return 26;
    case 'e': return 25;
    case 'a': return 27;
    default : return 32;
  }
}

// Auxiliary function - converts char to bit index for L2
// The conversion is selected so that more frequently occurring chars
// (in 2-4-letter words only) have smaller indices
// No 0 index here - it's reserved for the null terminator in 2-3-letter words
//
UInt32 ch2int2(MChar ch)
{
  switch (ch)
  {
    case 'a': return 2;
    case 'e': return 1;
    case 's': return 4;
    case 'o': return 3;
    case 'i': return 5;
    case 'r': return 6;
    case 't': return 7;
    case 'l': return 8;
    case 'n': return 9;
    case 'd': return 11;
    case 'c': return 10;
    case 'm': return 12;
    case 'u': return 13;
    case 'p': return 14;
    case 'b': return 15;
    case 'h': return 17;
    case 'g': return 16;
    case 'y': return 18;
    case 'k': return 20;
    case 'f': return 19;
    case 'w': return 21;
    case 'v': return 22;
    case 'j': return 23;
    case 'z': return 24;
    case 'x': return 25;
    case'\'': return 26;
    case 'q': return 27;
    default : return 32;
  }
}



// Main function
//
void MAppMain()
{
  MString str;                  // Program's output
  MVector<UInt32> L0, L1, L2;   // Database lists
// Encode List 1 (2-3-letter combinations from "exclude.txt")
  MStrings exc;
  MTextFile(dir+"/exclude.txt").readAll().parseTo(exc,"\r\n");
  for (MStrings::CIter it(exc); it(); ++it)
  {
    const MString& s = (*it).convToLower();
    if (s.cnt() == 2)
      L1.append(ch2int1(s[0]) + ch2int1(s[1])*28);
    else if (s.cnt() == 3)
      L1.append(ch2int1(s[0]) + ch2int1(s[1])*28 + ch2int1(s[2])*784);
  }
// Encode List 0 and List 2 (converted to lowercase in the process)
  MStrings words;
  MTextFile(dir+"/words.txt").readAll().parseTo(words,"\r\n");  // Load dictionary
  for (MStrings::CIter it(words); it(); ++it)
  {
    const MString s = (*it).convToLower();
  // Encode 1-4-length words to List 2 (as is, no signatures)
    if (s.cnt() >= 1 && s.cnt() <= 4)
    {
      if (s.cnt() == 1)
        L2.append(ch2int2(s[0]));
      else if (s.cnt() == 2)
        L2.append(ch2int2(s[0]) + ch2int2(s[1])*28);
      else if (s.cnt() == 3)
        L2.append(ch2int2(s[0]) + ch2int2(s[1])*28 + ch2int2(s[2])*784);
      else if (s.cnt() == 4)
        L2.append(ch2int2(s[0])     + ch2int2(s[1])*28 +
                  ch2int2(s[2])*784 + ch2int2(s[3])*21952);
    }
  // Skip words with "wrong" lengths (<5 - handled above, >15 - too few to care)
    if (s.cnt() < 5 || s.cnt() > 15) continue;
  // Encode 5-15-length words to List 0 as signatures
    UInt32 sig = (1-s.cnt()%2)<<ch2int0('*');           // Encode length bit (Note: produces a slightly smaller database than "s.cnt()%2")
    for (MNum i = 0; i < s.cnt(); ++i)  // Encode 19 letter bits
      sig |= (1 << ch2int0(s[i]));
    L0.append(sig);
  }
// Sort and merge the lists
  unique(L0);
  unique(L1);
  unique(L2); L2.setCnt(c2,0);
  MVector<UInt32> L = L0;                  // Merged list
  L.append(L1);
  L.append(L2);
// Calculate element differences (at lists' edges add initial element)
  MVector<UInt32> diffs;
  for (MNum i = 1; i < L.cnt(); ++i)
    if (L.get(i) > L.get(i-1))
      diffs.append(L.get(i) - L.get(i-1));
// Encode 'diffs' as optimized bitmaps (in a string form for convenience)
// Each diff value is encoded as "0..01n..n": 'z' zeroes, followed by 1,
// followed by bitmap of the 'x-a' number, where 'x' is the diff and 'a' is
// the nearest (smaller or equal) to 'x' power of 2
  MString bits;
  for (MNum i = 0; i < diffs.cnt(); ++i)
  {
    UInt32 d = diffs.get(i);
    for (UInt32 z = 0; ; ++z)
    {
      UInt32 a = (1<<z), b = a*2-1;   // [a,b] - suitable range of 'd' to process
      if (d<a || d>b) continue;       // Outside of proper range - keep looking
      for (UInt32 k = 0; k < z; ++k)
        bits << '0';
      bits << '1';
      for (UInt32 k = 0; k < z; ++k)
        bits << (GetBits(d-a,UInt8(k),UInt8(k))?'1':'0');
      break;
    }
  }
  while (bits.cnt()%8) bits << '0';   // Pad with zeroes to complete the last byte
// Encode the intermediary 'bits' string to actual bit vector
  MVector<UInt8> bytes;
  for (MNum i = 0; i < bits.cnt(); i+=8)
  {
    UInt8 b = 0;
    for (MNum j = 0; j < 8; ++j) if (bits[i+j]=='1') b |= (1<<j);
    bytes.append(b);
  }
// Save the data to the file and compress it, if 7z is available at the sprcified location
  MFile(dir+"/data",fmOverwrite) << bytes;
  if (MSys::getFileInfo(GZipExe).name.cnt())
  {
    MSys::deleteFile(dir+"/data.gz");
    MSys::open(GZipExe, (MString)"a -tgzip -mx=9 -sdel \""+dir+"/data.gz\" \""+dir+"/data\"");
  }
// Compile some useful information (needed for hardcoding in the Node.js file)
 // Prepare sizes
  int size1 = 0;
  while (!size1)
  {
    MApp::sleep(500);
    size1 = (UInt32)MSys::getFileInfo(dir+"/data.gz").size;
  }
  int size2 = (int)MSys::getFileInfo(dir+"/solution.js").size;
 // Initial elements and sizes
  str <<"w=["<<L0.get(0)<<","<<L1.get(0)<<","<<L2.get(0)<<","
      <<L0.cnt()<<","<<L1.cnt()<<","<<L2.cnt()<<"]\n";
 // Letter->index conversion string for L0
  str<<"C0: \" ";
  for (int j='a'; j<='z'; ++j) str<<MChar(int('a'+ch2int0(j)-1));
  str<<MChar(int('a'+ch2int0('\'')-1))<<"\"\n";
 // Letter->index conversion string for L1
  MString c1 = " ...........................";
  for (int j='a'; j<='z'; ++j) c1.setChar(ch2int1(j),j);
  c1.setChar(ch2int1('\''),'\'');
  str<<"C1: \""<<c1<<"\"\n";
 // Letter->index conversion string for L2
  str<<"C2: \" ";
  for (int j='a'; j<='z'; ++j) str<<MChar(int('a'+ch2int2(j)-1));
  str<<MChar(int('a'+ch2int2('\'')-1))<<"\"\n";
// Size report
  str <<"\n"<<words.cnt()<<" words => "<<L.cnt()<<" signatures => "
      <<bytes.cnt()<<" bytes =>\n"<<size1<<"+"<<size2<<" final bytes ("
      <<(65536-size1-size2)<<" left)\n\n";
// Display the information
  MMainFrame wnd;                                       // Create app's mainframe window
  wnd.plugBar(MEditBoxPtr(wnd,AutoRect,None,true,str)); // Create a text box
  wnd.setCaption("Data file written");
  wnd.runMessageLoop();                                 // Run the app
}
