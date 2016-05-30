#!/bin/awk -f
BEGIN { skip=0 }

NR==1 { metadata=$0; $0="" }
/let {m, k, _locations} = JSON.parse\(/ {sub(/= .*/, "= " metadata ";")}

/BEGIN_SKIP/ { skip=1 }
!skip { print }
/END_SKIP/ { skip=0 }
