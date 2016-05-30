
def main():
    fin = open('words.txt', 'r')
    fout = open('words.js', 'w')
    fout.write('var words = "');
    first = True
    for line in fin:
        str = line.rstrip()
        if not first:
            fout.write(',')
        first = False
        fout.write(str.lower())
    fout.write('";')

if __name__ == '__main__':
    main()