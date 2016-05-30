#include <QtCore>
#include <QtConcurrent>

#define LAYERS_SIZE 8

QVector<QString> symbols;
#define SYMBOLS_FILE "../symbols.json"
#define SYMBOLS_FILE2 "../symbols_250x6.txt"

QVector<QString> words;
#define WORDS_FILE "../words_orig.txt"

QVector< QVector<int> > wordsSymseq;

int*** neuro = NULL;
#define NEURO_FILE "neuro.bin"

#define LIMIT_SYMBOLS 360

#define THREAD_COUNT 9

#define TEST_FILE "../MEGA_TEST.json"

void deleteNeuro() {
    if (!neuro) {
        return;
    }

    qDebug() << "Delete neuro" << LAYERS_SIZE*symbols.size()*symbols.size();

    for (int i = 0; i < LAYERS_SIZE; i++) {
        for (int j = 0; j < symbols.size(); j++) {
            delete [] neuro[i][j];
        }
        delete [] neuro[i];
    }
    delete [] neuro;
    neuro = NULL;
}

void renewNeuro() {
    if (neuro) {
        deleteNeuro();
    }

    qDebug() << "Alloc neuro" << LAYERS_SIZE*symbols.size()*symbols.size();

    neuro = new int**[LAYERS_SIZE]();
    for (int i = 0; i < LAYERS_SIZE; i++) {
        neuro[i] = new int*[symbols.size()]();
        for (int j = 0; j < symbols.size(); j++) {
            neuro[i][j] = new int[symbols.size()]();
            for (int k = 0; k < symbols.size(); k++) {
                neuro[i][j][k] = 0;
            }
        }
    }
}

void writeNeuro() {
    QByteArray data;

    char byte = 0;
    int byteOffset = 0;
    for (int i = 0; i < LAYERS_SIZE; i++) {
        for (int j = 0; j < symbols.size(); j++) {
            for (int k = 0; k < symbols.size(); k++) {
                // bit
                char bit = 0;
                if (neuro[i][j][k] > 0) {
                    bit = 1;
                }

                bit = (bit << byteOffset);
                byte = (byte | bit);
                byteOffset++;
                if (byteOffset == 8) {
                    data.append(byte);
                    byteOffset = 0;
                    byte = 0;
                }

//                //byte
//                byte = (neuro[i][j][k] > 0);
//                data.append(byte);
            }
        }
    }
    //data.append(byte);

    QFile file(NEURO_FILE);
    if ( file.open(QIODevice::WriteOnly | QIODevice::Truncate) == false ) {
        qCritical() << "Can't open file";
        return;
    }
    qDebug() << "Size:" << data.size();
    qDebug() << "Writen:" << file.write(data);
    file.close();
}

void readSymbols() {
    qDebug() << "Reading symbols, old size" << symbols.size();
    symbols.clear();

    //    QFile file(SYMBOLS_FILE);
    //    if ( file.open(QIODevice::ReadOnly | QIODevice::Text) == false ) {
    //        qCritical() << "Can't open file";
    //        return;
    //    }

    //    while( !file.atEnd() ) {
    //        QString symbol = file.readLine();
    //        symbol.replace('\n', "");
    //        symbols.push_back( symbol.toLower() );
    //    }

    //    file.close();

    QFile file(SYMBOLS_FILE);
    if ( file.open(QIODevice::ReadOnly | QIODevice::Text) == false ) {
        qCritical() << "Can't open file";
        return;
    }

    QByteArray jsonData;
    jsonData = file.readAll();
    file.close();

    QJsonDocument jsonDoc = QJsonDocument::fromJson(jsonData);
    QJsonArray json = jsonDoc.array();
    for (int i = 0; i < json.size(); i++) {
        symbols.push_back( json.at(i).toString() );
    }

    qDebug() << "Symbols readed, count" << symbols.size();
}

void writeSymbols() {
    qDebug() << "Writing symbols, size" << symbols.size();


    QFile file2(SYMBOLS_FILE2);
    if ( file2.open(QIODevice::WriteOnly | QIODevice::Truncate | QIODevice::Text) == false ) {
        qCritical() << "Can't open file";
        return;
    }
    QTextStream stream(&file2);
    for (int i = 0; i < symbols.size(); i++) {
        stream << symbols.at(symbols.size()-1 - i) << '\n';
    }
    file2.close();


    QJsonArray json;
    for (int i = 0; i < symbols.size(); i++) {
        json.push_back( symbols.at(symbols.size()-1 - i) );
    }
    QJsonDocument jsonDoc(json);

    QFile file(SYMBOLS_FILE);
    if ( file.open(QIODevice::WriteOnly | QIODevice::Truncate | QIODevice::Text) == false ) {
        qCritical() << "Can't open file";
        return;
    }

    file.write(jsonDoc.toJson(QJsonDocument::Compact));
    file.close();
}

void word2symseq(const QString &word, QVector<int> &symseq, int wordI = 0, int goodLength = 0) {
    // перебор
    if (wordI > word.size()) {
        symseq.clear();
        return;
    }

    // найдено
    if (wordI == word.size()) {
        return;
    }

    // ветво границы
    if (goodLength != 0 && symseq.size() >= goodLength) {
        symseq.clear();
        return;
    }

    // Слишком длинно, уходим
    if (symseq.size()-1 >= LAYERS_SIZE) {
        symseq.clear();
        return;
    }

    QVector<int> goodSymseq;
    for (int idxSym = 0; idxSym < symbols.size(); idxSym++) {
        QString sym = symbols[idxSym];

        // Проверяем слог
        if (word.indexOf(sym, wordI) == wordI) {

            // Слог совпал, нужно идти глубже
            QVector<int> deeperSymseq = symseq;
            deeperSymseq.push_back(idxSym);
            word2symseq(word, deeperSymseq, wordI+sym.size(), goodLength);

            // Нашли что-то там в глубине?
            if (deeperSymseq.length() != 0) {

                // Оно там в глубине лучше чем уже есть?
                if (goodSymseq.length() == 0 ||
                        goodLength > deeperSymseq.length()) {
                    goodSymseq = deeperSymseq;
                    goodLength = goodSymseq.size();
                }
            }
        }
    }
    symseq = goodSymseq;
}

void symseqWords() {
    QElapsedTimer timer;
    timer.start();

    qDebug() << "------------------------";
    qDebug() << "Symseq words";

    if (symbols.size() <= 0) {
        qDebug() << "Read symbols bevore symseq";
        return;
    }

    wordsSymseq.clear();
    wordsSymseq.resize(words.size());

    QThreadPool::globalInstance()->setMaxThreadCount(THREAD_COUNT);

    QVector< QFuture<void> > threads;
    for (int threadNum = 0; threadNum < THREAD_COUNT; threadNum++) {
        threads.push_back( QtConcurrent::run( [=] () {

            int sizeToProcess = words.size()/THREAD_COUNT;

            int sizeFrom = threadNum*sizeToProcess;
            int sizeTo = sizeToProcess*(threadNum+1);
            if (threadNum == THREAD_COUNT-1) {
                // Крепись последний тред, тебе на THREAD_COUNT слов больше
                sizeTo = words.size();
            }

            qDebug() << threadNum << "from" << sizeFrom << "to" << sizeTo-1;

            QVector<int> symseq;
            for (int i = sizeFrom; i < sizeTo; i++) {
                symseq.clear();
                word2symseq(words.at(i), symseq);

                //if (symseq.size()-1 == 4) {
                    wordsSymseq[i] = symseq;
                //}

                if (i%(words.size()/20+1) == 0) {
                    qDebug() << threadNum << "progress(%) " << (double)i/words.size()*100;
                }
            }

            qDebug() << threadNum << "finished";
        }) );
    }

    for (int threadNum = 0; threadNum < THREAD_COUNT; threadNum++) {
        QFuture<void> fut = threads.at(threadNum);
        fut.waitForFinished();
    }

    qDebug() << "Symseq done," << timer.elapsed()/1000.0 << "sec";
    qDebug() << "------------------------";
}

void readWords(bool reversed = false) {
    qDebug() << "Reading words, old size" << words.size();
    words.clear();

    QFile file(WORDS_FILE);
    if ( file.open(QIODevice::ReadOnly | QIODevice::Text) == false ) {
        qCritical() << "Can't open file";
        return;
    }

    int reducedWordCount = 0;
    while( !file.atEnd() ) {
        QString word = file.readLine();
        word.replace('\n', "");

        if(reversed) {
            QString word2;
            for(int i = word.size() - 1; i >= 0; i--) {
                word2 += word[i];
            }
            word = word2;
        }

        if (word.size() < 4 || word.size() > 16) {
            reducedWordCount++;
            continue;
        }

        words.push_back( word.toLower() );
    }
    qDebug() << "Words readed, count" << words.size()
             << "reduced, " << reducedWordCount;

    file.close();

    symseqWords();
}

void printSymseqStat() {
    qDebug() << "------------------------";

    int stat[LAYERS_SIZE+1];
    for (int i = 0; i < LAYERS_SIZE+1; i++) {
        stat[i] = 0;
    }

    int cannotSymseqCount = 0;
    int tooLongSymseq = 0;
    for (int i = 0; i < wordsSymseq.size(); i++) {
        QVector<int> symseq = wordsSymseq[i];

        if (symseq.size() <= 0) {
            cannotSymseqCount++;
            //qDebug() << words[i];
            continue;
        }

        if (symseq.size()-1 > LAYERS_SIZE) {
            tooLongSymseq++;
            continue;
        }

        stat[symseq.size()-1]++;
    }

    int sumCount = 0;
    qDebug() << "Symseq stat:";
    qDebug() << 0 << cannotSymseqCount;
    for (int i = 0; i < LAYERS_SIZE+1; i++) {
        qDebug() << i+1 << stat[i];
        sumCount += stat[i];
    }
    qDebug() << LAYERS_SIZE+2 << tooLongSymseq;
    qDebug() << "------------------------";
    qDebug() << "Can't symseq :" << cannotSymseqCount;
    qDebug() << "One sym seq  :" << stat[0];
    qDebug() << "Profit symseq:" << sumCount;
    qDebug() << "Too long seq :" << tooLongSymseq;
    qDebug() << "Total        :" << cannotSymseqCount+sumCount+tooLongSymseq;
    qDebug() << "------------------------";
}

void learnNeuro() {
    qDebug() << "Neuro learning";

    for (int i = 0; i < wordsSymseq.size(); i++) {
        QVector<int> symseq = wordsSymseq[i];

        if (symseq.size() <= 0) {
            continue;
        }

        if (symseq.size() == 1) {
            continue;
        }

        if (symseq.size()-1 > LAYERS_SIZE) {
            continue;
        }

        for (int s = 0; s < symseq.size()-1; s++) {
            neuro[s][symseq[s]][symseq[s+1]]++;
        }
    }

    for (int i = 0; i < LAYERS_SIZE; i++) {
        int count = 0;
        for (int j = 0; j < symbols.size(); j++) {
            for (int k = 0; k < symbols.size(); k++) {
                if (neuro[i][j][k] > 0) {
                    count++;
                    break;
                }
            }
        }
        qDebug() << "Layer " << i << " : symbols used = " << count;
    }

    writeNeuro();
}

void processNeuroStatistic() {

    qDebug() << "------------------------";
    qDebug() << "Process neuro stat";

    int neuroMatrix[symbols.length()][symbols.length()];
    for (int i = 0; i < symbols.size(); i++) {
        for (int j = 0; j < symbols.size(); j++) {
            neuroMatrix[i][j] = 0;
        }
    }

    int countOfConnections[LAYERS_SIZE];
    int binCountOfConnections[LAYERS_SIZE];

    for (int idxLay = 0; idxLay < LAYERS_SIZE; idxLay++) {
        countOfConnections[idxLay] = 0;
        binCountOfConnections[idxLay] = 0;
        for (int i = 0; i < symbols.size(); i++) {
            for (int j = 0; j < symbols.size(); j++) {
                neuroMatrix[i][j] += neuro[idxLay][i][j];
                countOfConnections[idxLay] += neuro[idxLay][i][j];

                if (neuro[idxLay][i][j]) {
                    binCountOfConnections[idxLay]++;
                }
            }
        }
    }

    qDebug() << "Count of connections: ";
    int totalConnections = 0;
    for (int idxLay = 0; idxLay < LAYERS_SIZE; idxLay++) {
        qDebug() << idxLay << countOfConnections[idxLay];
        totalConnections += countOfConnections[idxLay];
    }
    qDebug() << "total connections:" << totalConnections;

    qDebug() << "------------------------";
    qDebug() << "Bin count of connections: ";
    totalConnections = 0;
    for (int idxLay = 0; idxLay < LAYERS_SIZE; idxLay++) {
        qDebug() << idxLay << binCountOfConnections[idxLay];
        totalConnections += binCountOfConnections[idxLay];
    }
    qDebug() << "total bin connections:" << totalConnections;

    QMap<QString, int> mapNewSymbolsStat;
    for (int i = 0; i < symbols.size(); i++) {
        // Диагональ отдельно
        QString key = symbols[i] + symbols[i];
        int value = mapNewSymbolsStat.value(key, 0);
        value += neuroMatrix[i][i];
        mapNewSymbolsStat.insert( key,
                                  value);

        for (int j = 0; j < symbols.size(); j++) {
            // Пропускаем диагональ
            if (i == j) {
                continue;
            }

            key = symbols[i] + symbols[j];
            value = mapNewSymbolsStat.value(key, 0);
            value += neuroMatrix[i][j];
            mapNewSymbolsStat.insert( key,
                                      value);
        }
    }


    auto lessThanLambda = [](const QPair<QString, int> &a,
            const QPair<QString, int> &b)->bool{
        return a.second < b.second;
    };

    auto greaterThanLambda = [](const QPair<QString, int> &a,
            const QPair<QString, int> &b)->bool{
        return a.second > b.second;
    };

    QVector < QPair<QString,int> > newSymbolsStat;
    newSymbolsStat.reserve( mapNewSymbolsStat.size() );
    for (auto i = mapNewSymbolsStat.constBegin();
         i != mapNewSymbolsStat.constEnd();
         ++i) {
        newSymbolsStat.push_back( QPair<QString, int>( i.key(), i.value() ) );
    }
    qSort( newSymbolsStat.begin(), newSymbolsStat.end(), greaterThanLambda );

    QMap<QString, int> mapOldSymbolsStat;
    for (int i = 0; i < symbols.size(); i++) {
        // Диагональ отдельно
        QString key = symbols[i];
        int value = neuroMatrix[i][i];

        for (int j = 0; j < symbols.size(); j++) {
            // Пропускаем диагональ
            if (i == j) {
                continue;
            }
            value += neuroMatrix[i][j];
            value += neuroMatrix[j][i];
            mapOldSymbolsStat.insert( key,
                                      value);
        }
    }
    QVector < QPair<QString,int> > oldSymbolsStat;
    oldSymbolsStat.reserve(mapOldSymbolsStat.size() );
    for (auto i = mapOldSymbolsStat.constBegin();
         i != mapOldSymbolsStat.constEnd();
         ++i) {
        oldSymbolsStat.push_back( QPair<QString, int>( i.key(), i.value() ) );
    }
    qSort( oldSymbolsStat.begin(), oldSymbolsStat.end(), lessThanLambda );

    int PRINT_TOP_COUNT = 10;
    qDebug() << "------------------------";
    qDebug() << "New symbols stat," << newSymbolsStat.size();
    for (int i = 0; i < PRINT_TOP_COUNT; i++) {
        qDebug() << newSymbolsStat[i];
    }
    qDebug() << "------------------------";
    qDebug() << "Old symbols stat," << oldSymbolsStat.size();
    for (int i = 0; i < PRINT_TOP_COUNT; i++) {
        qDebug() << oldSymbolsStat[i];
    }
    qDebug() << "------------------------";

    QVector<QString> newSymbols;
//    for (int i = 0; i < newSymbolsStat.size(); i++) {
//        newSymbols.append( newSymbolsStat[i].first );
//    }

    for (int i = 0; i < oldSymbolsStat.size(); i++) {
        newSymbols.push_back( oldSymbolsStat[i].first );
    }
    qDebug() << "Old symbols size" << newSymbols.size();

    int j = 0;
    QVector<QString> oneSymbols;
    for (int i = 0;
         oldSymbolsStat[i].second < newSymbolsStat[j].second ||
         newSymbols.size() > LIMIT_SYMBOLS;
         i++) {
        QString s = newSymbols.takeFirst();
        if (s.size() <= 1) {
            // NOTE: one symbols disabled
            oneSymbols.push_back(s);
        } else {
            j++;
        }

        if (j >= newSymbolsStat.size() || i >= oldSymbolsStat.size()) {
            break;
        }
    }
    qDebug() << "Reduced symbols size" << newSymbols.size();
    qDebug() << "One sym size" << oneSymbols.size();

    for (int i = 0;
         newSymbols.size() < LIMIT_SYMBOLS &&
         i < newSymbolsStat.size();
         i++) {
        newSymbols.push_front(newSymbolsStat[i].first);
    }
    oneSymbols.append(newSymbols);
    qDebug() << "New symbols size" << oneSymbols.size();

    symbols = oneSymbols;
//    for (int i = 0; i < 100; i++) {
//        symbols.append(newSymbolsStat[i].first);
//    }

    qDebug() << "------------------------";
}

void testNeuro() {
    qDebug() << "------------------------";
    qDebug() << "Start testing";
    QFile file(TEST_FILE);
    if ( file.open(QIODevice::ReadOnly | QIODevice::Text) == false ) {
        qCritical() << "Can't open file";
        return;
    }

    QByteArray jsonData;
    jsonData = file.readAll();
    file.close();

    QJsonDocument jsonDoc = QJsonDocument::fromJson(jsonData);
    QJsonObject test = jsonDoc.object();

    qsrand( QTime::currentTime().msecsSinceStartOfDay() );
    QStringList	testWords = test.keys();
//    while(testWords.size() > 500) {
//        testWords.removeAt( qrand()%testWords.size() );
//    }

    int trueAnswers = 0;

    int trueCantSym = 0;
    int countCantSym = 0;

    int trueOneSym = 0;
    int countOneSym = 0;

    int trueNeuro = 0;
    int neuroCount = 0;
    for (int idxTest = 0; idxTest < testWords.size(); idxTest++) {
        QString testWord = testWords.at(idxTest);
        bool testAnswer = test.value(testWord).toBool();

        bool neuroAnswer = true;
        QVector<int> testSymseq;
        word2symseq(testWord, testSymseq);


        if (testSymseq.size() <= 0) {
            neuroAnswer = false;
            countCantSym++;
            if (neuroAnswer == testAnswer) {
                trueCantSym++;
            }
        } else if (testSymseq.size() == 1) {
            neuroAnswer = true;
            countOneSym++;
            if (neuroAnswer == testAnswer) {
                trueOneSym++;
            }
        } else if (testSymseq.size()-1 > LAYERS_SIZE) {
            qCritical() << "Too long sym seq";
            neuroAnswer = false;
        } else {
            for (int idxLay = 0; idxLay < testSymseq.size()-1; idxLay++) {
                if (neuro[idxLay][testSymseq[idxLay]][testSymseq[idxLay+1]] <= 0) {
                    neuroAnswer = false;
                    break;
                }
            }
            neuroCount++;
            if (neuroAnswer == testAnswer) {
                trueNeuro++;
            }
        }

        if (neuroAnswer == testAnswer) {
            trueAnswers++;
        }
    }

    qDebug() << "All tests finished";
    qDebug() << "------------------------";
    qDebug() << "Summary answers:" << testWords.size();
    qDebug() << "True answers:" << trueAnswers;
    qDebug() << "In percent:" << (double)trueAnswers/testWords.size()*100;
    qDebug() << "------------------------";
    qDebug() << "Cant symseq:" << countCantSym;
    qDebug() << "True cant:" << trueCantSym;
    qDebug() << "In percent:" << (double)trueCantSym/countCantSym*100;
    qDebug() << "------------------------";
    qDebug() << "One symb:" << countOneSym;
    qDebug() << "True one:" << trueOneSym;
    qDebug() << "In percent:" << (double)trueOneSym/countOneSym*100;
    qDebug() << "------------------------";
    qDebug() << "Neuro :" << neuroCount;
    qDebug() << "True neuro:" << trueNeuro;
    qDebug() << "In percent:" << (double)trueNeuro/neuroCount*100;
    qDebug() << "------------------------";
}

int main()
{
    readSymbols();
    renewNeuro();

    readWords(false);

    learnNeuro();
    testNeuro();

    printSymseqStat();
    // WARNING: symbols change
    processNeuroStatistic();

    // BUG: symbols.size was changed deleteNeuro();
    writeSymbols();

    qDebug() << "done";
    return 0;
}
