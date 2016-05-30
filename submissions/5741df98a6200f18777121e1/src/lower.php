<?php

file_put_contents(__DIR__ . '/words.txt', implode("\n", array_filter(array_unique(explode("\n", strtolower(file_get_contents(__DIR__ . '/words_orig.txt')))))));
