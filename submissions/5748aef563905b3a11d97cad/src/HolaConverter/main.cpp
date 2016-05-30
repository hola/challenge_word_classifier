#include <QCoreApplication>
#include <QFile>
#include <QDebug>
#include <QTextStream>
#include "CharsTree.h"

int main(int argc, char *argv[])
{
  QCoreApplication a(argc, argv);

  CharsTree tree;
  QFile     fileIn("words.txt");
  QString   line(255, '\0');

  if (fileIn.open(QIODevice::ReadOnly))
  {
    QTextStream in(&fileIn);
    int total = 0;

    while (!in.atEnd())
    {
      total++;
      in.readLineInto(&line);
      tree.ProcessWord(line.toLower(), 4);
    }
    fileIn.close();
  }

  QFile fileOut("words.bin");

  // find subtrees

  /*tree.CompactTree(2);

     qInfo() << "Serializing tree...";

     if (fileOut.open(QIODevice::WriteOnly)) {
     tree.SerializeJSON(fileOut);
     fileOut.close();
     }*/

  if (fileOut.open(QIODevice::ReadWrite)) {
    qInfo() << "Serializing stat tree...";
    tree.SerializeBinaryStat(fileOut);
    auto size = fileOut.size();
    qInfo() << "Written: " << size;

    qInfo() << "Serializing main tree...";
    tree.SerializeBinary(fileOut);
    qInfo() << "Written: " << fileOut.size() - size;

    fileOut.close();
  }


  qInfo() << "All Done!";

  // return a.exec();
  return 0;
}
