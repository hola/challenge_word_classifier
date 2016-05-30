#ifndef SOLVER
#define SOLVER

#include "types.h"

char solver_pre3[SMALL];
char solver_suf3[SMALL];
char solver_suf4[LARGE];

void solver_init(char* filename);
int solver_index(char* s);
int solver(char* a);

#endif
