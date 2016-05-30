var huffman;
var huffman_res;
var huffman_length;

function node(str, val)
{
	return {
		str: str, 
		value: val, 
	};
}

function Heap(init_data)
{
	var self = {};

	function down(idx)
	{
		while ((idx<<1) < self.tree.length)
		{
			var l = (idx << 1);
			var r = l+1;
			if (r >= self.tree.length || self.tree[l].value < self.tree[r].value)
			{
				if (self.tree[l].value < self.tree[idx].value)
				{
					var temp = self.tree[l];
					self.tree[l] = self.tree[idx];
					self.tree[idx] = temp;
					idx = l;
				}
				else
				{
					break;
				}
			}
			else
			{
				if (self.tree[r].value < self.tree[idx].value)
				{
					var temp = self.tree[r];
					self.tree[r] = self.tree[idx];
					self.tree[idx] = temp;
					idx = r;
				}
				else
				{
					break;
				}
			}
		}
	}

	function up(idx)
	{
		while (idx > 1)
		{
			var t = (idx >> 1);
			if (self.tree[t].value > self.tree[idx].value)
			{
				var temp = self.tree[t];
				self.tree[t] = self.tree[idx];
				self.tree[idx] = temp;
				idx = t;
			}
			else
			{
				break;
			}
		}
	}

	self.push = function (item)
	{
		self.tree.push(item);
		up(self.tree.length-1);
	}

	self.pop = function ()
	{
		self.tree[0] = self.tree[1];
		var nxt = self.tree.pop();
		if (self.tree.length > 1)
		{
			self.tree[1] = nxt;
			down(1);
		}
		return self.tree[0];
	}

	self.top = function ()
	{
		return self.tree[1];
	}
	
	self.length = function ()
	{
		return self.tree.length - 1;
	}

	self.init = function ()
	{
		self.tree = [];
		init_data = init_data || [];
		for (var i=init_data.length-1; i>=0; i--)
		{
			self.tree[i+1] = init_data[i];
			down(i+1);
		}
	}
	
	self.init();
	
	return self;
}

function build_huffman(data)
{
	var heap = Heap(data);
	huffman = heap.top();
	// unused [0] counts
	while (heap.length() > 1)
	{
		var p = heap.pop();
		var q = heap.pop();
		huffman = node("", p.value+q.value);
		huffman.left = p;
		huffman.right = q;
		heap.push(huffman);
	}
}

function travel_huffman(cur, str)
{
	if (cur.left)
	{
		travel_huffman(cur.left, str+"0");
	}
	if (cur.right)
	{
		travel_huffman(cur.right, str+"1");
	}
	if (cur.str)
	{
		huffman_res.push(cur.str+" => "+str);
		huffman_length += str.length * cur.value;
		huffman_orig_length += cur.str.length * 8 * cur.value;
	}
}

function calc_huffman()
{
	huffman_res = [];
	huffman_length = 0;
	huffman_orig_length = 0;
	travel_huffman(huffman, "");
	huffman_length = Math.ceil(huffman_length/8);
	huffman_orig_length = Math.ceil(huffman_orig_length/8);
}
