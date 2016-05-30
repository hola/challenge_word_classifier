START=4222222124
S1=10
NUM=99990

K=0; while [ $K -lt $NUM ] ; do
  ID=$(($START+$S1+$K))
  K=$(($K+1))
  URL="https://hola.org/challenges/word_classifier/testcase/$ID"
  OUT="$ID.json"
  wget -O "$OUT" "$URL"
done
