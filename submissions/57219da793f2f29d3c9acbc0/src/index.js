function main(){
  return Math.random() > 0.49;
}

module.exports = {
  init: function(data){
    console.log('random');
  },
  test: main()
};
