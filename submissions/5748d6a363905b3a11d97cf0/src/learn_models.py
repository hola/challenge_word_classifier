# -*- coding: utf-8 -*-
#-------------------------------------------------------------------------------
# Name:        learn_models.py
# Purpose:     Using multiple learning models to training the classification
#
# Author:      rabbit125
#
# Created:     2016/05/22
# Copyright:   (c) rabbit125 2014
#
# Usage:       learn_models.py -d PATH_TO_FEATURE_FILE -f FEATURE_FILE_NAME -m MODELS
#-------------------------------------------------------------------------------

import argparse
import gzip
import json
import math
import numpy as np
import os
import re
import random
import sys
import time
from collections import Counter

# python33
if sys.version_info < (3,3):
    import cPickle as pck
else:
    import _pickle as pck

from operator import itemgetter, attrgetter

from sklearn.metrics import roc_auc_score   as AUC
from sklearn.metrics import accuracy_score  as ACC
from sklearn.metrics import f1_score        as F1
from sklearn.metrics import log_loss        as LOGLOSS
from sklearn.metrics import recall_score    as RS
from sklearn.metrics import precision_score as PS
from sklearn import cross_validation                 as CV
from sklearn.cross_validation import StratifiedKFold as KFold
from sklearn import grid_search                      as GS

from sklearn.datasets import make_gaussian_quantiles
from sklearn.ensemble import AdaBoostClassifier              as ADA
from sklearn import tree
from sklearn.tree import DecisionTreeClassifier              as DT
from sklearn.svm import SVC                                  as CSVC
from sklearn.ensemble import GradientBoostingClassifier      as GBM
from sklearn.linear_model import LogisticRegression          as LR
from sklearn.linear_model import LinearRegression            as LinR
from sklearn.svm import LinearSVC                            as LSVC
from sklearn.naive_bayes import GaussianNB                   as NB
from sklearn.neural_network import BernoulliRBM              as NN
from sklearn.svm import NuSVC                                as NSVC
from sklearn.linear_model import PassiveAggressiveClassifier as PAC
from sklearn.linear_model import Perceptron                  as PCP
from sklearn.ensemble import RandomForestClassifier          as RF
from sklearn.linear_model import SGDClassifier               as SGD
from sklearn.cluster import KMeans                           as KMEANS
from sklearn.cluster import MiniBatchKMeans                  as KMINI
from time import strftime

from sklearn.externals.six import StringIO
import pydotplus
from IPython.display import Image

from decision_tree_parser import DTParser

class LearningModels():

    model_p = ''
    clf     = None
    def __init__(self):
        self.model_p = ''
        self.clf     = None
        self.pred_train_t    = None # group id in Unsupervised
        self.pred_test_t     = None
        self.pred_train_prob = None
        self.pred_test_prob  = None
        self.models_dict     = {"models": []}

    def _ModelSetting(self, model_name, cv_train_p=None):
        self.model_p = ''
        self.clf     = None

        if model_name == 'K-MEANS':
            pars = [cv_train_p, 50000, 0.00001]
            self.model_p = '-'.join(str(p) for p in pars)
            self.clf = KMEANS(n_clusters=pars[0], init='k-means++', n_init=10, max_iter=pars[1],
                              tol=pars[2], precompute_distances='auto', verbose=0,
                              random_state=None, copy_x=True, n_jobs=4)
        if model_name == 'K-MINI':
            pars = [cv_train_p, 10000, 0.0]
            self.model_p = '-'.join(str(p) for p in pars)
            self.clf = KMINI(n_clusters=pars[0], init='k-means++', max_iter=pars[1], batch_size=100,
                             verbose=0, compute_labels=True, random_state=None, tol=pars[2],
                             max_no_improvement=10, init_size=None, n_init=3, reassignment_ratio=0.01)

        if model_name == 'PAC':
            self.clf = PAC(C=1.0, fit_intercept=True, n_iter=5, shuffle=True,
                           verbose=0, loss='hinge', n_jobs=1, random_state=None,
                           warm_start=False, class_weight='balanced')
        if model_name == 'PCP':
            self.clf = PCP(penalty=None, alpha=0.0001, fit_intercept=True, n_iter=20,
                           shuffle=False, verbose=0, eta0=1.0, n_jobs=6, random_state=0,
                           class_weight=None, warm_start=False)
        if model_name == 'NB':
            self.clf = NB()

        if model_name == 'SGD':
            pars = [1e-4, None, 'hinge', 200]
            # loss = 'modified_huber', 'hinge' n_iter = 5
            self.model_p = '-'.join(str(p) for p in pars)
            self.clf = SGD(loss=pars[2], penalty='l2', alpha=pars[0], l1_ratio=0.15, fit_intercept=True,
                           n_iter=pars[3], shuffle=True, verbose=0, epsilon=0.1, n_jobs=1, random_state=None,
                           learning_rate='optimal', eta0=0.0, power_t=0.5, class_weight=pars[1],
                           warm_start=False, average=False)
        if model_name == 'LSVC':
            pars = [1e-5, 1e-2, 'balanced', 2000]
            # 'crammer_singer'
            self.model_p = '-'.join(str(p) for p in pars)
            self.clf = LSVC(penalty='l2', loss='squared_hinge', dual=False, tol=pars[0], C=pars[1],
                            multi_class='ovr', fit_intercept=True, intercept_scaling=1,
                            class_weight=pars[2], verbose=0, random_state=None, max_iter=pars[3])
        if model_name == 'CSVC':
            pars = [8, 'rbf', 0.00048828125, 'balanced']
            pars = [1e2, 'linear', 1e-3, 'auto']
            self.model_p = '-'.join(str(p) for p in pars)
            self.clf = CSVC(C=pars[0], kernel=pars[1], degree=3, gamma=pars[2], coef0=0.0,
                            shrinking=True, probability=True, tol=1e-3, cache_size=5000,
                            class_weight=pars[3], verbose=False, max_iter=-1, random_state=None)
        if model_name == 'NSVC':
            #pars = [0.5, 'rbf', 0.00048828125, 'auto']
            pars = [0.5, 'rbf', 'auto', 'auto']
            self.model_p = '-'.join(str(p) for p in pars)
            self.clf = NSVC(nu=pars[0], kernel=pars[1], degree=3, gamma=pars[2], coef0=0.0,
                            shrinking=True, probability=False, tol=0.001, cache_size=500,
                            class_weight=pars[3], verbose=False, max_iter=-1, decision_function_shape=None, random_state=None)
        if model_name == 'LR':
            pars = ['l2', 1e+2, 'balanced', 3000]
            self.model_p = '-'.join(str(p) for p in pars)
            self.clf = LR(penalty=pars[0], dual=False, tol=0.0001, C=pars[1], fit_intercept=True,
                          intercept_scaling=1, class_weight=pars[2], random_state=None, solver='liblinear',
                          max_iter=pars[3], multi_class='ovr', verbose=0, warm_start=False, n_jobs=1)
        if model_name == 'LinR':
            pars = [True]
            self.model_p = '-'.join(str(p) for p in pars)
            self.clf = LinR(fit_intercept=True, normalize=pars[0], copy_X=True, n_jobs=1)
        if model_name == 'DT':
            pars = [8, 'balanced']
            self.model_p = '-'.join(str(p) for p in pars)
            self.clf = DT(criterion='gini', splitter='best', max_depth=pars[0], min_samples_split=1,
                          min_samples_leaf=1, min_weight_fraction_leaf=0.0, max_features=None, random_state=None,
                          max_leaf_nodes=None, class_weight=pars[1], presort=False)
        if model_name == 'RF':
            pars = [5, 7, 'balanced']
            self.model_p = '-'.join(str(p) for p in pars)
            self.clf = RF(n_estimators=pars[0], criterion='gini', max_depth=pars[1], min_samples_split=2,
                          min_samples_leaf=1, min_weight_fraction_leaf=0.0, max_features='auto',
                          max_leaf_nodes=None, bootstrap=True, oob_score=False, n_jobs=2, random_state=None,
                          verbose=0, warm_start=False, class_weight=pars[2])
        if model_name == 'ADA':
            pars = [13, 18, 0.05]
            self.model_p = '-'.join(str(p) for p in pars)
            self.clf = ADA(base_estimator=DT(max_depth=pars[0], class_weight='balanced'),
                           n_estimators=50, learning_rate=1.0, algorithm='SAMME.R', random_state=None)
        if model_name == 'GBM':
            pars = [20, 0.03, 13]
            self.model_p = '-'.join(str(p) for p in pars)
            self.clf = GBM(loss='deviance', learning_rate=pars[1], n_estimators=pars[0], subsample=1.0,
                           min_samples_split=2, min_samples_leaf=1, min_weight_fraction_leaf=0.0,
                           max_depth=pars[2], init=None, random_state=None, max_features=None, verbose=0,
                           max_leaf_nodes=None, warm_start=False, presort='auto')

    def UnSuperVisedMakeModel(self, model_name, data_f, data_t=None):
        """Training Model"""
        t1 = time.time()
        best_group = [8, -1e15]
        for group_sz in range(8, 31):
            self._ModelSetting(model_name, group_sz)
            self.clf.fit(data_f)
            cur_score = float(self.clf.score(data_f))
            if best_group[1] < cur_score:
                best_group = [group_sz, cur_score]
        self._ModelSetting(model_name, best_group[0])
        print('------------------------------------')
        print('Model            : %15s' % model_name)
        print('Parameters       : %15s' % self.model_p)
        print('Best group size  : %d / %.9f' % (best_group[0], best_group[1]))
        self.clf.fit(data_f)
        score = float(self.clf.score(data_f))
        t2 = time.time()
        print('Training     time: %7s seconds' % str(np.round(t2-t1, 0)))
        """Predicting"""
        self.pred_train_t = self.clf.predict(data_f)
        t3 = time.time()
        print('Predicting   time: %7s seconds' % str(np.round(t3-t2, 0)))
        """Scoring"""
        print('------------------------------------')
        print('K-means score: %.9f' % score)
        print('------------------------------------')

    def SuperVisedMakeModel(self, model_name, train_f, train_t, test_f, test_t, is_valid = 0, do_cv = 2):

        """Training Model"""
        t1 = time.time()
        self._ModelSetting(model_name)
        print('------------------------------------')
        print('Model            : %15s' % model_name)
        print('Parameters       : %15s' % self.model_p)

        self.clf.fit(train_f, train_t)
        acc1 = float(self.clf.score(train_f, train_t))
        #self.clf.fit(test_f, test_t)
        acc2 = float(self.clf.score(test_f, test_t))
        t2 = time.time()
        print('Training         time: %7s seconds' % str(np.round(t2-t1, 0)))

        """Predicting"""
        train_pred1 = self.clf.predict(train_f)
        #train_pred2 = self.clf.predict_proba(train_f)
        test_pred1 = self.clf.predict(test_f)
        #test_pred2 = self.clf.predict_proba(test_f)
        t3 = time.time()
        print('Predicting       time: %7s seconds' % str(np.round(t3-t2, 0)))

        """CV"""
        if do_cv > 0:
            cv_scores = CV.cross_val_score(self.clf, train_f, train_t, cv = do_cv, scoring = 'accuracy')
            #cv_scores2 = CV.cross_val_score(self.clf, train_f, train_t, cv = 2, scoring = 'roc_auc', n_jobs = -1)
            #cv_scores = CV.cross_val_score(self.clf, train_f, train_t, cv = 5, scoring = 'log_loss', n_jobs = -1)
            t4 = time.time()
            print('Cross Validation time: %7s seconds' % str(np.round(t4-t3, 0)))
            print('CV Accuracy      : %.9f (+/- %0.5f)' % (cv_scores.mean(), cv_scores.std() * 2))
            print(cv_scores)
            self.models_dict["%s_score" % model_name] = cv_scores.mean()
        """Scoring"""
        print('Training Accuracy: %.9f' % acc1)
        print('Training AUC     : %.9f' % AUC(train_t, train_pred1))
        #print('Training LogLoss : %.9f' % LOGLOSS(train_t, train_pred2, eps = 1e-15))
        if is_valid:
            print('Valid Accuracy   : %.9f' % acc2)
            print('Valid AUC        : %.9f' % AUC(test_t, test_pred1))
            #print('Valid LogLoss    : %.9f' % LOGLOSS(test_t, test_pred2, eps = 1e-15))
            # ['macro', 'micro', 'weighted']
            # f1_modes = ['macro', 'micro', 'weighted']
            # f1_modes = ['binary']
            # for mode in f1_modes:
            #     f1 = F1(test_t, test_pred1, average=mode)
            #     ps = PS(test_t, test_pred1, average=mode)
            #     rs = RS(test_t, test_pred1, average=mode)
            #     print('V-scores %8s: F1 %.9f / Precision %.9f / Recall %.9f' % (mode, f1, ps, rs))

        #return test_pred, train_pred
    def DumpModelDetails(self, model_name, big_f, big_t):
        print('------------------------------------')
        t1 = time.time()
        self.clf.fit(big_f, big_t)
        reacc = float(self.clf.score(big_f, big_t))
        t2 = time.time()
        print('Re-Training      time: %7s seconds' % str(np.round(t2-t1, 0)))
        print('Re-Training Accuracy : %.9f' % reacc)
        if model_name in ["DT", "RFx"]:
            if model_name == "RF":
                print(self.clf.estimators_)
            model_output = "[%s][%s].txt" % (paras.args['featurefile'].split(".")[0], model_name)
            tree.export_graphviz(self.clf, out_file=model_output)
            tree_paser = DTParser(1)
            tree_paser.ParseTree(model_output, "%s.js" % model_output[:model_output.rfind(".")])
            self.models_dict["models"].append(model_name)
            self.models_dict["%s_weights" % model_name] = tree_paser.tree_str
            self.models_dict["%s_min_max_prob" % model_name] = tree_paser.min_max_prob
            #model_output_file = StringIO()
            #tree.export_graphviz(self.clf, out_file=model_output_file)
            #graph = pydotplus.graph_from_dot_data(model_output_file.getvalue())
            #graph.write_pdf("[%s][%s].pdf" % (paras.args['featurefile'].split(".")[0], model_name))
        # writing Model...
        if model_name in ["LR", "LSVC", "SGD"]:
            ##print(self.clf.coef_)
            ##print(self.clf.intercept_)
            weights = self.clf.coef_
            coef    = self.clf.intercept_
            if model_name in ["LR", "LSVC", "SGD"]:
                weights = self.clf.coef_[0]
                coef    = self.clf.intercept_[0]
            self.models_dict["models"].append(model_name)
            self.models_dict["%s_weights" % model_name] = weights.tolist()
            self.models_dict["%s_coef" % model_name] = coef
            model_output = "[%s][%s].txt" % (paras.args['featurefile'].split(".")[0], model_name)
            with open(model_output, "w") as fout:
                fout.write("var %s_weight = [%s];\n" % (model_name, ", ".join(str(w) for w in weights)))
                fout.write("var %s_coef = %s;\n" % (model_name, coef))
                fout.write("var %s_dim = %d;\n" % (model_name, len(weights)))
                fout.write("for(var i = 0; i < %s_dim; i++)\n" % model_name)
                fout.write("    predict_ret += %s_weight[i] * features[i];\n" % model_name)
                fout.write("predict_ret += %s_coef;\n" % model_name)
                fout.close()
            print("Dump %s model successfully.. [%s]" % (model_name, model_output))

class Args(object):
    args = None
    def __init__(self):
        self.args = self.ParaSet()
        print(self.args)

    def ParaSet(self):
        argparser = argparse.ArgumentParser(description='learn_models.py -d PATH_TO_FEATURE_FILE -f FEATURE_FILE_NAME -m MODELS')
        argparser.add_argument('-d',  '--datapath',    type=str, default='K:\\',          help='path to generated feature.pkl dir')
        argparser.add_argument('-f',  '--featurefile', type=str, default='feature01.pkl', help='file name of generated feature.pkl')
        argparser.add_argument('-m',  '--models',      type=str, default=['LR', 'LSVC'],  help='model: ADA, RF, LR, CSVC...', nargs='+')
        cur_args = argparser.parse_args()
        cur_args = vars(cur_args)
        return cur_args

def ReadFromPickle(file):
    """reading form file
        File format:
            [data_features, data_label] with Pickle
    """
    with open(file, 'rb') as fin:
        [data_f, data_t] = pck.load(fin)
    return data_f, data_t

def main():
    global paras
    """Initialize.."""
    paras = Args()
    start_time = time.time()
    models = LearningModels()

    hash_file_name = "%s_hash_tabel" % paras.args['featurefile'][:paras.args['featurefile'].rfind(".")]
    with open(hash_file_name) as data_file:
        models.models_dict.update(json.load(data_file))
    print(models.models_dict["BF_hs"][:100])
    print("Load hash table data ... Done")
    print('----End Initailizing Data----\n')

    """Read Data.."""
    target_data = os.path.join(paras.args['datapath'], paras.args['featurefile'])
    all_f, all_t = ReadFromPickle(target_data)
    train_ratio = 0.8
    data_size = len(all_f)
    all_label = [idx for idx in range(data_size)]
    random.shuffle(all_label)
    train_size = (int)(data_size * train_ratio)
    train_f = all_f[:train_size]
    train_t = all_t[:train_size]
    test_f = all_f[train_size:]
    test_t = all_t[train_size:]

    print("Feature input : %15s" % target_data)
    print("All data      : %15d" % len(all_f))
    print("Feature Dim   : %15d" % len(all_f[0]))
    print("Training data : %15d" % len(train_f))
    print("Testing data  : %15d" % len(test_f))

    end_t1 = time.time()
    print('Reading Data     time: %7s seconds' % str(np.round(end_t1 - start_time, 0)))
    print('----End Reading Data----')

    """Parameters Setting.."""
    # queue:        PAC, PCP, SGD, CSVC, NSVC, LSVC, LR, RF, DT, NB, ADA, GBM
    # ok:           RF DT LR NB SGD GBM
    # long run:     ADA CSVC
    # ??            NSVC
    # can't(prob):  NN PAC PCP LSVC

    #model_set = ['RF', 'DT', 'LR', 'NB', 'SGD', 'ADA']
    model_set = ['RF', 'LR', 'GBM', 'ADA']
    model_set = ['RF', 'LR', 'GBM', 'ADA', 'SGD', 'NB', 'CSVC']
    model_set = ['RF']
    model_set = ['RF', 'LR']
    model_set = ['DT', 'LR', 'ADA', 'SGD', 'NB', 'CSVC', 'PAC', 'K-MEANS']

    """Supervised Learning.."""
    for m_name in (paras.args['models']):
        print('')
        """Learning Model"""
        models.SuperVisedMakeModel(m_name, train_f, train_t, test_f, test_t, 1)
        print('----End Modeling & Evaluating----\n')
        models.DumpModelDetails(m_name, all_f, all_t)
        print('----End Writing Model----\n')

    all_models_output = "data[%s][%s]" % (paras.args['featurefile'].split(".")[0], "-".join(paras.args['models']))
    with open(all_models_output, "w") as fout:
        #json.dump(models.models_dict, fout, sort_keys=True, indent=2)
        json.dump(models.models_dict, fout)
        fout.close()
    print("Dump %s models successfully.. [%s]" % ("-".join(paras.args['models']), all_models_output))

    # write .gz file
    ftextin = open(all_models_output, 'rb')
    gz_fname = "%s.gz" % all_models_output
    with gzip.open(gz_fname, 'wb') as fgzout:
        fgzout.writelines(ftextin)
        fgzout.close()
    ftextin.close()
    print("Compress hashing table to gz file... Done [%s]" % gz_fname)
    print("Size of %s = %d bytes" % (gz_fname, os.path.getsize(gz_fname)))


    print('----End Writing Multi-Models----\n')

    end_time = time.time()
    print('Done in %s seconds!' % str(np.round(end_time-start_time, 0)))

if __name__=='__main__':
    main()

