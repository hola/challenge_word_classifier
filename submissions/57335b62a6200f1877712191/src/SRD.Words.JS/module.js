var LinesSeparator = 'Y';
var IsEndIndicator = 'Z';
var BeginSubNodeIndicator = '[';
var EndSubNodeIndicator = ']';
	
var Node = function(value, isEnd, tag)
{
	var _this = this;
	this.children = [];
	this.value = value;
	this.isEnd = isEnd || false;
	this.tag = tag || null;
	this.indexOf = function(char)
	{
		var result = -1;
		for(var index = 0; index < _this.children.length; index++)
		{
			var child = _this.children[index];
			if(child.value === char)
			{
				result = index;
				break;
			}
		}

		return result;
	}
	this.getIsFirst = function()
	{
		var FirstMask = 0x4;
		var result = _this.validateNodeTag(FirstMask);
		return result;
	}

	this.getIsMiddle = function()
	{
		var FirstMask = 0x2;
		var result = _this.validateNodeTag(FirstMask);
		return result;
	}

	this.getIsLast = function()
	{
		var FirstMask = 0x1;
		var result = _this.validateNodeTag(FirstMask);
		return result;
	}


	this.validateNodeTag = function(mask)
	{
		var result;

		if(_this.isEnd && tag != null)
		{
			result = (StatisticsLeafNodeCharacters.indexOf(tag) & mask) !== 0;
		}
		else
		{
			result = false;
		}

		return result;
	}
}

var additionsTree, wordPartsTree;

function init(data)
{
	var trees = data.toString().split(';');
	additionsTree = buildTree(trees[0]);
	wordPartsTree = buildTree(trees[1]);
}

function buildTree(treeAsString)
{
	var lines = treeAsString.split(LinesSeparator);
	var result = {Root : new Node()};
	processLines(result, lines);

	return result;
}

function processLines(tree, lines)
{
	for(var index = 0; index < lines.length; index++)
	{
		var line = lines[index];
		processLine(tree.Root, line, 0);
	}
}

var StatisticsLeafNodeCharacters = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H'];

function processLine(currentNode, line, startIndex)
{
	for(var index = startIndex; index < line.length; index++)
	{
		var char = line[index];

		var isEnd = ((index + 1) < line.length) && (line[index + 1] === IsEndIndicator || StatisticsLeafNodeCharacters.indexOf(line[index + 1]) > -1);

		if(isEnd)
		{
			index++;
		}

		var newNode = new Node(char, isEnd, line[index]);
		currentNode.children.push(newNode);
		var isBuildChildren = ((index + 1) < line.length) && line[index + 1] === BeginSubNodeIndicator;
		if(isBuildChildren)
		{
			index = processLine(newNode, line, index + 2);
		}

		var isEndBuildChildren = ((index + 1) < line.length) && line[index + 1] === EndSubNodeIndicator;
		if(isEndBuildChildren)
		{
			return index + 1;
		}
	}
}


function test(value)
{
	var result = false;

	if(typeof(value) === 'string' && value !== null && value !== '')
	{
		result = testSafe(value.toLowerCase(), true);
	}

	return result;
}

function testSafe(value, isFirstCut)
{
	var result = false;

	var size = value.length;
	var sizeNode = GetAdditionNode(size);

	if(sizeNode != null && !sizeNode.isEnd)
	{
		additionNode = sizeNode.children[0];
		var partSize = size - GetAdditionSize(additionNode);
		var part = value.substr(0, partSize);

		var node = find(wordPartsTree, part);

		if(node != null)
		{
			result = TestNode({
				additionNode: additionNode, node: node, isFirstCut: isFirstCut, value: value, partSize: partSize
				});
		}

	}
	else
	{
		result = find(wordPartsTree, value).getIsFirst();
	}

	return result;

}

function TestNode(p)
{
	var result;

	if(p.additionNode.isEnd)
	{
		result = TestLeafNode(p.node, p.isFirstCut);
	}
	else
	{
		result = TestNotLeafNode({node: p.node, isFirstCut: p.isFirstCut, value: p.value, partSize: p.partSize});
	}

	return result;

}

function TestLeafNode(node, isFirstCut)
{
	var result;

	if(isFirstCut && node != null && node.getIsFirst() && node.getIsLast())
	{
		result = true;
	}
	else if(!isFirstCut && node != null && node.getIsLast())
	{
		result = true;
	}
	else
	{
		result = false;
	}

	return result;
}

function TestNotLeafNode(p)
{
	var result;

	if(p.isFirstCut && p.node != null && !p.node.getIsFirst())
	{
		result = false;
	} 
	else if(!p.isFirstCut && p.node != null && !p.node.getIsMiddle())
	{
		result = false;
	}
	else
	{
		result = testSafe(p.value.substr(p.partSize), false);
	}
	
	return result;
}

var CharOffset = 96;

function GetAdditionNode(size)
{
	var result = null;
	var index = additionsTree.Root.indexOf(String.fromCharCode(size + CharOffset));
	if(index > -1)
	{
		result = additionsTree.Root.children[index];
	}

	return result;
}

function GetAdditionSize(additionNode)
{
	return additionNode.value.charCodeAt() - CharOffset;
}


function find(tree, value)
{
	var result = null;

	var current = tree.Root;
	for(var index = 0; index < value.length; index++)
	{
		var char = value[index];
		var nodeIndex = current.indexOf(char);
		if(nodeIndex < 0)
		{
			break;
		}
		else if((current = current.children[nodeIndex]).isEnd && (index === (value.length - 1)))
		{
			result = current;
		}
	}

	return result;
}