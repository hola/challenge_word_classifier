library(tm)
library(RWeka)
library(SnowballC)
library(ggplot2)
library(grid)
library(gridExtra)
library(slam)
library(ngram)

options(mc.cores=1)
set.seed(100)

makeDataset <- function(tdm, threshold) {
  #tdm <- removeSparseTerms(tdm, threshold)
  #freq <- sort(rowSums(as.matrix(tdm)), decreasing = TRUE)
  terms <- findFreqTerms(tdm, lowfreq = threshold)
  freq <- as.matrix(rollup(tdm[terms,], 2, na.rm=TRUE, FUN = sum))
  freq <- data.frame(word = rownames(freq), freq = freq, stringsAsFactors = F)
  names(freq) <- c('word', 'freq')
  result <- freq[order(freq$freq, decreasing = TRUE), ]
  result
}

bigram.tokenizer <- function(x) NGramTokenizer(paste(unlist(strsplit(as.character(x), '')), collapse = ' '),
                                               Weka_control(min = 2, max = 2))
trigram.tokenizer <- function(x) NGramTokenizer(paste(unlist(strsplit(as.character(x), '')), collapse = ' '),
                                                Weka_control(min = 3, max = 3))
quadgram.tokenizer <- function(x) NGramTokenizer(paste(unlist(strsplit(as.character(x), '')), collapse = ' '),
                                                 Weka_control(min = 4, max = 4))


words <- readLines("words.txt", n = -1, encoding = "UTF-8", skipNul = TRUE)

corpus <- Corpus(VectorSource(words))
corpus <- tm_map(corpus, content_transformer(tolower))
corpus <- tm_map(corpus, removeNumbers)
corpus <- tm_map(corpus, removePunctuation)
corpus <- tm_map(corpus, stripWhitespace)
corpus <- tm_map(corpus, function(v) gsub(" ", "", v, fixed = TRUE))
#corpus <- tm_map(corpus, removeWords, stopwords("english"))
#corpus <- tm_map(corpus, stemDocument)
corpus <- tm_map(corpus, PlainTextDocument)

unique.tdm <- TermDocumentMatrix(corpus)

bigram.tdm <- TermDocumentMatrix(corpus, control = list(tokenize = bigram.tokenizer))
bigram.dataset <- makeDataset(bigram.tdm, 2)
bigram.dataset$word <- gsub(" ", "", bigram.dataset$word, fixed = TRUE)
rownames(bigram.dataset) <- NULL

trigram.tdm <- TermDocumentMatrix(corpus, control = list(tokenize = trigram.tokenizer))
trigram.dataset <- makeDataset(trigram.tdm, 2)
trigram.dataset$word <- gsub(" ", "", trigram.dataset$word, fixed = TRUE)
rownames(trigram.dataset) <- NULL

quadgram.tdm <- TermDocumentMatrix(corpus, control = list(tokenize = quadgram.tokenizer))
quadgram.dataset <- makeDataset(quadgram.tdm, 2)
quadgram.dataset$word <- gsub(" ", "", quadgram.dataset$word, fixed = TRUE)
rownames(quadgram.dataset) <- NULL

# tdm <- removeSparseTerms(bigram.tdm, 0.99999)
# freq <- sort(rowSums(as.matrix(tdm)), decreasing = TRUE)
# data <- data.frame(word = names(freq), freq = freq)
# rownames(data) <- NULL


bigram.colsum <- sum(bigram.dataset$freq)
bigram.dataset$prob <- bigram.dataset$freq / bigram.colsum
bigram.dataset$prob_int <- as.integer(bigram.dataset$prob * 1000000)
trigram.colsum <- sum(trigram.dataset$freq)
trigram.dataset$prob <- trigram.dataset$freq / trigram.colsum
trigram.dataset$prob_int <- as.integer(trigram.dataset$prob * 1000000)
quadgram.colsum <- sum(quadgram.dataset$freq)
quadgram.dataset$prob <- quadgram.dataset$freq / quadgram.colsum
quadgram.dataset$prob_int <- as.integer(quadgram.dataset$prob * 1000000)


write.csv(bigram.dataset[, c('word', 'prob_int')], 'bigram.csv', quote = F, row.names = F)
write.csv(trigram.dataset[, c('word', 'prob_int')], 'trigram.csv', quote = F, row.names = F)
write.csv(quadgram.dataset[, c('word', 'prob_int')], 'quadgram.csv', quote = F, row.names = F)

