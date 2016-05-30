#include "stdafx.h"
#include "stdio.h"
#include "stdlib.h"
#include <string.h>
#include <fstream>
#include <iostream>
#include <sstream>
#include <algorithm>
#include <windows.h>

using namespace std;

#define MAX_KEY_NUMBER (8)

#define DB_FUNC 1

char in_def[] = "def.bin";
char ou_def[] = "def.bou";
char hpi_def[] = "";


struct tCmdOpt
{
	char	*pinf;
	char	*pouf;
	char	*phpi;		//- header proginfo
	char	head[5];	//- boot/appl/logg
	char    counter;   //-
	char    w_direct_in_header; //- not attach header patch direct in image 
	char	use_gz;
	char	Target_device_ID[17];
};
 
int try_key( int c, char *argv[], tCmdOpt *cmd, void *key );

void print_opts( tCmdOpt *p )
{
	printf("\r\n\r\n def_in (%s)\r\n def_ou (%s) \r\n hpi (%s) \r\n head (%s) \r\n counter (%i) \r\n gzip (%i)\r\n TDID (%s)\r\n",
			p->pinf,
			p->pouf,
			p->phpi,
			p->head,
			p->counter,
			p->use_gz,
			p->Target_device_ID);
}

void CmdOpt_create( tCmdOpt *p )
{
	p->pinf = in_def;
	p->pouf = ou_def;
	p->phpi = hpi_def;
	p->head[0] = 'b'; p->head[1] = 'o'; p->head[2] = 'o'; p->head[3] = 't';p->head[4] = 0;
	p->counter = 0; 
	p->w_direct_in_header = 0;
	p->use_gz = 0;
	for(int i=0; i<16; i++)
	  p->Target_device_ID[i] = (char)0xFF;
    p->Target_device_ID[17]=0;
	print_opts( p );
}

const char *keys[] = 
{
	"-if", //- in file
	"-of", //- out file
	"-hd", //- boot/appl/logg
	"-cp", //-
	"-hpi", //- template proginfo
	"-noh",//- no header / path direct in image
	"-gz", //- use gzip
	"-tdid",
	""
};

const char *help[] = 
{

	"[-if  in file]",
	"[-of  out file]",
	"[-hd  header(boot/appl/logg/other...)']", //- boot/appl/logg
	"[-cp  counter1]", 
	"[-hpi  tpl_hdr_for_qproginfo]", //- template proginfo
	"[-gz use gzip]", 
	"[-tdid Target device ID]"
	""
};

int _tmain(int argc, _TCHAR* argv[]){

	tCmdOpt cmd;

	printf( " word list maker\n");
	printf( "sizeof(_TCHAR) %i\n", sizeof(_TCHAR));
	printf( "argc =%i\n", argc);
	//-print help
	{
		printf( "help\r\n %s\r\n %s\r\n %s\r\n %s\r\n %s\r\n %s\r\n %s\r\n",
				argv[0],
				help[0],
				help[1],
				help[2],
				help[3],
				help[4],
				help[5]);
	}

	CmdOpt_create( &cmd );
	try_key( argc, argv, &cmd, (void *)keys ); //Разбор параметров
	setlocale(LC_ALL, "rus"); // корректное отображение Кириллицы

	int Word_cnt = 0;
	unsigned int length_for_char_index_cnt[32][50];
	unsigned int max_length_for_char[32];
	for(int i=0; i<32; i++) for(int j=0; j<50; j++) length_for_char_index_cnt[i][j]=0;
	for(int i=0; i<32; i++) max_length_for_char[i] = 0;


	{

        std::ifstream fin;
        fin.open(cmd.pinf, std::ios::in | std::ios::binary);//ios::binary - бинарное открытие,ios::in - операции ввода
        if (!fin)
        {
            std::cout << "Файл " << cmd.pinf <<" не найден" ;
            return 0;
        }

		while(!fin.eof()){
		  string word;

		  fin >> word;
		  int  length=word.length();
		  if(length){
		    char bc = word[0];
		    if(bc=='\'') bc = 26;
			else bc = bc-'a';
			if(length>49)
				length_for_char_index_cnt[bc][49]++;
			else
				length_for_char_index_cnt[bc][length]++;
		  }
		  Word_cnt++;
		  if(Word_cnt>=700000) break;
		}
		fin.close();
		Word_cnt--;
		cout << " Word_cnt=" << Word_cnt << endl;

		for(int i=0; i<32; i++){
			int sum=0;
			for(int j=49; j>=0; j--){
				sum+=length_for_char_index_cnt[i][j];
				if(sum>100){
					max_length_for_char[i]=j;
					break;
				}
			}
		}

		for(int i=0; i<26; i++) cout << max_length_for_char[i] << ',';
		cout << "0"<< endl;

	}
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
					if ( k < c ) { 
					cmd->head[0] = argv[k+1][0];
					cmd->head[1] = argv[k+1][1];
					cmd->head[2] = argv[k+1][2];
					cmd->head[3] = argv[k+1][3];
					}
					else { printf("\r\n - can't find param for: (%s)", argv[k] ); }
					break;

				case 3:
					if ( k < c ) { 
					cmd->counter = atoi(argv[k+1]);
					}
					else { printf("\r\n - can't find param for: (%s)", argv[k] ); }
					break;

				case 4:
					if ( k < c ) { 
					cmd->phpi = argv[k+1];
					}
					else { printf("\r\n - can't find param for: (%s)", argv[k] ); }
					break;

				case 5:
					cmd->w_direct_in_header = 1;
					break;

				case 6:
					cmd->use_gz = 1;
					break;

				case 7:
					for(int i=0; i<16; i++)
	                  cmd->Target_device_ID[i]=0;

					for(int i=0; i<16; i++){
	                  cmd->Target_device_ID[i]=argv[k+1][i];
					  if(argv[k+1][i]==0) break;
					}
					break;

				}
			}
		}
	}
	print_opts(cmd);
	return rv;
}
