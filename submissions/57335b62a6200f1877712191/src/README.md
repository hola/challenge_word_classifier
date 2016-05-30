+=======================================================================================================================================================================================+
# Date		: 05/10/2016																				#
# Author	: Rostislav Nikitin																			#
# E-Mail	: rostislav.nikitin@gmail.com																		#
# Dirs		: SRD.Words - .NET words parts generator console application, SRD.Words.JS - non minimized JS module, SRD.Words.NodeJS - Node.JS module with tests			#
# License	: Each application (module, script) contains license inside a root (license.txt). All apps valid for not-commercial use till the 30/06/2016 (30 Apr 2016)		#
+=======================================================================================================================================================================================+

Parts
---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------
 1. Word parts generator application
---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------
	* Path: .\SRD.Words

	* Algorithm description

	10. Load all the words from the words.txt to the words hash set (make all lowercase and skip duplicates)
	20. Iterate for each word in words
	30.	If word.length < [5, 4, 3].min()
	40.		Add to wordParts with F:1, L:1 statistics (if both F:1 and L:1 then can be a word).
	50.	Else
	60.		Split word.length into [5, 4, 3] natural numbers (only the one fragmentation with max natural number from start. Example: for "balloon's" word will be found 2 additions: 5 and 4.
	70.		Splid word into pats according to the previous step natural numbers
	80.		Iterate for each word part
	90.			If word part already in word parts list
	100.				Update it statistics (F++ if it in a first position, M++ if it in a word middle and L++ if it in a last position)
	110.			Else
	120.				Add word part to the word parts list with (statistics according to it position in a word).
	130.			End If
	140.		End Iterator
	150.	End If
	160. End Iterator
	180. Build all the natural number fragmentations tree and encode it as a char tree
	170. Build tree from the word parts. Root:[h:[e:[lF]]], [l:[o:[w:L]]], ... All root children are the first letters of the all the words parts. All the leafs are refined with the word part statistics (where this word part can be used, on a firs position in the word middle or at last position).
	190. Save both threes separater by the semicolon into the data.dat file

	* How to use it

	Compile .\SRD.Words\SRD.Words.sln

	Copy words.txt (it excluded) into the .\SRD.Words\SRD.Words.Console\bin\Debug directory

	cd .\SRD.Words\SRD.Words.Console\bin\Debug
	.\SRD.Words.Console.exe -g
	Result of execution should be a next generated files: wordsParts.txt and data.dat files
	GZip data.dat file ..\..\..\Libraries\gzip.exe -9 data.dat

	Data file is ready.

---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------
 2. JS non minimized module
---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------
	* Path: .\SRD.Words.JS

	* Algorithm description

	** function init(data);
	10. Get string from the data Buffer (toString()),
	20. Split value by the semicolon and set two trees: natural numbers tree (each children of the Root is a word length), word parts tree
	
	** function test(value);
	10. Split word to parts with help of natural number tree
	20. Iterate for each word part
	30. 	Find word part in a word parts tree with specified word part postion: first, middle, last
	30.     If not found
	40.		Return false
	50.	End If
	60. End Iterator
	70.	Return true

---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------
 3. Node.JS module
---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------
	* Path: .\SRD.Words.NodeJS

	* Algorithm description

	It exports two functions init(data), test(value) as specified in a task requirements

	* How to use it

	** Run
	
	First call the init(data) method where data parameter is a Buffer with the data.dat file
	Each time you need to test a word call the test(value) method. It returns true if the word was detected as English words.txt dictionary word, otherwies false.

	** Test it

	cd SRD.Words.NodeJS

	copy ..\SRD.Words\SRD.Words.Console\bin\Debug\data.dat.gz data.dat.gz

	install_packages.cmd 

	npm test > output.txt

	Read the output.txt with the tests results