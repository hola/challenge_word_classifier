module.exports = function tree() {

    this.root = null;

    this.setRoot = function (node) {
        this.root = node;
    };

    this.getRoot = function () {
        return this.root;
    };

    this.searchValue = function (value) {

        var root = this.getRoot();
        return this.searchValueInNodes(root, value);
    };

    this.searchValueInNodes = function (node, value) {
        if (node.getValue().value === value) {
            return node;
        }

        var children = node.getChildren();

        for (var i = 0; i < children.length; i++) {
            var child = children[i];
            var foundedNode = this.searchValueInNodes(child, value);

            if (foundedNode) {
                return foundedNode;
            }

        }

    };

};

