// Evaluator class
var mcqEvaluator = Class.extend({
    evaluate: function(data) {
        debugger;
        var evalData = JSON.parse(data);
        var check = _.find(evalData.options, function(id) {
            //getting question id 
            //match answere id

        });
        // TODO: Evaluation logic here

        //get the selected answere
        //iterate loop with option and selected answere
        //based on right answere return the result
        console.log(data);
    }
});