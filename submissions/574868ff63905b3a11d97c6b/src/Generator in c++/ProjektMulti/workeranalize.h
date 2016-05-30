#ifndef WORKERANALIZE_H
#define WORKERANALIZE_H

#include <QObject>

class WorkerAnalize : public QObject
{
    Q_OBJECT

public:
    WorkerAnalize();
    ~WorkerAnalize();
    QString analyze(int number);

private:

public slots:
    void process();

signals:
    void finished();
};

#endif // WORKERANALIZE_H
