Word dictionary generator. Description.

It makes "words1" dictionary according to the following algorithm:
1. Convert characters to the lower case.
2. Excluded all words ending with "'s", because most of them duplicate words without the " 's". 
All subsequent samples are based on the "words1" dictionary. The number of words in "words1" is 512800, the uncompressed size is 5.6 MB.

Word dictionary description.
The database consists of three parts:
1. The first part are all three character long unique words (number 4520).
2. The second part are 4-character long beginnin, unique subwords that occurring more than 1 time (number – 32532).
3. The third part are 7-character long unique ending subwords of more than 10 character long words (number 18575).---

Packing. 
Before compression the second and third part of the base are packed according to the following algorithms:

1. Sort alphabetically the second part. Then writ first two characters of the first word to the string. 
While two character subword matche them, write only two last characters of current word to this string. 
As soon as the first two characters of a new word differs from original ones, write the newline character, 
repeat itterate the procedure. 
For 4 character words this algorithm reduces the size of the compressed file, from 65 to 22 KIB.

2. The third part is packaged similarly, but the first sequence takes 4 characters 
followed by three characters. The size of the archive file is reduced from 55 to 29 KIB.
Thus the size of word database is 61675 bytes.

Routine that check, if the input word is from the dictiopnary.
1. Find "'" character. If there is "'s" subword in the end, then remove it
and continue the routine. Else, indicate that the word is not from the dictionary.
2. If the word length more then 19, than indicate that the word is not from the dictionary.
3. If the word length more then 10, than search for matching ending subword with 7-character part.
4. Else, if the word length more then 3, than search for matching begining subword with 4-character part.
5. Else, search for matching the words with 3-character part.
If there is the matching than indicate that the word is from the dictionary. Otherwise,
indicate that it is not from the dictionary.

The source code of some functions (C++)-> 

The function that receives the third part of word database (not unique):
void __fastcall TForm1::Button1Click(TObject *Sender)
{
	int i, j, flag;
	unsigned char len;
	unsigned int size;
	AnsiString temp, temp1, temp2;
	string line;

	Memo1->Clear();
	for(j = 0; j < lines.size(); j++)
	{
		temp1 = lines[j];
		len = temp1.Length();
		temp = temp1.SubString(len-6,7);
		newlines.push_back(temp);

	}
	size = newlines.size();
	for(i = 0; i < newlines.size()-1; i++)
	{
		temp = newlines[i];
		flag = 0;
		for(j = i+1; j < newlines.size(); j++)
		{
			 if(temp == newlines[j])
			 {
				flag++;
				break;
			 }
		}
		if(flag)
		 baza3.push_back(temp);
	}
	ofstream file1("bd7.txt");
	for(i = 0; i < baza1.size(); i++)
	{
		temp = baza1[i];
		file1<<"\n"<<temp.c_str();
	}
	file1.close();
}

The function that removes duplicates:
void __fastcall TForm1::Button9Click(TObject *Sender)
{
	int i, j, fl, len, len1;
	AnsiString temp;
	string line;
	AnsiString res;

	ifstream file("bd7.txt");
	while(getline(file, line))
	{
		try
		{
			res = AnsiString(line.c_str());
			lines.push_back(res);
		}
		catch (...)
		{
			file.close();
			throw;
		}
	}
	file.close();

	len1 = lines.size();
	for(i = 0; i < len1; i++)
	{
		temp = lines[i];
		fl = 1;
		for(j = 0; j < baza3.size(); j++)
		{
			 if(temp.Pos(baza3[j]))
			 {
				fl = 0;
				len = baza3.size();
				break;
			 }
		}
		if(fl) baza3.push_back(temp);
	}
	for(j = 0; j < baza3.size(); j++)
	Memo1->Lines->Add(baza3[j]);
}

The function that packs the third part:
void __fastcall TForm1::Button2Click(TObject *Sender)
{
	int i,j, flag, len;
	AnsiString temp, temp1, sum;
	Memo1->Clear();
	for(i = 0; i < baza3.size()-1; i++)
	{
		temp = baza3[i].SubString(1,4);
		sum = baza3[i].SubString(5,3);
		j = 1;
		temp1 = baza3[i+j];
		while(temp1.Pos(temp))
		{
		   sum += temp1.SubString(5,3);
		   j++;
		   if(i+j < baza3.size())
		   {
			   temp1 = baza3[i+j];
		   }
		   else break;
		}
		i += j;
		Memo1->Lines->Add(temp + sum);
	}
}
