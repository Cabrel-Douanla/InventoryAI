import os

def main():
    with open('src.py', 'w', encoding='utf-8') as outfile:  # Forcer utf-8 ici
        for root, dirs, files in os.walk('./src'):
            for filename in files:
                filepath = os.path.join(root, filename)
                try:
                    with open(filepath, 'r', encoding='utf-8') as infile:
                        content = infile.read()
                        content = content.encode('utf-8', 'ignore').decode('utf-8')
                        outfile.write(f'# File: {filepath}\n')
                        outfile.write(content + '\n\n')
                        print(f'Processed {filepath}')
                except Exception as e:
                    print(f'❌ Error processing {filepath}: {e}')

if __name__ == '__main__':
    main()
