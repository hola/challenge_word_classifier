#!/bin/bash

#################################################################
# Build list of bigrams that occur (not occur) in dictionary
#################################################################

S=""
# all possible words
DICTIONARY='./words.txt'
SAMPLES='./bigrams.txt'
# all possible bigrams
BIGRAMS=$(cat $SAMPLES)

S=""
NEGTOPOS=""

echo '{'
echo '  "pos": ['

while true ; do
  N=$(sed -n '/'$S'../{s/^'$S'\(..\).*/\1/;p}' $DICTIONARY | sort | uniq)
  if [ "$N" == "" ]; then
    break
  fi
  NEG=""
  POS=""
  for j in $BIGRAMS; do
    FOUND=true
    for i in $N ; do
      if [ "$i" == "$j" ]; then
        FOUND=false
        break
      fi
    done
    if $FOUND; then
      NEG=$NEG$j
    else
      POS=$POS$j
    fi
  done
  if [ ${#NEG} -gt ${#POS} ]; then
    echo "$D    {\"a\":\"$POS\","
    echo "    \"b\":["
    DD=""
    I=${#S}
    LINES[I]=$POS
    if [ "$NEGTOPOS" == "" ]; then
      NEGTOPOS=${#S}
    else
      if [ $I -gt 1 ]; then
      LN=${LINES[I-2]}
      if [ "$LN" != "" ]; then
        SS=$(echo $S | cut -c 1-$((I-2)))
        for (( k=0; k<${#LN}-1; k+=2 )); do
          S1=$(echo $LN | cut -c $((k+1))-$((k+2)))
          for (( l=0; l<${#POS}-1; l+=2 )); do
            S2=$(echo $POS | cut -c $((l+1))-$((l+2)))
            if grep -q "^$SS$S1$S2" $DICTIONARY; then
            if [ "$(grep "^$SS$S1$S2" $DICTIONARY)" != "" ]; then
              echo "$DD      {"
              echo "        \"x\":$k,"
              echo "        \"y\":$l"
              echo "      }"
              DD=,
            fi
          done
        done
      fi
      fi
    fi
    echo "    ]"
  else
    echo "$D    {\"a\":\"$NEG\""
  fi
  echo '}'
  D=,
  S=$S.
done

echo '  ],'
echo "  \"switch\":$NEGTOPOS"
echo '}'
