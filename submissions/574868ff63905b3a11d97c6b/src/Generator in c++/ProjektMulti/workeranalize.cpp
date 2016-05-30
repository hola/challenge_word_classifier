#include "workeranalize.h"
#include <QDebug>
#include <QSqlQuery>
#include <QFile>
#include <QMessageBox>
#include <QSettings>
#include <QDir>
#include <QList>

WorkerAnalize::WorkerAnalize()
{
}

WorkerAnalize::~WorkerAnalize()
{

}

void WorkerAnalize::process(){

    qDebug() << "Start";
    QList<QString> lista;

    QFile file("C:\\Users\\TwZ\\Desktop\\words.txt");
    if(!file.open(QIODevice::ReadOnly)) {
        QMessageBox::information(0, "error", file.errorString());
    }

    QTextStream in(&file);
    while(!in.atEnd()) {
        QString line = in.readLine();
        lista.append(line);
    }

    file.close();

    qDebug() << "File Loaded!";

    QByteArray arr;
    arr.append("abcdefghijklmnoprstuvwxzy'q");
    int alphSize = arr.length();

    /**

      Note:

      I have run this program twice. First with 'startsWith' function,
        and next with 'contains' function commented below.

        I have uncommented it, build the program and run it.


      */


    //QString filename = "C:\\Users\\TwZ\\Desktop\\results_with_apostrophe_contains.csv";
    QString filename = "C:\\Users\\TwZ\\Desktop\\results_with_apostrophe_startsWith.csv";
    QFile file2(filename);
    file2.open(QIODevice::ReadWrite);
    QTextStream stream(&file2);

    for(int i=0;i<alphSize;i++) {
        for(int n=0;n<alphSize;n++) {
            for(int k=0;k<alphSize;k++) {
                QString pattern;
                pattern.append( arr.at(i) );
                pattern.append( arr.at(k) );
                pattern.append( arr.at(n) );

                int matches = 0;

                for(int t=0; t< lista.length(); t++) {
                    QString tmp = lista.at(t);
                    if( tmp.startsWith(pattern) ) {
                    //if( tmp.contains(pattern) ) {
                        matches++;
                    }
                }
                stream << "\"" << pattern << "\"" << "," << QString::number(matches) << ",\n";
            }
        }
    }

    emit finished();
    qDebug() << "End";
}

