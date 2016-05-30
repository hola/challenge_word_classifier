# -*- coding: utf-8 -*-
#-------------------------------------------------------------------------------
# Name:        decision_tree_parser.py
# Purpose:     Parsing Scikit-learn's Tree Data structure as JS script
#
# Author:      rabbit125
#
# Created:     2016/05/22
# Copyright:   (c) rabbit125 2014
#
# Usage:       decision_tree_parser.py -d PATH_TO_FILE -f DT_FILE
#-------------------------------------------------------------------------------

import argparse
import os
import re

class Args(object):
    args = None
    def __init__(self):
        self.args = self.ParaSet()
        print(self.args)

    def ParaSet(self):
        argparser = argparse.ArgumentParser(description='decision_tree_parser.py -d PATH_TO_FILE -f DT_FILE')
        argparser.add_argument('-d',  '--datapath', type=str, default='.',                help='path to generated Decision Tree dir')
        argparser.add_argument('-f',  '--dtfile',   type=str, default='[test-1][DT].txt', help='file name of Decision Tree')
        cur_args = argparser.parse_args()
        cur_args = vars(cur_args)
        return cur_args

class DTParser(object):
    node_cnt = 0
    min_max_prob = [1.0, 0.0]
    edges = {}
    nodes = {}
    left_is_true = -1
    tree_str = ""
    line_ch = "\n"
    code_indent = 1
    tabs = "    "
    def __init__(self, setting):
        self.node_cnt = 0
        self.left_is_true = -1
        self.edges = {}
        self.nodes = {}
        self.tree_str = ""
        self.min_max_prob = [1.0, 0.0]
        # simpler
        if setting == 1:
            self.line_ch = ""
            self.code_indent = 0
            self.tabs = " "

    def ParseTree(self, file_in, file_out):
        rexp_line = "(\d*) \[label=\"(.*)?gini = (.*).nsamples = (.*).nvalue = \[([\d\.]*), ([\d\.]*)\]\""
        rexp_comp = "X\[(.*)\] (<?>?=) (.*).n"
        with open(file_in, "r") as fin:
            for line in fin:
                if " -> " in line:
                    finds = re.findall("(\d*) -> (\d*)", line)[0]
                    node_a = int(finds[0])
                    node_b = int(finds[1])
                    if node_a == 0 and self.left_is_true == -1:
                        self.left_is_true = bool(re.findall("headlabel=\"(.*)\"", line)[0])
                    if node_a in self.edges:
                        self.edges[node_a].append(node_b)
                    else:
                        self.edges[node_a] = []

                elif "label=" in line:
                    [node_id, compares, gini, smaples, label_a, label_b] = re.findall(rexp_line, line)[0]
                    [featur_id, comp, val] =[None, None, None]
                    if compares:
                      [featur_id, comp, val] = re.findall(rexp_comp, compares)[0]
                    #print(node_id, gini, smaples, label_a, label_b)
                    #print(featur_id, comp, val)
                    self.edges[int(node_id)] = []
                    if featur_id:
                        self.nodes[int(node_id)] = [int(featur_id), comp, float(val), float(label_a)/float(smaples), float(label_b)/float(smaples)]
                    else:
                        self.nodes[int(node_id)] = [featur_id, comp, val, float(label_a)/float(smaples), float(label_b)/float(smaples)]
                    # [node_id, featture_cmp, sample_cnt, lab_cnt_1, lab_cnt_2]
                    #print(node_id, featture_cmp, sample_cnt, lab_cnt_1, lab_cnt_2)
                    self.node_cnt += 1
            fin.close()
        #print(self.nodes)
        #print(self.edges)
        self._PrintTree(file_out)

    def _PrintTree(self, file_out):
        self.tree_str = ""
        print("Dump decision tree into %s" % file_out)
        with open(file_out, "w") as fout:
            self.tree_str += "DTPredict = function(fea){%s" % self.line_ch
            self._TreeDFS(1, 0, 1.0)
            self.tree_str += "};%s" % self.line_ch
            fout.write(self.tree_str)
            fout.close()

    def _TreeDFS(self, deep, cur_id, cur_prob):
        is_leaf = len(self.edges[cur_id]) == 0
        ntabs = self.tabs * deep
        if is_leaf:
            label = [-1, self.nodes[cur_id][3]]
            if self.nodes[cur_id][3] < self.nodes[cur_id][4]:
                label = [1, self.nodes[cur_id][4]]
            label_prob = cur_prob * label[1]
            self.tree_str += "%sreturn [%d,%9.7f];%s" % (ntabs, label[0], label_prob, self.line_ch)
            self.min_max_prob[0] = min(self.min_max_prob[0], label_prob)
            self.min_max_prob[1] = max(self.min_max_prob[1], label_prob)
            return
        for idx, child in enumerate(self.edges[cur_id]):
            if idx == 0:
                self.tree_str += "%sif(fea[%d]%s%7.5f){%s" % (ntabs, self.nodes[cur_id][0], self.nodes[cur_id][1], self.nodes[cur_id][2], self.line_ch)
            if idx == 1:
                self.tree_str += "%s}else{%s" % (ntabs, self.line_ch)
            self._TreeDFS(deep + self.code_indent, child, cur_prob * self.nodes[cur_id][idx + 3])
        self.tree_str += "%s}%s" % (ntabs, self.line_ch)


def main():
    paras = Args()
    dt_parser = DTParser(0)
    file_in = os.path.join(paras.args["datapath"], paras.args["dtfile"])
    file_out = "%s.js" % file_in[:file_in.rfind(".")]
    dt_parser.ParseTree(file_in, file_out)

if __name__=='__main__':
    main()
