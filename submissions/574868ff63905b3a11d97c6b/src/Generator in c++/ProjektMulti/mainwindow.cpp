#include "mainwindow.h"
#include "ui_mainwindow.h"
#include <QMessageBox>
#include <QSqlQuery>
#include <QSettings>
#include "workeranalize.h"
#include <QThread>
#include <QMdiSubWindow>
#include <QSizePolicy>
#include <QComboBox>

MainWindow::MainWindow(QWidget *parent) :
    QMainWindow(parent),
    ui(new Ui::MainWindow)
{    
    this->setWindowTitle("SubWord generator");
}

MainWindow::~MainWindow()
{
    delete ui;
}

// Run in new thread
void MainWindow::analize(){

    QThread * newthread = new QThread();
    WorkerAnalize* worker = new WorkerAnalize();
    worker->moveToThread(newthread);

    connect(newthread, SIGNAL(started()), worker, SLOT(process()));
    connect(worker, SIGNAL(finished()), worker, SLOT(deleteLater()));
    connect(newthread, SIGNAL(finished()), newthread, SLOT(deleteLater()));
    connect(worker, SIGNAL(finished()), newthread, SLOT(quit()));
    connect(worker, SIGNAL(finished()), this, SLOT(msgFinish()));

    newthread->start();

}

void MainWindow::msgFinish(){
    QMessageBox Msgbox;
    Msgbox.setText("Dictionary analysis finished.");
    Msgbox.exec();
}
