// Words.cpp : Defines the entry point for the console application.
//

#include "stdafx.h"
#include <iostream>
#include <fstream>
#include <string>
#include <vector>
#include <map>
#include <set>
#include "Tree.h"

using namespace std;
int Node::deepth;

void foo()
{
	set<string> b_triads;
	ifstream is1;
	is1.open("b_triads.txt", ios::in);
	string str;
	while (!is1.eof())
	{
		is1 >> str;
		b_triads.insert(str);
		is1 >> str;
	}
	is1.close();

	ifstream is;
	is.open("words.txt", ios::in);
	int counter = 0;
	Node* letters = new Node;
	Node::deepth = 5;
	while (!is.eof())
	{
		is >> str;
		if (b_triads.count(str.substr(0,3)) == 0)
		{
			++counter;
			letters->add_word(str.c_str());
		}
	}
	cout << counter << "words" << endl;
	ofstream os;
	os.open("serial_5.txt", ios::out);
	letters->serialize(os);
	is.close();
	os.close();
}

void bar()
{
	ifstream is;
	is.open("serial_5.txt", ios::in);

	ofstream os;
	os.open("serial_5_post.txt", ios::out);

	char c = '-';
	unsigned char prev = 0;
	unsigned char len = 'a';
	const unsigned char a = 'a';
	while (!is.eof())
	{
		is >> c;
		if (c == '0')
		{
			len++;
		}
		else
		{
			if (len == prev)
			{
				os.put((unsigned char)(len - a + 40));
				prev = 0;
			}
			else
			{
				if (len < a + 40)
				{
					if (prev != 0)
						os.put((unsigned char)prev);
					prev = len;
				}
				else
				{
					if (prev != 0)
					{
						os.put((unsigned char)prev);
						prev = 0;
					}
					os.put((unsigned char)len);
				}
			}
			len = a;
		}
	}
	if (prev != 0)
		os.put((unsigned char)prev);
	os.put((unsigned char)len);

	is.close();
	os.close();
}

int _tmain(int argc, _TCHAR* argv[])
{
	foo();
	bar();
	system("pause");
	return 0;
}