var nodeClass = require('./node');
var treeClass = require('./tree');


module.exports = function reducer() {

    this.regexForTree = function (node, parent, regex) {

        // when there is concidence, reset to position 0


        if (node.lastChildVisited === undefined) {
            node.lastChildVisited = -1;


            if (node.getChildren().length > 1) {
                regex += node.getValue().value + "(";
                node.pendingBracketClose = true;

                if (node.getValue().isFinalChar) {
                    node.pendingOptional = true;
                }

            } else {
                regex += node.getValue().value;

                if(node.getValue().isFinalChar && node.getChildren().length === 1 ){
                    regex += "(";
                    node.pendingBracketClose = true;
                    node.pendingOptional = true;
                }

            }


        if (parent) {
            // has brothers and it's the last one
            if (parent.getChildren()[parent.lastChildVisited + 1] && node.getChildren().length === 0) {
                regex += "|";
            }

            if (parent.getChildren()[parent.lastChildVisited + 1]) {
                node.pendingOr = true;
            }


        }

    }


    if (node) {

        //child has pending Bracket close
        if (node.lastChildVisited !== -1 && node.getChildren()[node.lastChildVisited].pendingBracketClose) {
            regex += ")";
            node.getChildren()[node.lastChildVisited].pendingBracketClose = false;

        }

        //If have no more children and the last one has something to do yet ?
        if(node.lastChildVisited !== -1  && node.getChildren()[node.lastChildVisited].pendingOptional){
            regex+="?";
            node.getChildren()[node.lastChildVisited].pendingOptional = false;
        }

        //is not the first time and the last child visited was the last one
        if (node.pendingBracketClose && !node.getChildren()[node.lastChildVisited + 1]) {
            regex += ")";

            node.pendingBracketClose = false;

            if (node.pendingOptional) {
                node.pendingOptional = false;
                regex += "?";
            }

        }




        //check pending or
        if (node.lastChildVisited !== -1 && (node.getChildren()[node.lastChildVisited].pendingOr ||
            node.pendingOr)) {
            regex += "|";
        }


    }


    var child = node.getChildren()[node.lastChildVisited + 1];


    if (child) {

        node.lastChildVisited++;

        return this.regexForTree(child, node, regex);

    } else {


        if (!parent) {
            return regex;
        }

        var brother = parent.getChildren()[parent.lastChildVisited + 1];


        if (brother) {

            parent.lastChildVisited++;

            return this.regexForTree(brother, parent, regex);
        }


        if (parent.getParent()) {
            return this.regexForTree(parent.getParent(), parent.getParent().getParent(), regex);
        } else {

            if (node.getParent() && node.getParent().pendingBracketClose) {
                regex += ')';
            }
        }
        return regex;
    }


}

this.treeForGroup = function (group) {
    var tree;
    for (var i = 0; i < group.length; i++) {
        var word = group[i];
        tree = this.treeForWord(word, tree, null, word);
    }
    return tree;
};

this.treeForWord = function (word, tree, parent, completeWord) {

    if (!parent && word.length === 0) {
        // the word was inside the tree
        return tree;
    }

    if (word.length === 0) {
        var value = parent.getValue().value;
        parent.setValue({
            value: value,
            isFinalChar: true
        });

        return tree;
    }

    var char = word[0];
    var node;

    if (!tree) {
        //first char is root
        tree = new treeClass();
        node = new nodeClass();
        node.setValue({
            value: char,
            isFinalValue: false,
            word: completeWord
        });
        tree.setRoot(node);

    } else {

        //check if char initial char in the tree before creating it

        /**
         * tree has 123A and the new word is 123B
         * the last equal node must be 3,
         * so we have to remove from the word the 123, and add B as the value
         */



        var lastEqualNode;

        if (parent) {
            lastEqualNode = this.getLastEqualNodeInTree(word, parent.getChildren()[0], {
                "lastNode": parent,
                "restOfWord": word
            }, 0, completeWord);
        } else {
            lastEqualNode = this.getLastEqualNodeInTree(word, tree.getRoot(), null, 0, completeWord);
        }

        if (!lastEqualNode.lastNode) {
            // normal node
            node = new nodeClass();
            node.setParent(parent);
            node.setValue({
                value: char,
                isFinalChar: false,
                completeWord: completeWord
            });
            parent.addChild(node);


        } else {

            if (lastEqualNode.restOfWord.length === 0) {
                //that means the word was complete found in the tree
                node = null;

            } else {
                word = lastEqualNode.restOfWord;
                char = word[0];

                // normal node
                node = new nodeClass();
                node.setParent(lastEqualNode.lastNode);
                node.setValue({
                    value: char,
                    isFinalChar: false
                });
                lastEqualNode.lastNode.addChild(node);
            }

        }


    }

    var restWord = this.restOfWord(word);
    return this.treeForWord(restWord, tree, node, completeWord);
};

this.getLastEqualNodeInTree = function (word, node, lastNode, currentChildPosition, completeWord) {
    var char = word[0];

    if (node) {
        if (char === node.getValue().value && node.getValue().word !== completeWord) {

            // when there is concidence, reset to position 0
            currentChildPosition = 0;

            var restOfWord = this.restOfWord(word);

            var child = node.getChildren()[currentChildPosition];
            if (child) {
                return this.getLastEqualNodeInTree(restOfWord, child, {
                    "lastNode": node,
                    "restOfWord": word
                }, currentChildPosition, completeWord);
            } else {
                return {
                    "lastNode": node,
                    "restOfWord": restOfWord
                };
            }
        } else {
            if (lastNode) {
                var amountOfChildren = lastNode.lastNode.getChildren().length;
                if (amountOfChildren > currentChildPosition + 1) {
                    var nextChild = lastNode.lastNode.getChildren()[currentChildPosition + 1];
                    return this.getLastEqualNodeInTree(word, nextChild, {
                        "lastNode": lastNode.lastNode,
                        "restOfWord": word
                    }, currentChildPosition + 1, completeWord);
                }
            }

        }
    }


    if (!lastNode) {
        return {
            lastNode: null,
            restOfWord: word
        }
    }

    lastNode.restOfWord = word;
    return lastNode;


};

//GET EVERY REGEX FOR GROUP
this.regexsForGroups = function (groups) {
    var regexs = [];
    for (var i = 0; i < groups.length; i++) {
        var group = groups[i];
        if(group.length > 700){
            var amount = Math.floor(group.length/700);
            //console.log(amount);
            for (var j = 0; j < amount; j++) {
                var groupPart = group.splice(0,700);
                var treeForGroup = this.treeForGroup(groupPart);
                var regexForTree = this.regexForTree(treeForGroup.getRoot(), null, "");
                regexs.push(regexForTree);
            }

            if(group.length>0){
                var treeForGroup = this.treeForGroup(group);
                var regexForTree = this.regexForTree(treeForGroup.getRoot(), null, "");
                regexs.push(regexForTree);
            }

        }else{
            var treeForGroup = this.treeForGroup(group);
            var regexForTree = this.regexForTree(treeForGroup.getRoot(), null, "");
            regexs.push(regexForTree);
        }


    }
    return regexs;
}

//GROUPING
this.restOfWord = function (word) {
    return word.substr(1, word.length - 1);
};

this.orderWords = function (words) {
    return words.sort();
};

this.groupWords = function (words, amount) {
    amount = amount - 1;
    var groups = [];
    words = this.orderWords(words);

    for (var i = 0; i < words.length; i++) {

        var word = words[i];

        var isInGroup = false;

        var position = -1;

        for (var j = 0; j < groups.length; j++) {

            var group = groups[j];


            isInGroup = this.isWordInGroupAmount(word, group, amount);


            if (isInGroup) {
                position = j;
                break;
            }
        }

        //If the word was not in any group, create a new one
        if (!isInGroup) {
            groups.push([word])
        } else {
            groups[position].push(word);
        }

    }

    return groups;
};

this.isWordInGroupAmount = function (word, group, amount) {

    var filter = group.filter(function (wordGroup) {

        if (word.length > amount && wordGroup.length > amount) {

            return word.substr(0, amount) === wordGroup.substr(0, amount);
        }
        return false;
    });

    return filter.length > 0;

}

this.isWordInGroup = function (word, group) {

    var filter = group.filter(function (wordGroup) {

        var wordBeginning;
        if (word.length <= wordGroup.length) {

            wordBeginning = wordGroup.substr(0, word.length);
            return word !== wordGroup && word === wordBeginning;
        }

        wordBeginning = word.substr(0, wordGroup.length);
        return word !== wordGroup && wordGroup === wordBeginning;

    });

    return filter.length > 0;

};

//this.customSplice = function (insertPosition, newSubStr, oldStr) {
//    return oldStr.substr(0, insertPosition) + newSubStr + oldStr.substr(start, oldStr.length - 1);
//};
}
;