describe('QuestionFormController', function() {
    var $controller, controller, $scope, instance, scope;
    beforeEach(module('createquestionapp'));

    beforeEach(inject(function(_$controller_, $rootScope) {
        $controller = _$controller_;
        scope = $rootScope.$new();
        instance = new mcqplugin.EditorPlugin({}, {}, {});
        controller = $controller('QuestionFormController', { $scope: scope, instance: instance });
        scope.editorObj1 = {"question":{"text":"fdsf","image":"https://ekstep-public-dev.s3-ap-south-1.amazonaws.com/content/4272f16cf3fd329b18dd116315601ad0_1476257845556.jpeg","audio":"https://ekstep-public-dev.s3-ap-south-1.amazonaws.com/content/10_1466574879630.mp3"},
        "answers":[{"isAnswerCorrect":true,"score":1,"text":"sfsdfs","image":"https://ekstep-public-dev.s3-ap-south-1.amazonaws.com/content/2_1466487176189.jpg","audio":"https://ekstep-public-dev.s3-ap-south-1.amazonaws.com/content/10_1466574879107.mp3"},{"isAnswerCorrect":false,"score":0,"text":"sdff","image":"https://ekstep-public-dev.s3-ap-south-1.amazonaws.com/content/do_1123299521599324161198/artifact/9da9198e2550babf559b9f7ec3db4894_1505121113377.jpeg","audio":"https://ekstep-public-dev.s3-ap-south-1.amazonaws.com/content/1b_1466487334574.mp3"}]};
        
    }));
    describe('Test',function(){

        it('should initialize createquestionController', function() {
        controller = $controller('createquestionController', { $scope: scope, instance: instance });
        expect(controller).not.toBe(null);
    });

    });

});
