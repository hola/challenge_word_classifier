module.exports = function node() {

    this.parent = null;
    this.children = [];
    this.value = null;

    this.setParent = function (parent) {
        this.parent = parent;
    };

    this.getParent = function(){
        return this.parent;
    };

    this.addChild = function(child){
        this.children.push(child);
    };

    this.getChildren = function(){
        return this.children;
    };

    this.setValue = function(oValue){
        this.value = oValue;
    };

    this.getValue = function(){
        return this.value;
    };


};

