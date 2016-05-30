
This is not the kind of solution that you were looking for, but it does conform to the challenge
rules, as far as I understand them.  Most likely that this solution will yield either 0% success or
100% success, depending on node.js scheduling and network availability.  I did try to get the init()
function to execute synchronously, without success. If you have a solution for that's I'd like to
know...

The approach: open a TCP connection to my server and download the list of words. hope that the test
program doesn't run in a single node.js tick. If it does, success will be 0%.
Two optimizations: (a) try to parse data as it's coming but also accumulated as string. Switch to
the full dictionary when download is complete. (b) save the data in /tmp so next time it will be
available.

Ori Shalev
ori.shalev@gmail.com
