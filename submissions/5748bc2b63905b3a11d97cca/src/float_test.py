from array import array
import numpy

def main():
    use_numpy = False;
    if not use_numpy:
        f = open('floats', 'wb')
        ary = array('f', [1.25, 3.141592653589, -0.003, 1e30])
        ary.tofile(f)
        f.close()
    else:
        ary = numpy.float32([1.25, 3.141592653589, -0.003, 1e30])
        #numpy.save('floats', ary)
        numpy.savetxt('floats', ary)

if __name__ == '__main__':
    main()