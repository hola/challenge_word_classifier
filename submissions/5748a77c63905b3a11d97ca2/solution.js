module.exports = {

    vogals: ['a','e','i','o','u'],
    nonVogals: ['b','c','d','f','g','h','j','k','l','m','n','p','q','r','s','t','v','w','x','y','z','\''],

	vogalsPosition : [],
	nonVogalsPosition : [],

    init: function(data) {

    },

    isAVogal: function(character) {

        	for(var j = 0; j < this.vogals.length; j++) {
        		//it is a vogal
        		if(this.vogals[j]===character) {
        	      return true;
        		}
        	}
        	return false;
    },

	checkIfVogals: function(word,i,c) {

		for(var j = 0; j < this.vogals.length; j++) {
			//it is a vogal
			if(this.vogals[j]===c) {

				//save the character and its position
				var elem = {
					position: i,
					letter: c
				};

				this.vogalsPosition.push(elem);
			}
		}
	},

	checkIfNonVogals: function(word,i,c) {

		for(var j = 0; j < this.nonVogals.length; j++) {
			//it is a non vogal
			if(this.nonVogals[j]===c) {
				var elem = {
					position: i,
					letter: c
				};
				this.nonVogalsPosition.push(elem);
			}
		}
	},
    
    test: function(word) {

        this.vogalsPosition = [];
        this.nonVogalsPosition = [];


		var wordSize = word.length;
		//very likely to be false
		if(word.length >= 15) {
			//console.log(' "'+ word + '": ' + false);
			return false;
		}

		var aphostrofes = 0;
        for(var i = 0; i < word.length; i++) {
        	//get the character at the given position
			var c = word.charAt(i);

			if(c === '\'') {
				aphostrofes++;
			}

			if(i > 0) {
				var previous = word.charAt(i-1);
				//special case (two consecutive '')
				if(c === '\''  && previous=== c) {
					//console.log(' "'+ word + '": ' + false);
					return false;
				}//another special case, two consecutive equal vogals, or two consecutive equal non vogals at the beginning
				else if( (c === previous && this.isAVogal(c) )  || (c === previous && !this.isAVogal(c) && i===1 ) ) {
					//console.log(' "'+ word + '": ' + false);
					return false;
				}
			}

			if(aphostrofes>=2) {
				//console.log(' "'+ word + '": ' + false);
				return false;
			}

			//vogals
			this.checkIfVogals(word,i,c);
			//non vogals
			this.checkIfNonVogals(word,i,c);

        }

		var vogalsSize = this.vogalsPosition.length;
		if( vogalsSize === wordSize || vogalsSize === wordSize -1) {
			//console.log(' "'+ word + '": ' + false);
			return false;
		}

		//check special sequences
		if( word.endsWith('ki')) {
			//console.log(' "'+ word + '": ' + false);
			return false;
		}
		else if( (word.endsWith('tion') && word.indexOf('ation')===-1 ) || word.endsWith('cion')) {
			//console.log(' "'+ word + '": ' + false);
			return false;
		}
		else if(word.endsWith('as')) {
			var idx = word.indexOf('as');
			if(idx > 0 && this.isAVogal(word.charAt(idx-1))) {
				//console.log(' "'+ word + '": ' + false);
				return false;
			}

		}
		else if(word.indexOf('dr') > 0) {
			var idx = word.indexOf('dr');
			if(idx < word.length-1) {
				var next = word.charAt(idx+1);
				if(next==='o' || next === 'u') {
					//console.log(' "'+ word + '": ' + false);
					return false;
				}
			}
		}

        //if we have 3 consecutive vogals is not an english word
		if(this.vogalsPosition.length>=3) {
			var consecutive = 1;
			//start at vogal with index 1 and compare with the previous vogal position
			for(var x = 1; x < this.vogalsPosition.length; x++) {
        	   if(this.vogalsPosition[x].position === (this.vogalsPosition[x-1].position + 1) )  { //consecutive indexes in word
	        	   	consecutive++;
				   if(consecutive>=4) {
					   ////console.log("VOGALS: THIS IS NOT AN ENGLISH WORD: " + word);
					   //console.log(' "'+ word + '": ' + false);
					   return false;
				   }
				   else if(consecutive===3 && this.vogalsPosition[x-2].position === 0) {
					   //console.log(' "'+ word + '": ' + false);
					   return false;
				   }
				   else if(consecutive === 2 && (this.vogalsPosition[x-1].position === 0 || this.vogalsPosition[x-1].position === word.length-1) && this.vogalsPosition[x].letter === this.vogalsPosition[x-1].letter){
					   //console.log(' "'+ word + '": ' + false);
					   return false;
				   }
        	    }
        	    else {
        	   	 //reset the counter
        	   	 consecutive=1;
        	    }

        	}

 

		}


		var nonVogalsSize = this.nonVogalsPosition.length;
		if( nonVogalsSize === wordSize) {
			//console.log(' "'+ word + '": ' + false);
			return false;
		}

		////console.log("-----------------------------------------------------------");
		if(this.nonVogalsPosition.length>=3) {

			var consecutive = 1;
			for(var x = 1; x < this.nonVogalsPosition.length; x++) {
        	   if(this.nonVogalsPosition[x].position === (this.nonVogalsPosition[x-1].position + 1) )  { //consecutive
	        	   	consecutive++;
	        	   	if(consecutive>=3) {

	        	   		if(consecutive===3) {

	        	   			//exactly 3
	        	   			//special cases of ', if ends with ?'s (most of the times is true)
		        	        if( this.nonVogalsPosition[x].letter === 's' &&  this.nonVogalsPosition[x-1].letter === '\'' && this.nonVogalsPosition[x].position === word.length-1) {

								if(this.nonVogalsPosition[x-1].position > 0) {
									var char = word.charAt(this.nonVogalsPosition[x-1].position - 1);
									if(char === 'c' || char==='t') {
										//console.log(' "'+ word + '": ' + false);
										return false;
									}
								}
		        	        }

		        	        if(word.length <= 5) {
								//console.log(' "'+ word + '": ' + false);
								return false;
							}

	        	   		}
	        	   		//> 3 always false
	        	   		else {

	        	   			//console.log(' "'+ word + '": ' + false);
	        	   			return false;
	        	   		}

						
        				
	        	   	}//2 consecutive
				    else if(consecutive === 2 ) {
						if( this.nonVogalsPosition[x-1].position === 0 && this.nonVogalsPosition[x-1].letter === this.nonVogalsPosition[x].letter ) {
							//console.log(' "'+ word + '": ' + false);
							return false;
						}

					}



        	   }
        	   else {
        	   	//reset the counter
        	   	consecutive=1;
        	   }
        	}

		}


        //console.log(' "'+ word + '": ' + true);
		return true;


    }
};

