#include <QDebug>
#include <thread>
#include "CharsTree.h"
using namespace std;
CharsTree::CharsTree()
{
  _thFoundPromiseEvent = CreateEvent(nullptr, FALSE, FALSE, nullptr);
  _thUsedPromiseEvent  = CreateEvent(nullptr, FALSE, FALSE, nullptr);

  for (int i = 0; i < max_chars; i++) {
    _nodes[i].reserve(500000);
  }
}

CharsTree::~CharsTree() {
  CloseHandle(_thFoundPromiseEvent);
  CloseHandle(_thUsedPromiseEvent);
}

void CharsTree::ProcessWord(const QString line, int maxLen) {
  Node *curNode    = &_root;
  int   curNodePos = -1;
  int   curNodeIdx = -1;

  auto stdStr    = line.toStdString();
  auto stdStrPtr = stdStr.c_str();

  for (int i = 0, j = stdStr.size(); i < j; i++) {
    char ch = stdStrPtr[i];

    // add stat
    AddStatistic(&stdStrPtr[i], 1);

    if (j - i > 1) {
      AddStatistic(&stdStrPtr[i], 2);

      if (j - i > 2) {
        AddStatistic(&stdStrPtr[i], 3);
      }
    }

    if (i >= maxLen) {
      continue;
    }

    if (ch == '\'') {
      ch = 0x00;
    } else {
      ch = ch - 'a' + 1;
    }

    Q_ASSERT(ch >= 0 && ch < max_chars);

    size_t pos = static_cast<int>(ch);


    // add node to tree

    if (curNode->children[pos] < 0) {
      curNode->children[pos] = _nodes[pos].size();
      _nodes[pos].push_back(Node(j - i - 1));

      if ((curNodePos >= 0) && (curNodeIdx >= 0)) {
        curNode = &_nodes[curNodePos][curNodeIdx];
      }
    } else {
      auto n = &_nodes[pos][curNode->children[pos]];

      if (n->remainDepth < (j - i - 1)) {
        n->remainDepth = j - i - 1;
      }
    }
    curNode->empty = false;
    curNodePos     = pos;
    curNodeIdx     = curNode->children[pos];
    curNode        = &_nodes[curNodePos][curNodeIdx];

    if (i == j - 1) {
      curNode->endWord = true;
    }
  }
}

void CharsTree::AddStatistic(const char *s, int len) {
  StatNode *curNode    = &_statRoot;
  int       curNodePos = -1;
  int       curNodeIdx = -1;

  for (int i = 0; i < len; i++) {
    char ch = s[i];

    if (ch == '\'') {
      ch = 0x00;
    } else {
      ch = ch - 'a' + 1;
    }

    size_t pos = static_cast<int>(ch);


    // add node to tree

    if (curNode->children[pos] < 0) {
      curNode->children[pos] = _statNodes[pos].size();
      _statNodes[pos].push_back(StatNode());

      if ((curNodePos >= 0) && (curNodeIdx >= 0)) {
        curNode = &_statNodes[curNodePos][curNodeIdx];
      }
    }

    curNode->empty = false;
    curNodePos     = pos;
    curNodeIdx     = curNode->children[pos];
    curNode        = &_statNodes[curNodePos][curNodeIdx];

    if (i == len - 1) {
      curNode->total++;
      _total[len - 1]++;
    }
  }
}

void CharsTree::CalculateThreadProc(int           threadNumber,
                                    int           minSubTreeLen,
                                    SubTreeNode **foundSubTree) {
  SubTreeNode *subTree = nullptr;

  // nodes loop
  for (int i = 0; i < max_chars; i++) {
    for (int nOne = threadNumber, nMax = _nodes[i].size(); nOne < nMax;
         nOne += THREADS_NUM) {
      auto nodeOne = &_nodes[i][nOne];

      if ((nodeOne->subTreeIdx >= 0) || nodeOne->empty ||
          (nodeOne->remainDepth < minSubTreeLen)) {
        continue;
      }

      for (int nTwo = nOne; nTwo < nMax; nTwo++) {
        auto nodeTwo = &_nodes[i][nTwo];

        if ((nodeTwo->subTreeIdx >= 0) || nodeTwo->empty ||
            (nodeTwo->remainDepth < minSubTreeLen)) {
          continue;
        }

        // find subtrees
        subTree = FindMatchSubTreeReq(nodeOne, nodeTwo, nodeOne, nodeTwo);

        // calculate profit
        if (subTree->totalLen > minSubTreeLen) {
          lock_guard<mutex> locker(_thSync);
          qInfo() << "found: " << subTree->totalLen << " i=" << i;

          *foundSubTree          = subTree;
          (*foundSubTree)->value = i;

          SetEvent(_thFoundPromiseEvent);

          WaitForSingleObject(_thUsedPromiseEvent, INFINITE);
        } else {
          subTree->DeleteReq();
        }
      }
    }
  }
  qInfo() << "Exit thread: " << threadNumber;
  _thEnd[threadNumber] = true;
}

void CharsTree::CompactTree(int minSubTreeLen) {
  _subTreeRoot.children.clear();
  SubTreeNode *foundSubTree = nullptr;

  thread *ths[THREADS_NUM];

  for (size_t i = 0; i < _countof(ths); i++) {
    ths[i] = new thread(&CharsTree::CalculateThreadProc,
                        this,
                        i,
                        minSubTreeLen,
                        &foundSubTree);
    ths[i]->detach();
  }
  bool working            = true;
  __int64 totalMarked     = 0;
  __int64 totalSubRootLen = 0;

  // found all same subtrees
  while (working) {
    // wait for thread
    DWORD res = WaitForSingleObject(_thFoundPromiseEvent, 1000);

    if (res == WAIT_TIMEOUT) {
      working = false;

      for (size_t i = 0; i < _countof(ths); i++) {
        if (!_thEnd[i]) {
          working = true;
          break;
        }
      }
    } else {
      // compact tree
      if ((foundSubTree != nullptr) &&
          (foundSubTree->totalLen >= minSubTreeLen)) {
        _subTreeRoot.children.push_back(foundSubTree);

        int marked = 0;

        // mark
        for (int nOne = 0, nMax = _nodes[foundSubTree->value].size(); nOne < nMax;
             nOne++) {
          auto nodeOne = &_nodes[foundSubTree->value][nOne];

          if (TestSubTreeReq(nodeOne, foundSubTree)) {
            MarkSubTreesReq(nodeOne, foundSubTree,
                            _subTreeRoot.children.size() - 1);
            marked++;
          }
        }

        if (marked == 0) {
          _subTreeRoot.children.pop_back();
          foundSubTree->DeleteReq();
          foundSubTree = nullptr;
          qInfo() << "Missed";
        } else {
          totalMarked     += marked;
          totalSubRootLen += foundSubTree->totalLen;
          qInfo() << "Marked:" << marked;
        }
      }

      // continue thread
      SetEvent(_thUsedPromiseEvent);
    }
  }
  qInfo() << "All threads ended!";
  qInfo() << "Marked average : " << (double)totalMarked /
  (double)_subTreeRoot.children.size();
  qInfo() << "SubRoot len average : " << (double)totalSubRootLen /
  (double)_subTreeRoot.children.size();
  qInfo() << "Total SubRoots found : " << _subTreeRoot.children.size();

  for (size_t i = 0; i < _countof(ths); i++) {
    delete ths[i];
  }
}

void CharsTree::SerializeJSON(QFile& fileOut) {
  fileOut.write("{\"tree\":");
  SerializeChildrenJSONReq(fileOut, &_root);
  fileOut.write(",{\"subTree\":");
  SerializeSubTreesJSONReq(fileOut, &_subTreeRoot);
}

void CharsTree::SerializeChildrenJSONReq(QFile& fileOut, const Node *node) {
  // write object begin
  fileOut.write("{\"sti\":");
  fileOut.write(QString::number(node->subTreeIdx).toLocal8Bit());

  if (node->endWord) {
    fileOut.write(",\"ew\":true");
  } else {
    fileOut.write(",\"ew\":false");
  }

  for (int i = 0; i < max_chars; i++) {
    if (node->children[i] >= 0) {
      fileOut.write((",\"" + QString::number(i) + "\":").toLocal8Bit());
      SerializeChildrenJSONReq(fileOut, &_nodes[i][node->children[i]]);
    }
  }

  // object end
  fileOut.write("}");
}

void CharsTree::SerializeBinary(QFile& fileOut) {
  SerializeParentBinaryReq(fileOut, &_root);
}

void CharsTree::SerializeBinaryStat(QFile& fileOut) {
  SerializeParentStatBinaryReq(fileOut, &_statRoot, 0);
}

void CharsTree::WriteNodeValue(QFile     & fileOut,
                               const Node *node,
                               int         value,
                               bool        last) {
  uint8_t valueWithMask = static_cast<uint8_t>(value);

  if (last) {
    valueWithMask |= value_last;
  }

  if (node->empty) {
    valueWithMask |= value_empty;
  }

  if (node->endWord) {
    valueWithMask |= value_end_word;
  }

  fileOut.write(reinterpret_cast<char *>(&valueWithMask), 1);
}

void CharsTree::WriteChildrenMask(QFile     & fileOut,
                                  const Node *node,
                                  uint8_t     control,
                                  bool        antiMask) {
  uint8_t control2    = 0;
  uint8_t usedByte[4] = { 0 };
  uint8_t lastByte[4] = { 0 };
  uint8_t ewByte[4]   = { 0 };

  // fill masks
  for (int i = 0; i < max_chars; i++) {
    if (node->children[i] >= 0) {
      if (!antiMask) {
        usedByte[i / 8] |= 1 << (i % 8);
        control         |= control_use_mask_0 >> (i / 8);
      }
      Node *tmpNode = &_nodes[i][node->children[i]];

      if (tmpNode->endWord) {
        control2      |= control2_ew_mask_0 >> (i / 8);
        ewByte[i / 8] |= 1 << (i % 8);
      }

      if (tmpNode->empty) {
        control2        |= control2_empty_mask_0 >> (i / 8);
        lastByte[i / 8] |= 1 << (i % 8);
      }
    } else {
      if (antiMask) {
        usedByte[i / 8] |= 1 << (i % 8);
        control         |= control_use_mask_0 >> (i / 8);
      }
    }
  }

  // write controls bytes
  fileOut.write(reinterpret_cast<char *>(&control),  1);
  fileOut.write(reinterpret_cast<char *>(&control2), 1);

  // write values
  for (size_t i = 0; i < _countof(usedByte); i++) {
    if (usedByte[i]) {
      fileOut.write(reinterpret_cast<char *>(&usedByte[i]), 1);
    }
  }

  for (size_t i = 0; i < _countof(ewByte); i++) {
    if (ewByte[i]) {
      fileOut.write(reinterpret_cast<char *>(&ewByte[i]), 1);
    }
  }

  for (size_t i = 0; i < _countof(lastByte); i++) {
    if (lastByte[i]) {
      fileOut.write(reinterpret_cast<char *>(&lastByte[i]), 1);
    }
  }
}

void CharsTree::SerializeParentBinaryReq(QFile     & fileOut,
                                         const Node *node) {
  // determine if necessary to use mask
  int usedChars = 0;
  int lastChild = -1;

  for (int i = 0; i < max_chars; i++) {
    if (node->children[i] >= 0) {
      usedChars++;
      lastChild = i;
    }
  }

  // write children
  for (int i = 0; i < max_chars; i++) {
    if (node->children[i] >= 0) {
      Node *tmpNode = &_nodes[i][node->children[i]];
      WriteNodeValue(fileOut, tmpNode, i, i == lastChild);
    }
  }

  // proceed children
  for (int i = 0; i < max_chars; i++) {
    if (node->children[i] >= 0) {
      Node *tmpNode = &_nodes[i][node->children[i]];

      if (!tmpNode->empty) {
        SerializeParentBinaryReq(fileOut, tmpNode);
      }
    }
  }
}

void CharsTree::SerializeParentStatBinaryReq(QFile         & fileOut,
                                             const StatNode *node,
                                             int             lvl) {
  for (int i = 0; i < max_chars; i++) {
    uint32_t valToWrite = (value_empty << 24);

    if (node->children[i] >= 0) {
      valToWrite = _statNodes[i][node->children[i]].total;
      valToWrite = ((valToWrite * 1.0) / _total[lvl]) * 1000000;

      if (_statNodes[i][node->children[i]].empty) {
        valToWrite |= (value_empty << 24);
      }
    }
    fileOut.write(reinterpret_cast<char *>(&valToWrite),
                  sizeof(uint32_t));
  }

  // proceed children
  for (int i = 0; i < max_chars; i++) {
    if (node->children[i] >= 0) {
      StatNode *tmpNode = &_statNodes[i][node->children[i]];

      if (!tmpNode->empty) {
        SerializeParentStatBinaryReq(fileOut, tmpNode, lvl + 1);
      }
    }
  }
}

void CharsTree::SerializeSubTreesJSONReq(QFile            & fileOut,
                                         const SubTreeNode *node) {
  // write object begin
  fileOut.write("{\"len\":\"");
  fileOut.write(QString::number(node->totalLen).toLocal8Bit());

  if (node->endWord) {
    fileOut.write("\",\"ew\":true");
  } else {
    fileOut.write("\",\"ew\":false");
  }
  fileOut.write(",\"val\":\"");
  fileOut.write(QString::number(node->value).toLocal8Bit());
  fileOut.write("\"");

  for (int i = 0, j = node->children.size(); i < j; i++) {
    if (node == &_subTreeRoot) {
      fileOut.write((",\"" + QString::number(i) + "\":").toLocal8Bit());
    } else {
      fileOut.write(",");
    }
    SerializeSubTreesJSONReq(fileOut, node->children[i]);
  }

  // object end
  fileOut.write("}");
}

void CharsTree::MarkSubTreesReq(Node              *node,
                                const SubTreeNode *subTree,
                                int                idx) {
  node->subTreeIdx = idx;

  for (auto * subNode : subTree->children) {
    Q_ASSERT(node->children[subNode->value] >= 0);
    MarkSubTreesReq(&_nodes[subNode->value][node->children[subNode->value]],
                    subNode,
                    idx);
  }
}

bool CharsTree::TestSubTreeReq(const Node        *node,
                               const SubTreeNode *subTree) {
  if ((node->subTreeIdx >= 0) || (node->endWord != subTree->endWord)) {
    return false;
  }

  for (const auto * subNode : subTree->children) {
    if (node->children[subNode->value] < 0) {
      return false;
    }

    if (!TestSubTreeReq(&_nodes[subNode->value][node->children[subNode->value]],
                        subNode)) {
      return false;
    }
  }
  return true;
}

CharsTree::SubTreeNode * CharsTree::FindMatchSubTreeReq(Node *nodeOneBase,
                                                        Node *nodeTwoBase,
                                                        Node *nodeOne,
                                                        Node *nodeTwo)
{
  if ((nodeOne == nodeTwoBase) || (nodeTwo == nodeOneBase)) {
    return new SubTreeNode();
  }

  if ((nodeOne->endWord != nodeTwo->endWord)) {
    return new SubTreeNode();
  }

  // create result by own node
  auto result      = new SubTreeNode;
  result->totalLen = 1;
  result->endWord  = nodeOne->endWord;

  if (!nodeOne->empty) {
    for (int i = 0; i < max_chars; i++) {
      if ((nodeOne->children[i] < 0) || (nodeTwo->children[i] < 0)) {
        continue;
      }
      auto nodeProcessOne = &_nodes[i][nodeOne->children[i]];
      auto nodeProcessTwo = &_nodes[i][nodeTwo->children[i]];

      if ((nodeProcessOne->subTreeIdx >= 0) ||
          (nodeProcessTwo->subTreeIdx >= 0)) {
        continue;
      }

      if ((nodeProcessOne->endWord != nodeProcessTwo->endWord)) {
        continue;
      }

      // move futher in recursion
      auto ret =
        FindMatchSubTreeReq(nodeOneBase, nodeTwoBase,
                            nodeProcessOne,
                            nodeProcessTwo);
      result->totalLen += ret->totalLen;
      ret->value        = i;
      result->children.push_back(ret);
    }
  }
  return result;
}
