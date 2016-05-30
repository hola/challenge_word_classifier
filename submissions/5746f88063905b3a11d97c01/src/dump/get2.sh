START=2209126933
S1=0
NUM=100000

K=0; while [ $K -lt $NUM ] ; do
  ID=$(($START+$S1+$K))
  K=$(($K+1))
  URL="https://hola.org/challenges/word_classifier/testcase/$ID"
  OUT="$ID.json"
  wget -O "$OUT" "$URL"
done
