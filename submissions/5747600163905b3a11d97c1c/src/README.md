# A Failed Attempt At Detecting English Words

In a nutshell, I decided to keep my code small so that I could include more data. Unfortunately, the SCOWL dictionary contains so many edge cases that throwing all of the data in the world at my program made no difference.

## Data Structure

In my `data.json` file, there are two groups of segments

* `positive` - strings of characters that suggest a word is **more likely** to be English
* `negative` - strings of characters that suggest a word is **less likely** to be English

## The Code

This essentially iterates over the segment types, and the containing array of items. If a word contains a segment, then its score is increased of decreased by the length of the match. Ultimately, if a word's score is less than 0, then it's deemed to not be English.

## How did I fetch the data

See the `learner` directory. I wrote a project that would

1. Take the list of failed test cases
2. Take those that were either positive or negative, depending upon the `isPositiveMode` flag:
  * Positive Mode = words that are English but the module detected as non-English
  * Negative Mode = words that are non-English but the module detected as English
  
3. Chunks of the failed words were sent to [WordFind](http://www.wordfind.com/). They don't provide an API, so I used [jsdom](https://github.com/tmpvar/jsdom) to scrape the HTML
4. If the number of words matching a chunk passed the configured threshold, then these were written to a results file. I ran this scraper over 2 days to capture as much data as possible.


## How It Performs

On average, I get about 60% locally, but it can be anywhere in the range of 50% - 70%.

## Lessons Learned

* The scraped data helped, but I should have done this in the first place.
* I need to properly study algorithms and machine learning