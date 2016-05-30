DESTDIR=$$PWD/..
QT += core
QT -= gui

CONFIG += c++11

TARGET = HolaConverter
CONFIG += console
CONFIG -= app_bundle

QMAKE_LFLAGS_WINDOWS += -Wl,--stack,32000000
#QMAKE_LFLAGS += /STACK:32000000

TEMPLATE = app

SOURCES += main.cpp \
    CharsTree.cpp

HEADERS += \
    CharsTree.h
