// This file is provided for convenience for those who will want to understand how the 'init' and 'test' functions work.
// The actual JS part of the program has been optimized to save space and thus allow more information in the data file.
// The optimization process was so thorough that it made the final JS file all but unreadable for humans.

var w=[5,29,1,185760,10813,11283],i,j,p=0,y,f,n=0;       // All the variables (defined together to avoid another "var ", which wastes 4 bytes for nothing)

exports.init=(d)=>{
 for(;n<3;++n){                                          // For each list (L1,L2,L3)...
  w.push(w[n])                                           // Add initial element value (hardcoded in 'w' above)
  for(i=1;i<w[n+3];++i){                                 // For each element (encoded diff) of the current list
   y=0;while(!(d[p/8|0]&1<<p%8)){++y;++p}                // Count zero bits (Note: "p/8|0" equals "Math.floor(p/8)")
   ++p                                                   // Skip the '1' delimiter (separates zeros from data bits)
   f=0;for(j=0;j<y;++j){if(d[p/8|0]&1<<p%8)f|=1<<j;++p}  // Assemble data bits
   w.push(w[w.length-1]+f+(1<<y))                        // Restore original diff and add it to previous value (thus restoring the original value of each element)
  }
 }
}


exports.test=(x)=>{
// Auxiliary converters
 function t(x,i){return x[i]=="'"?27:x.charCodeAt(i)-96}          // Convert x[i] char to int[1,27] (simple alphabetical order)
 function u(i){return i?" xqj'vzwfkbgphdmcntlrysiueoa"[i]:""}     // L1: Convert 'i' index to letter (reverse of generator's 'ch2int1')
 function v(i){return t(" bojkaspqewthlicn{fdgmvuyrxz",t(x,i))}   // L2: Convert x[i] char to int (equivalent to generator's 'ch2int2'); double call to 'r' allows to use a string instead of a more lengthy integer array, saving dozens of bytes
 f=x.length;
// L2: Handle 1/2/3/4-letter word: convert it to number and look it up in L2 - return 'true' iff found (must go first because it's the most accurate method)
 if(f<5)return w.indexOf(v(0)+(f>1?v(1):0)*28+(f>2?v(2)*784:0)+(f>3?v(3)*21952:0),-w[5])!=-1;
 if(f>15)return 0;
// L1: Reject words with excluded combinations, i.e. convert each element from L1 value to original 2/3-letter string, and look it up in 'x'
 for(i=0;i<w[4];++i){
  p=w[6+w[3]+i];                                                  // Get the value from L1
  y=u(p%28)+u((p/28|0)%28)+u(p/784|0);                            // Convert to string (2 or 3 letters)
  if(x.indexOf(y)!=-1)return 0                                    // String found in the word - excluded
 }
// L0: Match a signature, i.e. convert 'x' to a 20-bit signature and look it up in L0
 y=1-f%2;for(i=0;i<f;++i)y|=1<<t(" bpjncmqlfplhmgdopeakiosrrqs",t(x,i)); // Calculate the signature
 return w.slice(6,6+w[3]).indexOf(y)!=-1;                                // 'true' iff signature is found in L0
}


