use std::fs::File;
use std::path::Path;
use std::io::BufReader;
use std::io::BufRead;
use std::io::Write;
use std::fmt::Display;
use std::collections::HashMap;
use std::collections::BTreeMap;
use std::collections::btree_map::Entry;
use std::sync::mpsc::sync_channel;
use std::sync::mpsc::SyncSender;
use std::sync::mpsc::Receiver;
use std::sync::Arc;
use std::sync::Mutex;
use std::thread;
use std::thread::Builder;


const N_WORDS_LOG: usize = 100_000;
const N_FEATURES_IN_BATCH: usize = 100_000;


#[derive(Clone)]
enum WordType {
    Word,
    NonWord,
}


fn read_words<P>(path: P, word_type: WordType, tx: SyncSender<(String, WordType)>) where P: AsRef<Path> + Display {
    let file = File::open(&path).unwrap();
    let reader = BufReader::new(file);
    let mut n_words = 0;
    
    for line in reader.lines() {
        if n_words % N_WORDS_LOG == 0 {
            println!("{} words loaded...", n_words);
        }
        
        match line {
            Ok(line) => { let _ = tx.send((line.into(), word_type.clone())); },
            Err(err) => panic!("Can not read words from {}: {}", path, err),
        }
        
        n_words += 1;
    }
    
    println!("Total {} words loaded", n_words);
} 


struct WordCount {
    word_count: usize,
    nonword_count: usize,
}


impl WordCount {
    pub fn new(word_count: usize, nonword_count: usize) -> WordCount {
        WordCount {
            word_count: word_count,
            nonword_count: nonword_count,
        }
    }
    
    pub fn word_count(&self) -> usize {
        self.word_count
    }
    
    pub fn nonword_count(&self) -> usize {
        self.nonword_count
    }
    
    pub fn inc_word(&mut self) {
        self.word_count += 1;
    }
    
    pub fn inc_nonword(&mut self) {
        self.nonword_count += 1;
    }
    
    pub fn add_word(&mut self, count: usize) {
        self.word_count += count;
    }
    
    pub fn add_nonword(&mut self, count: usize) {
        self.nonword_count += count;
    }
}


fn process(rx: Arc<Mutex<Receiver<(String, WordType)>>>, tx: SyncSender<BTreeMap<String, WordCount>>) {
    let mut features = BTreeMap::new();
    let mut n_words = 0;

    loop {
        let (word, word_type) = match rx.lock().unwrap().recv() {
            Ok(data) => data,
            Err(_) => break,
        };
        
        if n_words % N_WORDS_LOG == 0 {
            println!("{}: Processed {} words...", thread::current().name().unwrap(), n_words);
        }
        
        for feature_len in 3 .. 5 + 1 {
            if feature_len > word.len() {
                continue;
            }
            
            for index in 0 .. word.len() - feature_len + 1 {
                let feature = String::from(&word[index .. index + feature_len]);
                
                match (features.entry(feature), &word_type) {
                    (Entry::Vacant(entry), &WordType::Word) => { entry.insert(WordCount::new(1, 0)); },
                    (Entry::Vacant(entry), &WordType::NonWord) => { entry.insert(WordCount::new(0, 1)); },
                    (Entry::Occupied(mut entry), &WordType::Word) => { entry.get_mut().inc_word(); },
                    (Entry::Occupied(mut entry), &WordType::NonWord) => { entry.get_mut().inc_nonword(); },
                }
            }
        }
        
        if features.len() > N_FEATURES_IN_BATCH {
            let _ = tx.send(features);
            
            features = BTreeMap::new();
        }
        
        n_words += 1;
    }
    
    let _ = tx.send(features);
    
    println!("{}: Total {} processed words", thread::current().name().unwrap(), n_words);
}


fn main() {
    let (word_tx, word_rx) = sync_channel(10_000);
    let (feature_tx, feature_rx) = sync_channel(100);
    
    // ------------------------------------
    
    let read_handler = Builder::new().name("Reader".into()).spawn(move || {
        read_words("data/words.txt", WordType::Word, word_tx.clone());
        read_words("data/nonwords.txt", WordType::NonWord, word_tx);
    }).unwrap();
    
    // ------------------------------------
    
    let word_rx = Arc::new(Mutex::new(word_rx));
    
    let process_handlers: Vec<_> = (0 .. 2).map(|i| {
        let word_rx = word_rx.clone();
        let feature_tx = feature_tx.clone();
        
        Builder::new().name(format!("Processor {}", i)).spawn(move || process(word_rx, feature_tx)).unwrap()
    }).collect();
    
    drop(word_rx);
    drop(feature_tx);
    
    // ------------------------------------
    
    let mut features = HashMap::new();
    let mut n_words = 0;
    
    println!("Combine...");
    
    for part_features in feature_rx {
        for (i, j) in part_features {
            if n_words % N_WORDS_LOG == 0 {
                println!("Combined {} words...", n_words);
            }
            
            let entry = features.entry(i).or_insert(WordCount::new(0, 0));
            
            entry.add_word(j.word_count());
            entry.add_nonword(j.nonword_count());
            
            n_words += 1;
        }
    }

    println!("Total {} combined words", n_words);
    
    // ------------------------------------

    let _ = read_handler.join().unwrap();
    
    for handler in process_handlers.into_iter() {
        let _ = handler.join().unwrap();
    }
    
    // ------------------------------------
    
    println!("Complete...");
    println!("Total features collected {}", features.len());
    println!("Total word features {}", features.iter().filter(|&(_, j)| j.word_count() > 1 && j.nonword_count() == 0).count());
    println!("Total nonword features {}", features.iter().filter(|&(_, j)| j.word_count() == 0 && j.nonword_count() > 1).count());
    
    // ------------------------------------

    let mut file = File::create("features.txt").unwrap(); 
    
    for (i, j) in features.iter().filter(|&(_, j)| j.word_count() > 1) {
        let _ = writeln!(file, "{};{:0.3}", i, j.word_count() as f64 / (j.word_count() + j.nonword_count()) as f64);
    }
}
