url='http://hola.org/challenges/word_classifier/testcase'
newurl=$(curl -sI $url | grep 'Location: ' | sed -e 's/Location: //')
newurl=$(echo $newurl | sed -e 's/\r//')
#echo "Trying url 'https://hola.org$newurl'"
cd test_data
curl -sO "http://hola.org$newurl"
