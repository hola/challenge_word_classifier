<?php

$data = array_map('strtolower', array_map('trim', file('words.txt')));
$index = [];
$tree = [];
$dict = [];

echo "Count is ", count($data), "\n";
echo "Optimizing...\n";

$data = array_values(array_unique($data));

foreach ($data as &$item) {
    if (substr($item, -2) === "'s") {
        $item = substr($item, 0, -2);
    }
    // if (in_array(substr($item, 0, 4), ["anti", "mega", "mini", "nano", "semi"], true)) {
    //     $item = substr($item, 4);
    // } elseif (in_array(substr($item, 0, 5), ["super"], true)) {
    //     $item = substr($item, 5);
    // }
    // if (in_array(substr($item, -4), ["ness", "less", "tion", "ings"], true)) {
    //     $item = substr($item, 0, -4);
    // } elseif (in_array(substr($item, -6), ["nesses", "lesses"], true)) {
    //     $item = substr($item, 0, -6);
    // } elseif (in_array(substr($item, -5), ["ingly", "tions"], true)) {
    //     $item = substr($item, 0, -5);
    // }
}
unset($item);

$data = array_values(array_unique($data));

echo "Count is ", count($data), "\n";
echo "Indexing...\n";

foreach ($data as $item) {
    $index[strlen($item)][] = $item;
}

echo "Sorting...\n";

ksort($index);

foreach ($index as $len => $items) {
    sort($index[$len]);
}

echo "Generating helpers...\n";

$compact = [];
$chars = "abcdefghijklmnopqrstuvwxyz";

foreach (range(0, strlen($chars) - 4) as $i) {
    foreach (range(strlen($chars) - $i, 4) as $len) {
        $s = substr($chars, $i, $len);
        $compact[$s] = $s[0] . "-" . substr($s, -1);
    }
}

$compact["'$chars"] = '.';
$compact[$chars] = '\\w';

uksort($compact, function ($a, $b) { return strlen($a) < strlen($b); });

echo "Generating tree...\n";

foreach ($index as $len => $items) {
    // if ($len <= 2) {
    //     continue;
    // }
    $tree[$len] = [];
    $node =& $tree[$len];
    $last = $len - 1;
    foreach ($items as $item) {
        $node[$last][] = $item[$last];
    }
    $node[$last] = array_values(array_unique($node[$last]));
    sort($node[$last]);
    $node[$last] = strtr(implode($node[$last]), $compact);
    if (!in_array($node[$last], [".", "\\w"], true) && strlen($node[$last]) > 1) {
        $node[$last] = "[" . $node[$last] . "]";
    }
    $r = '';
    if ($len >= 2) foreach (range(0, $len - 2) as $i) {
        foreach ($items as $item) {
            $node[$i][$item[$i]][] = $item[$i+1];
        }
        $tmp = [];
        foreach ($node[$i] as $char => $_) {
            $node[$i][$char] = array_values(array_unique($node[$i][$char]));
            sort($node[$i][$char]);
            $node[$i][$char] = strtr(implode($node[$i][$char]), $compact);
            if (!in_array($node[$i][$char], [".", "\\w"], true) && strlen($node[$i][$char]) > 1) {
                if (strlen($node[$i][$char]) == 2) {
                    $node[$i][$char] = implode("|", str_split($node[$i][$char]));
                } else {
                    $node[$i][$char] = "[" . $node[$i][$char] . "]";
                }
            }
            if ($node[$i][$char] === ".") {
                $tmp[""][] = $char;
            } elseif ($i == ($last - 1) && $node[$last] === $node[$i][$char]) {
                $tmp[""][] = $char;
            } else {
                $tmp["(?=" . $node[$i][$char] . ")"][] = $char;
            }
        }
        foreach ($tmp as $next => $item) {
            if (count($item) >= 2) {
                $tmp[$next] = "[" . implode($item) . "]" . $next;
            } else {
                $tmp[$next] = $item[0] . $next;
            }
        }
        $r .= "(" . implode("|", $tmp) . ")";
    }
    $r .= $node[$last];
    if (strlen(implode("|", $items)) <= strlen($r)) {
        $node = implode("|", $items);
    } else {
        $node = "($r)";
    }
}

$result = implode(";", $tree);

echo "Compressing...\n";

$result = str_replace("(?=[", "0", $result);
$result = str_replace("])|", "1", $result);
$result = str_replace("-pr-", "2", $result);
$result = str_replace("(?=", "3", $result);

$result = strtr($result, ["\\" => "\\\\"]);

// $dict = [];

// foreach (range(0, strlen($result) - 2) as $i) {
//     foreach (range(2, 10) as $len) {
//         $dict[] = substr($result, $i, $len);
//     }
// }

// $dict = array_count_values($dict);

// foreach ($dict as $item => $count) {
//     $dict[$item] = $count * (strlen($item) - 1);
// }

// arsort($dict);
// var_dump(array_slice($dict, 0, 10));

// foreach (array_slice(array_keys($dict), 0, 26) as $index => $item) {
//     $result = str_replace($item, strtoupper($chars[$index]), $result);
// }

file_put_contents('regexp.txt', $result);
