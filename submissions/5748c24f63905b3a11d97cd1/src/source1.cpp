// Hola_2016.cpp : Defines the entry point for the console application.
//

#include "stdafx.h"
#include <iostream>
#include <string>
#include <sstream>
#include <fstream>
#include <algorithm>
#include <set>
#include <map>
#include <vector>
#include <bitset> 

using namespace std;




// if there're 2 words different by ending "'s"
// for example: "abc" and "abc's" then instead both of them will be used single word: "abc'"
//
bool ReplaceEndingS(string strFullInpPath, string strFullOutPath)
{
	// intermidiate buffer
	string line;
	set<string> outDictionary;

	ifstream ifile(strFullInpPath);
	ofstream ofile(strFullOutPath);

	if(!ifile || !ofile)
	{
		cout << "ReplaceEndingS: failed to open file" << endl;
		return false;
	}
	
	while(!ifile.eof())
	{
		ifile >> line;
		transform(line.begin(), line.end(), line.begin(), ::tolower);
		size_t len = line.size();

		if(len > 2 && line[len-2] == '\'' && line[len-1] == 's')
		{
			string pattern = line.substr(0,len-2);
			set<string>::iterator itr = outDictionary.find(pattern);
			if(itr != outDictionary.end())
			{
				outDictionary.erase(itr);
				outDictionary.insert(pattern + '\'');
			}
		}
		else
		{
			outDictionary.insert(line);
		}
	}
	ifile.close();
	// write dictionary to file
	for(auto itr = outDictionary.begin(); itr != outDictionary.end(); ++itr)
	{
		ofile << *itr << endl;
	}

	return true;
}


// make text case insensitive, replace common suffixes by dictionary ones,
// store small words in different file, remove 1st alpha from words,
// build co-occurence table, build occurence dictionary
//
bool PreProcess(string strFullInpPath, string strFullOutPath)
{
	ifstream ifile(strFullInpPath);
	ofstream ofile(strFullOutPath);
	ofstream ofileInv(strFullOutPath+string(".inv"));

	if(!ifile || !ofile || !ofileInv)
	{
		cout << "PreProcess: failed to open file" << endl;
		return false;
	}
	bool res = ReplaceEndingS( strFullInpPath,  strFullOutPath);
	return res;
}


// hash function 5 - converts string to single char 
string WordToHash(string inp)
{
	string res;
	if(inp.empty()) { return res; }

	map<char,size_t> dict;
	// fill map
	dict['\''] = 0;
	for(char c = 'a'; c <= 'z'; ++c)
	{
		dict[c] = static_cast<size_t>(c-'a'+1);
	}

	for(auto itr = inp.begin(); itr != inp.end(); ++itr)
	{
		if(dict.find(*itr) == dict.end()) { return 0; }
		*itr = static_cast<char>(dict[*itr]);
	}

	size_t hashVal = static_cast<size_t>(inp[0]);

	for(auto itr = inp.begin()+1; inp.end() != itr; ++itr)
	{
		size_t a = static_cast<size_t>(*(itr-1));
		size_t b = static_cast<size_t>(*itr);
		hashVal += (1+a) * (1+b); 
	}

	hashVal = hashVal % 27;
	char cRes = (0 == hashVal ? '\'' : 'a' + hashVal - 1);

	//hashVal = hashVal % 80;
	//char cRes = (0 == hashVal ? '\'' : '0' + hashVal - 1);

	char tmp[2] = {cRes,0};
	res = tmp;
	return res;
}



// return symbol
const char cReturn = '-';
// end of word symbol
const char cEOW = '.';
// unprintable symbol
const char cDontPrint = '+';

//Trie node structure
struct SNode
{
	// c-tor
	SNode(const SNode  * const parent, char val) : m_Parent(parent), m_Value(val), m_Depth(0), m_nAlpha(0), m_nWords(0) 
	{
		if(parent)
		{
			m_Depth = parent->m_Depth + 1;
		}
	};
	// add new word to trie
	void AddWord(string word, size_t depth)
	{
		// add end of word symbol to trie
		if(word.empty())
		{
			m_Value = cEOW;
			return;
		}
		// add last alpha of original word to trie (current node) and request to add end of word symbol
		if(word.size() == 1)
		{
			m_Value = word[0];
			if(m_Childs.find(cEOW) == m_Childs.end())
			{
				m_Childs[cEOW] = auto_ptr<SNode>(new SNode(this, cEOW));
			}
			return;
		}
		// regular case
		m_Value = word[0];
		if(m_Childs.find(word[1]) == m_Childs.end())
		{
			m_Childs[word[1]] = auto_ptr<SNode>(new SNode(this, word[1]));
			m_Childs[word[1]]->AddWord(word.substr(1), depth + 1);
		}
		else
		{
			m_Childs[word[1]]->AddWord(word.substr(1), depth + 1);
		}
	};

	// print node
	void PrintNode(ostream& out)
	{
		// print node value
		out << m_Value;
		// print children values
		for(auto itr = m_Childs.begin(); itr != m_Childs.end(); ++itr)
		{
			itr->second->PrintNode(out);
		}

		// print "return to parent" symbol
		if(cEOW != m_Value)
		{
			out << cReturn;
		}
	};

	// print compressed node
	void PrintCompressedNode(ostream& out)
	{
		// check for non-printable value
		if(cDontPrint == m_Value)
		{
			//out << m_Value;
			return;
		}

		// print node value
		out << m_Value;

		// print children values
		for(auto itr = m_Childs.begin(); itr != m_Childs.end(); ++itr)
		{
			itr->second->PrintCompressedNode(out);
		}

		// print "return to parent" symbol
		if(cEOW != m_Value && cDontPrint != m_Value)
		{
			out << cReturn;
		}
	};

	// scans trie and compress it from leaf node back to 1st parent
	// with more than 1 childrens
	void Compress()
	{
		if(m_Value == cEOW)
		{
			return;
		}
		// conditions for compression:
		// minimal depth - the min. number characters preserved in each word
		// num. of words depending on this node
		// the mean number of letters in removed words - prefer to remove long words
		if(m_Depth > 1 && m_nWords < 380 && (6 * m_nWords <  5*m_nAlpha)) // archive - 57kb
		{
			//vector<string> words;
			GetAllWordsForNode("",m_CompressedData);
			
			//m_Value = cEOW;
			m_Childs.clear();

			// replace original words by single character obtained from hash value
			for(auto itr = m_CompressedData.begin(); itr != m_CompressedData.end(); ++itr)
			{
				if(itr->size() > 1)
				{
					string hashVal = WordToHash(itr->substr(1));
					if(m_Childs.find(hashVal[0]) == m_Childs.end())
					{
						m_Childs[hashVal[0]] = auto_ptr<SNode>(new SNode(this, hashVal[0]));
						m_Childs[hashVal[0]]->AddWord(hashVal,m_Depth+1);
					}
					
				}
				else if(m_Childs.find(cEOW) == m_Childs.end())
				{
					m_Childs[cEOW] = auto_ptr<SNode>(new SNode(this, cEOW));
				}				
			}

		}
		else
		{
			for(auto itr = m_Childs.begin(); itr != m_Childs.end(); ++itr)
			{
				itr->second->Compress();
			}
		}
	}

	// get all words or sub-words stored under current node
	void GetAllWordsForNode(string inp, vector<string>& out)
	{
		if(m_Value == cEOW)
		{
			out.push_back(inp);
			return;
		}

		// update all words by addition current node value
		char buff[2] = {m_Value,0};
		inp += buff;


		// update words
		for(auto itr = m_Childs.begin(); itr != m_Childs.end(); ++itr)
		{
			itr->second->GetAllWordsForNode(inp, out);
		}
	}

	// collect statistics like to number of childrens per node or number of words ending from the node
	void CollectStatistics(size_t& numWords, size_t& numChilds)
	{
		if(m_Value != cEOW)
		{
			m_nAlpha = 1;
		}

		for(auto itr = m_Childs.begin(); itr != m_Childs.end(); ++itr)
		{
			if(itr->second->m_Value != cEOW)
			{
				size_t a = 0, b = 0;
				itr->second->CollectStatistics(a, b);
				m_nAlpha += b;
				m_nWords += a;
			}
			else
			{
				++m_nWords;
			}
		}
		numChilds += m_nAlpha;
		numWords +=  m_nWords;
	}


	// parent of the current node
	const SNode  * const m_Parent;
	// value of the current node
	char m_Value;
	// childrens
	map<char, auto_ptr<SNode> > m_Childs;
	// depth of tree from root
	size_t m_Depth;
	// number of all sub-nodes - alphas going from this node including this node too
	size_t m_nAlpha;
	// number of words where this node is part of them (this node maybe last alpha of some word too)
	size_t m_nWords;
	// compressed form of all words (including relative length - child node m_nAlpha and compressed alphas)
	vector<string> m_CompressedData;
};

class CTrie
{
	// dictionary
	map<char, auto_ptr<SNode> > dict;
public:
	// add word to trie
	void AddWord(string word)
	{
		// validation of input
		if(word.empty()) { return; }

		// add word to dictionary
		if(dict.find(word[0]) == dict.end())
		{
			dict[word[0]] = auto_ptr<SNode>(new SNode(NULL, word[0]));
		}
		dict[word[0]]->AddWord(word, 0);
	}

	// read dictionary from file
	bool ReadDict(string strInpFileFullPath)
	{
		ifstream ifile(strInpFileFullPath);
		if(!ifile)
		{
			cout << "ReadDict: failed to open file" << endl;
			return false;
		}

		string line;
		while(!ifile.eof())
		{
			ifile >> line;
			AddWord(line);
		}
		ifile.close();
		return true;
	}

	//write trie to file
	bool WriteTrie(string strOutFileFullPath)
	{
		ofstream ofile(strOutFileFullPath+".trie.txt");
		return WriteTrie(ofile);
	}

	//write trie to file
	bool WriteTrie(ostream& out)
	{
		for(auto itr = dict.begin(); itr != dict.end(); ++itr)
		{
			itr->second->PrintNode(out);
		}
		return true;
	}

	// compress trie - remove path from single leaf to 1st parent of parent
	// with more than 1 child
	bool CompressTrie()
	{
		for(auto itr = dict.begin(); itr != dict.end(); ++itr)
		{
			size_t words = 0;
			size_t childs = 0;
			itr->second->CollectStatistics(words, childs);
			cout << childs << " " << words << endl;
			itr->second->Compress();
		}
		return true;
	}

	// write compressed trie to file
	bool WriteCompressedTrie(string strOutFileFullPath)
	{
		ofstream ofile(strOutFileFullPath+".trie.1.txt");
		for(auto itr = dict.begin(); itr != dict.end(); ++itr)
		{
			itr->second->PrintCompressedNode(ofile);
			//itr->second->PrintNode(ofile);
		}
		return true;
	}
};


// convert trie dictionary to regular one
//
bool TrieFileToDictionary(string strFullInpPath, string strFullOutPath)
{
	ifstream ifile(strFullInpPath);
	ofstream ofile(strFullOutPath+".dict_from_trie"+".txt");

	if(!ifile || !ofile)
	{
		cout << "TrieFileToDictionary: failed to open file" << endl;
		return false;
	}

	string word;
	set<string> dict;
	vector<char> trie((std::istreambuf_iterator<char>(ifile)), std::istreambuf_iterator<char>());
	ifile.close();

	// create word from trie and store in dictionary
	for(auto itr = trie.begin(); itr != trie.end(); ++itr)
	{
		switch(*itr)
		{
		case cEOW:
			{
				//ofile << word << endl;
				dict.insert(word);
			}
			break;
		case cReturn:
			{
				word = word.substr(0, word.size()-1);
			}
			break;
		default:
			word += *itr;
		};
	}

	// print words from dictionary
	for(auto itr = dict.begin(); itr != dict.end(); ++itr)
	{
		ofile << *itr << endl;
	}

	return true;
}

// test if word can be found in trie dictionary, to make search faster can be provided
// star position in dictionary from where will be done search
//
bool FindWordInTrieDict(string word, set<string>& dict)
{
	size_t wordLen = word.size();

	for(auto itr = dict.begin(); itr != dict.end(); ++itr)
	{
		size_t len = itr->size();
		if(len > wordLen) { continue; }
		if(!word.substr(0,len-1).compare(itr->substr(0,len-1)) && (*itr)[len-1] == WordToHash(word.substr(len-1))[0])
		{
			return true;
		}
	}
	return false;
}

// test real dictionary vs dictionary obtained from trie compression
//
bool TestTrieDictionary(string strFullRealDictPath, string strFullTrieDictPath)
{
	ifstream iRealDict(strFullRealDictPath);
	ifstream iTrieDict(strFullTrieDictPath);

	if(!iRealDict || !iTrieDict)
	{
		cout << "TrieFileToDictionary: failed to open file" << endl;
		return false;
	}

	set<string> realDict;
	map<char,set<string> > trieDict;
	string line;
	// load trie dictionary
	while(!iTrieDict.eof())
	{
		iTrieDict >> line;
		trieDict[line[0]].insert(line);
	}
	iTrieDict.close();

	// load real dictionary
	while(!iRealDict.eof())
	{
		iRealDict >> line;
		realDict.insert(line);
	}
	iRealDict.close();

	// test
	size_t counter = 0;
	for(auto itr = realDict.begin(); itr != realDict.end(); ++itr)
	{
		if((++counter % 5000) == 0)
		{
			cout << "TestTrieDictionary: counter=" << counter << " word=" << *itr << endl;
		}
		if(false == FindWordInTrieDict(*itr, trieDict[(*itr)[0]]))
		{
			cout << "Missmatch for:" << *itr << endl;
			return false;
		}
	}
	return true;
}

int _tmain(int argc, _TCHAR* argv[])
{
	string strDictionaryPath = "words.txt";
	
	string strASetPath       = "alpha.txt";
	string strInpPath        = "input";
	string strCompPath        = "compress";
	string strInpPathTmp        = "input.7.prefix.txt";
	string strShortDictionaryPath = "short.txt";


	CTrie trie;

	trie.ReadDict(strASetPath);
	trie.CompressTrie(); 
	trie.WriteCompressedTrie(strCompPath);
	//trie.WriteTrie(strCompPath);

	// test trie dictionary: convert trie file to regular dictionary
	cout << "\nconverts trie file to regular dictionary\n";
	TrieFileToDictionary(strCompPath+".trie.1.txt",strInpPath+".trie.1.txt");


	// test if any word from regular dictionary has match in trie dictionary
	//cout << "\ntests regular dictionary words match in the trie dictionary\n";
	//TestTrieDictionary(strASetPath, strInpPath + ".trie.1.txt.dict_from_trie.txt");


/*
	trie.ReadDict(strShortDictionaryPath);
	trie.CompressTrie(); 
	trie.WriteCompressedTrie(strCompPath+".short");
	//trie.WriteTrie(strCompPath);

	// test trie dictionary: convert trie file to regular dictionary
	cout << "\nconverts trie file to regular dictionary\n";
	TrieFileToDictionary(strCompPath+".short.trie.1.txt",strInpPath+".short.trie.1.txt");


	// test if any word from regular dictionary has match in trie dictionary
	cout << "\ntests regular dictionary words match in the trie dictionary\n";
	TestTrieDictionary(strShortDictionaryPath, strInpPath + ".short.trie.1.txt.dict_from_trie.txt");
*/


	// tests
	//cout << GetDiff("aaabb","aabcb") << "-" << GetDiff("a123", "a1") << "-" << GetDiff("bcd","bcd") << "-" << GetDiff("abcd","abcde") << "-" << GetDiff("b","c") <<"-"<<endl;
	//cout << EncodeMiddleOfWord("sasass", 4) << " " << EncodeMiddleOfWord("assa", 13) << " " << EncodeMiddleOfWord("adsdsd", 5) << " " << EncodeMiddleOfWord("asdfgg",6) << endl; 
	//cout << ChainCode("abcd") << " " << ChainCode("a") << " " << ChainCode("aa") << " " << ChainCode("abb") << " " << ChainCode("aabtgvsddggbbbbbbsddddd") << endl;

	// compress by storing a couple of hash function result table per word in dictionary - archive size 274kB 3 hash functions and 700k range 
	//CompressByHash(strASetPath, strInpPath, 600000);

	//cout << Hash("'") << " " << Hash("''") << " " << Hash("'abc'") << " " << Hash("'bac'")<< " " << Hash("c")<< " " << Hash("z'") << endl;
	//cout << WordToHash("ially") << " " << WordToHash("ialness") << " " << WordToHash("ope'") << " " << WordToHash("'bac'")<< " " << WordToHash("c")<< " " << WordToHash("z'") << " " << WordToHash("'v'o'v'i'k'z'") << endl;
	//cout << GetCompressed2(2, "a") << " or " << GetCompressed2(2, "abc") << endl;
	//cout << GetCompressed3(2, "a") << " or " << GetCompressed3(2, "abc") << endl;
	return 0;
}



