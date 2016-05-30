#ifndef CHARSTREE_H
#define CHARSTREE_H
#include <windows.h>
#include <QList>
#include <QFile>
#include <QJsonArray>
#include <QJsonObject>
#include <QJsonDocument>
#include <mutex>
#include <future>
#include <tuple>

#define THREADS_NUM 8
class CharsTree {
  static const int max_chars = 'z' - 'a' + 2;

  const uint8_t value_empty    = 0x80;        // empty child
  const uint8_t value_last     = 0x40;        // this node is last child
  const uint8_t value_end_word = 0x20;        // end word

  const uint8_t control_anti_masks = 0x20;    // use bit antimasks for children
  const uint8_t control_masks      = 0x10;    // use bit masks for children
  const uint8_t control_use_mask_0 = 0x08;    // 0 byte set
  const uint8_t control_use_mask_1 = 0x04;    // 1 byte set
  const uint8_t control_use_mask_2 = 0x02;    // 2 byte set
  const uint8_t control_use_mask_3 = 0x01;    // 3 byte set

  const uint8_t control2_ew_mask_0    = 0x80; // 2 byte set
  const uint8_t control2_ew_mask_1    = 0x40; // 3 byte set
  const uint8_t control2_ew_mask_2    = 0x20; // 2 byte set
  const uint8_t control2_ew_mask_3    = 0x10; // 3 byte set
  const uint8_t control2_empty_mask_0 = 0x08; // 2 byte set
  const uint8_t control2_empty_mask_1 = 0x04; // 3 byte set
  const uint8_t control2_empty_mask_2 = 0x02; // 2 byte set
  const uint8_t control2_empty_mask_3 = 0x01; // 3 byte set


  struct Node {
    int  subTreeIdx = -1;
    bool empty      = true;
    bool endWord    = false;
    int  children[max_chars];
    int  remainDepth = 0;

    Node() {
      memset(children, -1, sizeof(children));
    }

    Node(int depth) :
      remainDepth(depth)
    {
      memset(children, -1, sizeof(children));
    }
  };

  struct StatNode {
    int      children[max_chars];
    uint32_t total = 0;
    bool     empty = true;

    StatNode() {
      memset(children, -1, sizeof(children));
    }
  };

  struct SubTreeNode {
    int                       totalLen = 0;
    int                       value    = 0;
    bool                      endWord  = false;
    std::vector<SubTreeNode *>children;

    void DeleteReq() {
      for (auto * ch : children) {
        ch->DeleteReq();
      }
      delete this;
    }
  };

public:

  CharsTree();
  ~CharsTree();

  void ProcessWord(const QString line,
                   int           maxLen);
  void CompactTree(int minSubTreeLen);

  void SerializeJSON(QFile& fileOut);
  void SerializeBinary(QFile& fileOut);
  void SerializeBinaryStat(QFile& fileOut);

private:

  Node _root;
  std::vector<Node> _nodes[max_chars];
  SubTreeNode _subTreeRoot;

  std::vector<StatNode> _statNodes[max_chars];
  StatNode _statRoot;
  uint64_t _total[3] = { 0 };

  std::mutex _thSync;
  HANDLE     _thFoundPromiseEvent;
  HANDLE     _thUsedPromiseEvent;
  bool _thEnd[THREADS_NUM] = { false };

private:

  void AddStatistic(const char *s,
                    int         len);

  void SerializeChildrenJSONReq(QFile     & fileOut,
                                const Node *node);
  void SerializeSubTreesJSONReq(QFile            & fileOut,
                                const SubTreeNode *node);
  void WriteNodeValue(QFile     & fileOut,
                      const Node *node,
                      int         value,
                      bool        last);
  void WriteChildrenMask(QFile     & fileOut,
                         const Node *node,
                         uint8_t     control,
                         bool        antiMask);
  void         SerializeParentBinaryReq(QFile     & fileOut,
                                        const Node *node);

  void         SerializeParentStatBinaryReq(QFile         & fileOut,
                                            const StatNode *node,
                                            int             lvl);
  void         CalculateThreadProc(int           threadNumber,
                                   int           minSubTreeLen,
                                   SubTreeNode **foundSubTree);
  void         ResetFlags(std::vector<Node>& where);
  void         MarkSubTreesReq(Node              *node,
                               const SubTreeNode *subTree,
                               int                idx);
  bool         TestSubTreeReq(const Node        *node,
                              const SubTreeNode *subTree);
  int          GetNextNode(int               node,
                           std::vector<int>& stack);
  SubTreeNode* FindMatchSubTreeReq(Node *nodeOneBase,
                                   Node *nodeTwoBase,
                                   Node *nodeOne,
                                   Node *nodeTwo);
};

#endif // CHARSTREE_H
