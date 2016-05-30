#include "stdafx.h"
#include "stdio.h"
#include "stdlib.h"
#include <string.h>
#include <vector>
#include <fstream>
#include <iostream>
#include <sstream>
#include <algorithm>
//#include <windows.h>

using namespace std;

#define MAX_KEY_NUMBER (7)

#define DB_FUNC 1

char in_def[] = "words.txt";
char ou_def[] = "out.txt";
char in_pref_def[] = "prefs.txt";
char in_suf_def[] = "sufs.txt";
char ou_add_def[] = "stat.txt";

struct tCmdOpt
{
	char	*pinf;		//основной файл входных данных
	char	*pouf;		//основной файл входных данных
	char	*p_pref_in;	//префиксы
	char	*p_suf_in;	//суфиксы
	char    *p_add_ouf; //дополнительный файл результата
	char    counter; 
	char	use_gz;
};
 
int try_key( int c, char *argv[], tCmdOpt *cmd, void *key );

void print_opts( tCmdOpt *p )
{
	printf("\r\n\r\n def_in (%s)\r\n def_ou (%s) \r\n prefs (%s) \r\n sufs (%s) \r\n add_out (%s) \r\n counter (%i) \r\n gzip (%i)\r\n",
			p->pinf,
			p->pouf,
			p->p_pref_in,
			p->p_suf_in,
			p->p_add_ouf,
			p->counter,
			p->use_gz);
}

void CmdOpt_create( tCmdOpt *p )
{
	p->pinf = in_def;
	p->pouf = ou_def;
	p->p_suf_in = in_suf_def;
	p->p_pref_in = in_pref_def;
	p->p_add_ouf = ou_add_def;

	p->counter = 0; 
	p->use_gz = 0;
	print_opts( p );
}

const char *keys[] = 
{
	"-if",   //- in file
	"-of",   //- out file
	"-pref", //-
	"-suf",  //-
	"-addof",//-
	"-cp",   //-
	"-gz",   //- use gzip
	""
};

const char *help[] = 
{
	"[-if    in file]",
	"[-of    out file]",
	"[-pref  in prefs file]", //- boot/appl/logg
	"[-suf   in suf file]", 
	"[-addof out add file]", 
	"[-cp    counter1]", 
	"[-gz    use gzip]", 
	""
};

// Variable Declarations
	FILE *pf00;
	FILE *pf01;
	ofstream faddout;
    unsigned long  file_len;
    unsigned long  read_cnt = 0;
	struct T_word{
		string str;
		int type;
		int length;
		int parent;
		int branch_cnt;
		int pref;//not used
	};
	T_word content[700000];

	//стркутура элемента дерева
	struct T_tree_node{
		int char_deph;
		int weight;
		int list_begin_pos;
		int list_end1_pos;
		unsigned int whole_word :1;
		unsigned int Mask;
		unsigned int cut_br_mask;
		T_tree_node * pbranch_nodes[26];
	};


#define num_index_char  3
#define num_indexes  (1<<(5*num_index_char))
#define MAX_TREE_DEPH 5
#define USE_FREQ_CHAR_CODING 0  //использование кодирования битов символов в порядке их частотности (не используется)
#define USE_BRANCH_CAT       0  //опция обрубания ветвей (не используется)

int Word_cnt = 0;
int node_cnt = 0;
int max_deph = 0;
int bits_cnt = 0;
int node_cnt_level[50];
int node_cnt2_level[50];


//					   0   1   2   3   4   5   6   7   8   9  10  11  12  13  14  15  16  17  18  19  20  21  22  23  24  25  26 
char freq_char[27] = {'a','e','o','i','r','t','n','l','s','c','h','u','p','m','d','g','b','y','k','f','w','v','z','x','j','q','\''};
char order_char[27] ={ 0, 16,  9, 14,  1, 19, 15, 10,  3, 24, 18,  7, 13,  6,  2, 12, 25,  4,  8,  5,  11, 21, 20, 23, 17, 22, 26 };


unsigned char code_char(char c){
	unsigned char cc = 0;
	if(c=='\'') c = 26;
	else cc = c-'a';
	return cc;
}

char decode_char(unsigned char cc){
	unsigned char dc = 0;
	if(cc>26) dc= '?';
	else if(cc==26) dc = '\'';
	else dc = cc+'a';
	return dc;
}


bool fill_node(T_tree_node * pnode, char char_code){
	char ch1 = decode_char(char_code);
	int list_begin_pos = pnode->list_begin_pos;
	int list_end1_pos = pnode->list_end1_pos;
	int char_pos = pnode->char_deph-1;
	for(int i=list_begin_pos; i<list_end1_pos; i++){//поиск начальной позиции
		if(char_pos<content[i].length)
			if(ch1==content[i].str[char_pos]){
				pnode->list_begin_pos=i;
				//pnode->list_num_words-=i
				pnode->whole_word = (char_pos==content[i].length-1)? 1: 0;//конец слова
				break;
			}
	}
	int weight = 0;

	//подсчёт слов вместе с дочерними(удаёнными словами)
	for(int i=pnode->list_begin_pos; i<list_end1_pos; i++){
		if(char_pos<content[i].length){
			if(ch1==content[i].str[char_pos]){
				weight+= content[i].branch_cnt;
			}else{
				pnode->list_end1_pos = i;
				break;
			}
		}else{//конец области
			pnode->list_end1_pos = i;
			break;
		}
	}
	pnode->weight = weight;

	return (weight>0);
}


/*
//Добавление узла в префиксное дерево вариант №1
bool add_nodes(T_tree_node * pnode){
	unsigned int mask = 0;
	if(pnode->char_deph>=MAX_TREE_DEPH) return false;
	if(max_deph<= pnode->char_deph+1) max_deph = pnode->char_deph+1;
	node_cnt_level[pnode->char_deph]++;
	node_cnt++;
	for(int i=0; i<26; i++){
		pnode->pbranch_nodes[i] = new T_tree_node();
		pnode->pbranch_nodes[i]->char_deph = pnode->char_deph+1;
		pnode->pbranch_nodes[i]->weight = 0;
		pnode->pbranch_nodes[i]->list_begin_pos = pnode->list_begin_pos;
		pnode->pbranch_nodes[i]->list_end1_pos = pnode->list_end1_pos;

		//найти позицию начала слов на данную букву
		if(USE_FREQ_CHAR_CODING){
			fill_node(pnode->pbranch_nodes[i], code_char(freq_char[i]));
		}else{
			fill_node(pnode->pbranch_nodes[i], i);
		}
		if(pnode->char_deph<4){
			if(pnode->pbranch_nodes[i]->weight>0){
				mask|=1<<i;
				if(USE_BRANCH_CAT) mask|=(1<<31);//не усечение
			}
		}else if( (pnode->weight < ((pnode->char_deph+8)>>1) )&&(USE_BRANCH_CAT)){//если суммарный вес небольшой обрубить ветку
			if(pnode->pbranch_nodes[i]->weight>0){
				mask|=1<<i;
				if(USE_BRANCH_CAT) mask&=~(1<<31); //усечение
			}
			//cout<<"p";
		}else{
			if(pnode->pbranch_nodes[i]->weight>=((pnode->char_deph)>>1)+1){
				mask|=1<<i;
				if(USE_BRANCH_CAT) mask|=(1<<31);//не усечение
			}
		}

	}
	mask |=(pnode->whole_word)<<30;
	fwrite(&mask,1,4,pf00);
	if( ((mask>>31)&1)|| !(USE_BRANCH_CAT) ){ //нет усечение
		for(unsigned int i=0, b_mask=1; i<26; i++, b_mask<<=1){
		  if(mask&b_mask){
			add_nodes(pnode->pbranch_nodes[i]);
		  }
		}
	}
	for(unsigned int i=0, b_mask=1; i<26; i++, b_mask<<=1){
	  if(mask&b_mask)
		bits_cnt++;
	}
	return true;
}*/

//Добавление узла в префиксное дерево вариант №2
bool add_nodes2(T_tree_node * pnode){
	unsigned int mask = 0;
	if(pnode->char_deph>=MAX_TREE_DEPH){
		//cout << "ret true"<<endl;
		return true;
	}
	if(max_deph<= pnode->char_deph+1) max_deph = pnode->char_deph+1;
	node_cnt_level[pnode->char_deph]++;
	node_cnt++;
	//cout << "char_deph"<<pnode->char_deph<<endl;

	for(int i=0; i<26; i++){
		pnode->pbranch_nodes[i] = new T_tree_node();
		pnode->pbranch_nodes[i]->char_deph = pnode->char_deph+1;
		pnode->pbranch_nodes[i]->weight = 0;
		pnode->pbranch_nodes[i]->list_begin_pos = pnode->list_begin_pos;
		pnode->pbranch_nodes[i]->list_end1_pos = pnode->list_end1_pos;
		//cout << " i="<<i<<endl;

		//найти позицию начала слов на данную букву
		if(USE_FREQ_CHAR_CODING){
			fill_node(pnode->pbranch_nodes[i], code_char(freq_char[i]));
		}else{
			fill_node(pnode->pbranch_nodes[i], i);
		}
		if(pnode->char_deph<4){
			if(pnode->pbranch_nodes[i]->weight>0){
				mask|=1<<i;
				if(USE_BRANCH_CAT) mask|=(1<<31);//не усечение
			}
		}else if( (pnode->weight < ((pnode->char_deph+8)>>1) )&&(USE_BRANCH_CAT)){//если суммарный вес небольшой обрубить ветку
			if(pnode->pbranch_nodes[i]->weight>0){
				mask|=1<<i;
				if(USE_BRANCH_CAT) mask&=~(1<<31); //усечение
			}
			//cout<<"p";
		}else{
			if(pnode->pbranch_nodes[i]->weight>=((pnode->char_deph)>>1)){
			//if(pnode->pbranch_nodes[i]->weight>=(pnode->char_deph)){
				mask|=1<<i;
				if(USE_BRANCH_CAT) mask|=(1<<31);//не усечение
			}
		}

	}

	if( ((mask>>31)&1)|| !(USE_BRANCH_CAT) ){ //нет усечение
		for(unsigned int i=0, b_mask=1; i<26; i++, b_mask<<=1){
		  if(mask&b_mask){
			if(!add_nodes2(pnode->pbranch_nodes[i]) ) mask&=~b_mask;//если в дочерней ветке нет нового слова или не доходит но моксимальной глубины, снять бит соотв. буквы


		  }
		}
	}

	for(unsigned int i=0, b_mask=1; i<26; i++, b_mask<<=1){
	  if(mask&b_mask)
		bits_cnt++;
	}
	pnode->Mask = mask;
	pnode->Mask|=(pnode->whole_word)<<30;

	if(pnode->whole_word) return true;
	if((mask)==0) return false; //если у всех дочерних веток нет новых слов и ниодна не доходит до моксимальной глубины, вернуть признак пустой ветки
	else return true;
}

bool write_nodes(T_tree_node * pnode){
	unsigned int mask = 0;
	if(pnode->char_deph>=MAX_TREE_DEPH) return true;
	if(pnode->Mask)	fwrite(&pnode->Mask,1,4,pf00);
	if(max_deph<= pnode->char_deph+1) max_deph = pnode->char_deph+1;

//	if( ((mask>>31)&1)|| !(USE_BRANCH_CAT) ){ //нет усечения
		for(unsigned int i=0, b_mask=1; i<26; i++, b_mask<<=1){
		  if(pnode->Mask&b_mask){
			write_nodes(pnode->pbranch_nodes[i]);
		  }
		}
//	}
	return true;
}

//Печать узла, для отладки
void print_node(T_tree_node * pnode){
	int summ_weight = 0;
	for(int i=0; i<26; i++){
		char ch1 = decode_char(i);
		cout << ch1 << endl;
		cout << pnode->pbranch_nodes[i]->char_deph << "\t"
			 << pnode->pbranch_nodes[i]->list_begin_pos << "\t"
			 << pnode->pbranch_nodes[i]->list_end1_pos << "\t" 
			 << pnode->pbranch_nodes[i]->weight << endl;
		summ_weight+=pnode->pbranch_nodes[i]->weight;
	}
	cout << summ_weight << endl;
}

//Чтение узла префиксного дерева
bool read_nodes(string str1, int deph){
	unsigned int mask = 0;
	int read_len = fread(&mask, 1, 4, pf01 );
	if(read_len!=4){
		cout << "read err. node_cnt2_level[" << deph <<"]="<< node_cnt2_level[deph] << endl;
		return false;
	}
	node_cnt2_level[deph]++;
	read_cnt+=4;
	bool cat_flag = 1;
	if(USE_BRANCH_CAT) cat_flag = (mask>>31)&1;
	bool whole_word_flag = (mask>>30)&1;
	deph++;

	if(whole_word_flag){
		//faddout << str1 << endl; вывод префиксов в отладочный файл
	}else{
		if((mask&((1<<26)-1))==0){ // часть слова, ветка обрублена
			//faddout << str1 << '-'<< endl;
		}
	}

	for(int i=0; i<26; i++){

		if((mask>>i)&1){
			char ch1;
			if(USE_FREQ_CHAR_CODING){
				ch1 = freq_char[i];
			}else{
				ch1 = decode_char(i);
			}
			string str2;
			str2 = str1 + ch1;
			if((cat_flag)&&(deph<MAX_TREE_DEPH)){
				read_nodes(str2, deph);
			}else{
				//faddout << str2 << '*'<< endl;
			}

		}
	}
	return true;
}

int _tmain(int argc, _TCHAR* argv[]){

	tCmdOpt cmd;

	printf( " Assebbler LSP-16\n");
	printf( "sizeof(_TCHAR) %i\n", sizeof(_TCHAR));
	printf( "argc =%i\n", argc);
	//-print help
	{
		printf( "help\r\n %s\r\n %s\r\n %s\r\n %s\r\n %s\r\n %s\r\n %s\r\n %s\r\n",
				argv[0],
				help[0],
				help[1],
				help[2],
				help[3],
				help[4],
				help[5],
				help[6]);
	}

	CmdOpt_create( &cmd );

	try_key( argc, argv, &cmd, (void *)keys ); //Разбор параметров


	setlocale(LC_ALL, "rus"); // корректное отображение Кириллицы
	int cur_word_len = 0;
	int suf_len = 0;
	int Num_word = 0;
	int Pref_cnt = 0;

    //--- чтение файла в буфер ---   
    std::ifstream fin;
    fin.open(cmd.pinf, std::ios::in | std::ios::binary);//ios::binary - бинарное открытие,ios::in - операции ввода
    if (!fin)
    {
        std::cout << "Файл " << cmd.pinf <<" не найден" ;
        return 0;
    }
	//cout << "Файл открыт" << endl;
	int length_1c[27] = {18,16,18,18,17,15,15,18,18,12,13,15,18,18,17,19,14,17,18,17,18,15,14,11,10,12,0};//300
	while(!fin.eof()){
		string word_str;
		int branch_cnt=1;
		fin /*>> branch_cnt */>> word_str;

		if(word_str.length()){
			char ch1 = word_str[0];
			unsigned int max_len = length_1c[code_char(ch1)];
		    if(word_str.length() <= max_len){
				content[Word_cnt].pref=0;
                content[Word_cnt].str = word_str;
				content[Word_cnt].branch_cnt = branch_cnt;
				content[Word_cnt].length = word_str.length();
				Word_cnt++;
			}
		}

		if(Word_cnt>=700000) break;
	}
    fin.close(); 
	/*
	//------------ составление индексов длины и по нач. символам --------------------
	unsigned int _2c_index_cnt[32][32]; 
	for(int i=0; i<32; i++) for(int j=0; j<32; j++) _2c_index_cnt[i][j]=0;

	for(int i=1; i<Word_cnt; i++){
	//статистика двухсимвольных сочетаний по всему слову
		char c0 = content[i].str[0];
		if(c0=='\'') c0 = 26;
		else c0 = c0-'a';
		char c1;
		for(int p=1; p<content[i].length; p++){
			c1 = content[i].str[p];
			if(c1=='\'') c1 = 26;
			else c1 = c1-'a';
			_2c_index_cnt[c0][c1]++;
			c0=c1;
		}
	}
	ofstream fout3("mask.txt", ios_base::out | ios_base::binary); 
	unsigned int _2char_filter[32];
	for(int i=0; i<26; i++) _2char_filter[i]=0;
	for(int i=0; i<26; i++){
		for(int j=0; j<26; j++){
			if(_2c_index_cnt[i][j]>7){
				_2char_filter[i]|= 1<<j;
			}else{
				 fout3<<decode_char(i) <<decode_char(j) << "\',\'";
			}
			//cout
		}
	}
	fout3.close();
   //-------------------------------------------------
   */


	/* не используется
	{//--- чтение файла префиксов в буфер ---   
		Pref_cnt=0;
        std::ifstream pref_fin;
        pref_fin.open(cmd.p_pref_in, std::ios::in | std::ios::binary);//ios::binary - бинарное открытие,ios::in - операции ввода
        if (!pref_fin)
        {
            std::cout << "Файл "<< cmd.p_pref_in << " не найден" << endl;
            return 0;
        }
		while(!pref_fin.eof()){
			content[Word_cnt].pref=1;
			content[Word_cnt].branch_cnt=1;
			pref_fin >> content[Word_cnt].str;
			Word_cnt++;
			Pref_cnt++;
			if(Word_cnt>=700000) break;
		}
		cout << " Pref_cnt=" << Pref_cnt << endl;
        pref_fin.close(); 
	}//-------------------------------
	*/
		Word_cnt--;
		cout << " Word_cnt=" << Word_cnt << endl;

	/*
	//--- сортировка ---
	std::sort(content, &content[Word_cnt], [] (const T_word p1, const T_word p2) 
	{
		return p1.str < p2.str;
	});*/

	

	//--------- запись префиксного дерева --------------
	pf00 = fopen( cmd.pouf,"w+b");
	if ( !pf00 ){
		printf("\n error can  not open out file %s\n", cmd.pouf );
		fclose(pf00);
		return 0;
	}
	T_tree_node * root_node = new T_tree_node();
	root_node->char_deph=0;
	root_node->weight=0;
	root_node->list_begin_pos=0;
	root_node->list_end1_pos=Word_cnt;

	//add_nodes(root_node); //вариант №1

	add_nodes2(root_node);  //вариант №2
	write_nodes(root_node); //|

	for(int i=1; i<6; i++){
		cout << "node_cnt_level["<< i <<"]="<< node_cnt_level[i] << endl;
	}
	//print_node(root_node);
	cout << "node_cnt " << node_cnt <<endl;
	cout << "max_deph " << max_deph << endl;
	cout << "bits_cnt " << bits_cnt << endl;

	fclose(pf00);


	//--------- проверочное чтение префиксного дерева --------------
	pf01 = fopen( cmd.pouf ,"rb");

	if ( !pf01 ){
		printf("\n error can  not open out file %s\n", cmd.p_suf_in );
		fclose(pf01);
		return 0;
	}

	fseek( pf00, 0, SEEK_END );
	file_len = ftell( pf00 );
	printf("\n file_len %x\n",file_len);
	fseek( pf00, 0, SEEK_SET );

	string str1="";
	read_nodes(str1, 0);
 
	fclose(pf01);
	for(int i=1; i<6; i++){
		cout << "node_cnt2_level["<< i <<"]="<< node_cnt2_level[i] << endl;
	}
	cout << "read_cnt=" << read_cnt << endl;
	return 0;
}


int try_key( int c, char *argv[], tCmdOpt *cmd, void *pkeys )
{

	int i;
	int kl;
	int rv;
	char **key;
	key = (char**)pkeys;

	for( i = 0; i < MAX_KEY_NUMBER; i++ )
	{
		int k;
		rv = -1;
		kl = strlen( key[i] );
		printf("\r\n try ------(%s), %08x ",key[i], kl );
		for( k = 1; k < c; k++ )
		{
			if ( !memcmp( argv[k], key[i], kl ) )
			{
				printf("\r\n key (%s) - found", argv[k] );
				rv = i;
				switch( rv )
				{
				case 0:
					if ( k < c ) { cmd->pinf = argv[k+1]; }
					else { printf("\r\n - can't find param for: (%s)", argv[k] ); }
					break;

				case 1:
					if ( k < c ) { cmd->pouf = argv[k+1]; }
					else { printf("\r\n - can't find param for: (%s)", argv[k] ); }
					break;

				case 2:
					if ( k < c ) { cmd->p_pref_in = argv[k+1]; }
					else { printf("\r\n - can't find param for: (%s)", argv[k] ); }
					break;

				case 3:
					if ( k < c ) { 	cmd->p_suf_in = argv[k+1];	}
					else { printf("\r\n - can't find param for: (%s)", argv[k] ); }
					break;

				case 4:
					if ( k < c ) { 	cmd->p_add_ouf = argv[k+1];	}
					else { printf("\r\n - can't find param for: (%s)", argv[k] ); }
					break;

					break;

				case 5:
					if ( k < c ) { 
					cmd->counter = atoi(argv[k+1]);
					}
					else { printf("\r\n - can't find param for: (%s)", argv[k] ); }
					break;

				case 6:
					cmd->use_gz = 1;
					break;

				}
			}
		}
	}
	print_opts(cmd);
	return rv;
}
