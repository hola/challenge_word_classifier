#!/usr/bin/env python3


class BufferedStream(object):
	def __init__(self, stream, chunk_size=64*1024):
		self.stream = stream
		self.buffer = bytearray()
		self.chunk_size = chunk_size
		self.pos = 0

	def tell(self):
		return self.pos

	def read_until(self, byte):
		chunk = None
		result = bytearray()
		while True:
			if chunk is None and self.buffer:
				chunk = self.buffer
				self.buffer = bytearray()
			else:
				chunk = self.stream.read(self.chunk_size)
			if not chunk:
				return result
				break
			# # print("###Looking for bytes in chunk of %d bytes" % (len(chunk),))
			pos = chunk.find(byte)
			if pos > -1:
				# save the rest in the buffer and return what we've read so far
				self.buffer.extend(chunk[pos:])
				# # print("###Found bytes after total length of %d (%d+%d) bytes. Edge of match: ...%d][%d..." % (len(result) + pos, len(result), pos, (chunk[pos-1] if pos>0 else -1), chunk[pos]))
				self.pos += len(result) + pos
				return result + chunk[:pos]
			result.extend(chunk)


	def read(self, bytes):
		
		while len(self.buffer) < bytes:
			# print("###Reading chunk from real stream")
			chunk = self.stream.read(self.chunk_size)
			self.buffer.extend(chunk)
			if not chunk:
				break

		bytes = min(len(self.buffer), bytes)

		# # print("###Buffer size=%d, bytes requested=%d" % (len(self.buffer), bytes))
		result = self.buffer[:bytes]
		self.pos += bytes
		del self.buffer[:bytes]
		# # print("###Buffer size after read=%d" % (len(self.buffer),))

		return result


if __name__ == '__main__':
	import io

	stream = BufferedStream(io.BytesIO(b'abcdeabcdefabcgabcdje'))

	print(1)
	print(stream.read(4))
	print(2)
	print(stream.read_until(bytearray([98])))
	print(3)
	print(stream.read(100))
	print(4)
