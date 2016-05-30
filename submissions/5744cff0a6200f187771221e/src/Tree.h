#ifndef TREE_H
#define TREE_H

using namespace std;
#include <fstream>

class Node
{
public:
	Node** nodes;
	bool is_end;
	int level;
	static int deepth;

	Node(int lvl = 0)
	{
		level = lvl;
		is_end = false;
		nodes = (Node**)new void*[27];
		for (int i = 0; i < 27; i++)
		{
			nodes[i] = NULL;
		}
	}

	~Node()
	{
		for (int i = 0; i < 27; i++)
		{
			delete nodes[i];
		}
		delete nodes;
	}

	void add_word(const char* word)
	{
		if (*word == '\0')
		{
			is_end = true;
			return;
		}

		if (level + 1 < deepth)
		{
			if (nodes[to_index(*word)] == NULL)
			{
				nodes[to_index(*word)] = new Node(level + 1);
			}

			nodes[to_index(*word)]->add_word(word + 1);
			return;
		}

		nodes[to_index(*word)] = (Node*)1;
	}

	bool contains_word(const char* word)
	{
		if (*word == '\0')
		{
			return is_end;
		}

		if ((level + 1) == deepth)
		{
			return nodes[to_index(*word)] != NULL;
		}

		if (nodes[to_index(*word)] != NULL)
			return nodes[to_index(*word)]->contains_word(word + 1);

		return false;
	}

	void serialize(ofstream& serial)
	{
		int lvl = 1;
		bool res = sub_serialize(serial, 0);
		while (res && (lvl < deepth))
		{
			for (int i = 0; i < 26; i++)
			{
				if (nodes[i] != NULL)
					res = nodes[i]->sub_serialize(serial, lvl);
			}
			lvl++;
		}
	}

private:
	bool sub_serialize(ofstream& serial, int lvl)
	{
		serial.flush();
		if (lvl < level)
			return true;

		if (lvl > level)
		{
			bool res = false;

			for (int i = 0; i < 27; i++)
			{
				if (nodes[i] != NULL)
				{
					if (nodes[i]->sub_serialize(serial, lvl))
						res = true;
				}
			}
			return res;
		}

		char c = is_end;
		serial << is_end ? '1' : '0';
		for (int i = 0; i < 27; i++)
			serial << (nodes[i] != NULL) ? '1' : '0';
		bool res = false;
		for (int i = 0; i < 27; i++)
		{
			if (nodes[i] != NULL)
				res = true;
		}

		return res;
	}

	static int to_index(char c)
	{
		if (('a' <= c) && ('z' >= c))
		{
			return c - 'a';
		}
		return 26;
	}
};


#endif