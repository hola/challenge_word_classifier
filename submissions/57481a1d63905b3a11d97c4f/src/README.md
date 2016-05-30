The solution is quite simple and straightforward: packing dictionary as much
as possible. For each dictionary entry, I save original form and list of affixes
that could be applied to this word form. Same idea can be found
in Hunspell dictionary.

On test phase, we applying affixes in reversed order trying to guess original
parent. If parent exists, then this word is present in the dictionary. To reduce
file size, I remove all long entries with a few affixes.

Dictionary is compressed into binary format + gzip. Most Javascript code compressed
into data file too.

Affixes list is hand generated with the help of Wiktionary and default
`Hunspell-en` dictionary found in most Linux distributions.
