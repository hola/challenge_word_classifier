HI :)

My approach to this problem is to load whole dictionary into memory.
To build dictionary I used one object. Each word is splitted into single chars and parsed into object structure (each letter goes in to next level of object structure etc.). 
This solution "compress" dictionary data and is easy to use and manage.
Initialization time may take a little of time (about 5-6second on my machine), but after that testing words is immediate and we shuld have 100% accurate comparisions.

Thank you,
Kamil Frackiewicz 