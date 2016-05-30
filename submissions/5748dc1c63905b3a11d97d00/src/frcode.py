#!/usr/bin/env python3

from __future__ import print_function

from streamutil import BufferedStream
import sys, struct

def unfrcode(stream):
	path = b''
	l = 0
	eof = False
	pos = 0

	stream = BufferedStream(stream)
	try:
		assert(stream.read(10) == b'\x00LOCATE02\x00')
		while not eof:
			# print("###Reading entry")
			b = stream.read(1)
			if not b:
				eof = True
				break
			if b[0] == 128:
				# dl = struct.unpack(">i", stream.read(2))[0]
				# dl = int(codecs.encode(stream.read(2), 'hex'), 16)
				dl = int.from_bytes(stream.read(2), byteorder=sys.byteorder, signed=True)
				# print("###Double-byte delta = %d" % (dl,))
			else:
				# dl = struct.unpack(">b", b)[0]
				# dl = int(codecs.encode(b, 'hex'), 16)
				dl = int.from_bytes(b, byteorder=sys.byteorder, signed=True)
				# print("###Single-byte delta = %d" % (dl,))
			l += dl
			# print("###Using %d (+%d) prefix from previous path" % (l, dl))
			s = stream.read_until(bytearray([0]))
			# print("###Read: %s (%d bytes)" % (s.decode(encoding='utf-8'), len(s)))
			null_byte = stream.read(1)
			assert(null_byte[0] == 0)
			# print("###Null byte = %d" % (null_byte[0],))
			path = path[:l] + s
			yield path.decode(encoding='utf-8')
	except:
		# print("###Error in position %d" % (stream.tell(),))
		raise


if __name__ == '__main__':
	for line in unfrcode(sys.stdin.buffer):
		print(line)
