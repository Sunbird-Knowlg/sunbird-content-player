H5P.Summary = (function ($, Question, XApiEventBuilder, StopWatch) {

  function Summary(options, contentId, contentData) {
    if (!(this instanceof H5P.Summary)) {
      return new H5P.Summary(options, contentId);
    }
    this.id = this.contentId = contentId;
    Question.call(this, 'summary');
    this.offset = 0;
    this.score = 0;
    this.progress = 0;
    this.answers = [];
    this.answer = [];
    this.errorCounts = [];

    /**
     * The key is panel index, returns an array of the answer indexes the user tried.
     *
     * @property {number[][]}
     */
    this.userResponses = [];

    /**
     * The first key is panel index, and the second key is data-bit, value is index in panel
     *
     * @property {number[][]}
     */
    this.dataBitMap = [];

    // Remove empty summary to avoid JS-errors
    if (options.summaries) {
      options.summaries = options.summaries.filter(function (element) {
        return element.summary !== undefined;
      });
    }

    if (contentData && contentData.previousState !== undefined &&
        contentData.previousState.progress !== undefined &&
        contentData.previousState.answers) {
      this.progress = contentData.previousState.progress || this.progress;
      this.answers = contentData.previousState.answers || this.answers;

      var currentProgress = this.progress;

      // Do not count score screen as an error
      if (this.progress >= options.summaries.length) {
        currentProgress = options.summaries.length - 1;
      }

      for (var i = 0; i <= currentProgress; i++) {
        if (this.errorCounts[i] === undefined) {
          this.errorCounts[i] = 0;
        }
        if (this.answers[i]) {
          this.score += this.answers[i].length;
          this.errorCounts[i]++;
        }
      }
    }
    var that = this;

    /**
     * @property {StopWatch[]} Stop watches for tracking duration of slides
     */
    this.stopWatches = [];
    this.startStopWatch(this.progress);

    this.options = H5P.jQuery.extend({}, {
      response: {
        scorePerfect:
        {
          title: "PERFECT!",
          message: "You got everything correct on your first try. Be proud!"
        },
        scoreOver70:
        {
          title: "Great!",
          message: "You got most of the statements correct on your first try!"
        },
        scoreOver40:
        {
          title: "Ok",
          message: "You got some of the statements correct on your first try. There is still room for improvement."
        },
        scoreOver0:
        {
          title: "Not good",
          message: "You need to work more on this"
        }
      },
      summary: "You got @score of @total statements (@percent %) correct on your first try.",
      resultLabel: "Your result:",
      intro: "Choose the correct statement.",
      solvedLabel: "Solved:",
      scoreLabel: "Wrong answers:",
      postUserStatistics: (H5P.postUserStatistics === true)
    }, options);

    this.summaries = that.options.summaries;

    // Required questiontype contract function
    this.showSolutions = function() {
      // intentionally left blank, no solution view exists
    };

    // Required questiontype contract function
    this.getMaxScore = function() {
      return this.summaries.length;
    };

    this.getScore = function() {
      var self = this;

      // count single correct answers
      return self.summaries.reduce(function(result, panel, index){
        var userResponse = self.userResponses[index] || [];

        return result + (self.correctOnFirstTry(userResponse) ? 1 : 0);
      }, 0);
    };

    this.getTitle = function() {
      return H5P.createTitle(this.options.intro);
    };

    this.getCurrentState = function () {
      return {
        progress: this.progress,
        answers: this.answers
      };
    };
  }

  Summary.prototype = Object.create(Question.prototype);
  Summary.prototype.constructor = Summary;

  /**
   * Registers DOM elements before they are attached.
   * Called from H5P.Question.
   */
  Summary.prototype.registerDomElements = function () {
    // Register task content area
    this.setContent(this.createQuestion());
  };

  // Function for attaching the multichoice to a DOM element.
  Summary.prototype.createQuestion = function() {
    var that = this;
    var id = 0; // element counter
    var elements = [];
    var $ = H5P.jQuery;
    this.$myDom = $('<div>', {
      'class': 'summary-content'
    });

    if (that.summaries === undefined || that.summaries.length === 0) {
      return;
    }

    // Create array objects
    for (var panelIndex = 0; panelIndex < that.summaries.length; panelIndex++) {
      if (!(that.summaries[panelIndex].summary && that.summaries[panelIndex].summary.length)) {
        continue;
      }

      elements[panelIndex] = {
        tip: that.summaries[panelIndex].tip,
        summaries: []
      };

      for (var summaryIndex = 0; summaryIndex < that.summaries[panelIndex].summary.length; summaryIndex++) {
        var isAnswer = (summaryIndex === 0);
        that.answer[id] = isAnswer; // First claim is correct

        // create mapping from data-bit to index in panel
        that.dataBitMap[panelIndex] = this.dataBitMap[panelIndex] || [];
        that.dataBitMap[panelIndex][id] = summaryIndex;

        // checks the answer and updates the user response array
        if(that.answers[panelIndex] && (that.answers[panelIndex].indexOf(id) !== -1)){
          this.storeUserResponse(panelIndex, summaryIndex);
        }

        // adds to elements
        elements[panelIndex].summaries[summaryIndex] = {
          id: id++,
          text: that.summaries[panelIndex].summary[summaryIndex]
        };
      }

      // if we have progressed passed this point, the success pattern must also be saved
      if(panelIndex < that.progress){
        this.storeUserResponse(panelIndex, 0);
      }

      // Randomize elements
      for (var k = elements[panelIndex].summaries.length - 1; k > 0; k--) {
        var j = Math.floor(Math.random() * (k + 1));
        var temp = elements[panelIndex].summaries[k];
        elements[panelIndex].summaries[k] = elements[panelIndex].summaries[j];
        elements[panelIndex].summaries[j] = temp;
      }
    }

    // Create content panels
    var $summary_container = $('<div class="summary-container"></div>');
    var $summary_list = $('<ul></ul>');
    var $evaluation = $('<div class="summary-evaluation"></div>');
    var $evaluation_content = $('<div class="summary-evaluation-content">' + that.options.intro + '</div>');
    var $score = $('<div class="summary-score"></div>');
    var $options = $('<div class="summary-options"></div>');
    var $progress = $('<div class="summary-progress"></div>');
    var options_padding = parseInt($options.css('paddingLeft'));

    if (this.score) {
      $score.html(that.options.scoreLabel + ' ' + this.score).show();
    }

    // Insert content
    $summary_container.append($summary_list);
    this.$myDom.append($summary_container);
    this.$myDom.append($evaluation);
    this.$myDom.append($options);
    $evaluation.append($evaluation_content);
    $evaluation.append($evaluation);
    $evaluation.append($progress);
    $evaluation.append($score);

    /**
     * Handle selected alternative
     *
     * @param {jQuery} $el Selected element
     * @param {boolean} [setFocus] Set focus on first element of next panel.
     *  Used when alt was selected with keyboard.
     */
    var selectedAlt = function ($el, setFocus) {
      var nodeId = Number($el.attr('data-bit'));
      var panelId = Number($el.parent().data('panel'));
      if (that.errorCounts[panelId] === undefined) {
        that.errorCounts[panelId] = 0;
      }

      that.storeUserResponse(panelId, nodeId);

      // Correct answer?
      if (that.answer[nodeId]) {
        that.stopStopWatch(panelId);

        that.progress++;
        var position = $el.position();
        var summary = $summary_list.position();
        var $answer = $('<li>' + $el.html() + '</li>');

        $progress.html(that.options.solvedLabel + ' '  + (panelId + 1) + '/' + that.summaries.length);

        // Insert correct claim into summary list
        $summary_list.append($answer);
        $summary_container.addClass('has-results');
        that.adjustTargetHeight($summary_container, $summary_list, $answer);

        // Move into position over clicked element
        $answer.css({display: 'block', width: $el.css('width'), height: $el.css('height')});
        $answer.css({position: 'absolute', top: position.top, left: position.left});
        $answer.css({backgroundColor: '#9dd8bb', border: ''});
        setTimeout(function () {
          $answer.css({backgroundColor: ''});
        }, 1);
        //$answer.animate({backgroundColor: '#eee'}, 'slow');

        var panel = parseInt($el.parent().attr('data-panel'));
        var $curr_panel = $('.h5p-panel:eq(' + panel + ')', that.$myDom);
        var $next_panel = $('.h5p-panel:eq(' + (panel + 1) + ')', that.$myDom);
        var finished = ($next_panel.length === 0);
        var height = $curr_panel.parent().css('height');

        // Disable panel while waiting for animation
        $curr_panel.addClass('panel-disabled');

        // Update tip:
        $evaluation_content.find('.joubel-tip-container').remove();
        if (elements[that.progress] !== undefined &&
          elements[that.progress].tip !== undefined &&
          elements[that.progress].tip.trim().length > 0) {
          $evaluation_content.append(H5P.JoubelUI.createTip(elements[that.progress].tip));
        }

        $answer.animate(
          {
            top: summary.top + that.offset,
            left: '-=' + options_padding + 'px',
            width: '+=' + (options_padding * 2) + 'px'
          },
          {
            complete: function() {
              // Remove position (becomes inline);
              $(this).css('position', '').css({
                width: '',
                height: '',
                top: '',
                left: ''
              });
              $summary_container.css('height', '');

              // Calculate offset for next summary item
              var tpadding = parseInt($answer.css('paddingTop')) * 2;
              var tmargin = parseInt($answer.css('marginBottom'));
              var theight = parseInt($answer.css('height'));
              that.offset += theight + tpadding + tmargin + 1;

              // Fade out current panel
              $curr_panel.fadeOut('fast', function () {
                $curr_panel.parent().css('height', 'auto');
                // Show next panel if present
                if (!finished) {
                  // start next timer
                  that.startStopWatch(that.progress);

                  $next_panel.fadeIn('fast');

                  // Focus first element of next panel
                  if (setFocus) {
                    $next_panel.children().get(0).focus();
                  }
                } else {
                  // Hide intermediate evaluation
                  $evaluation_content.html(that.options.resultLabel);

                  that.doFinalEvaluation();
                }
                that.trigger('resize');
              });
            }
          }
        );
      }
      else {
        // Remove event handler (prevent repeated clicks) and mouseover effect
        $el.off('click');
        $el.addClass('summary-failed');
        $el.removeClass('summary-claim-unclicked');

        $evaluation.children('.summary-score').css('display', 'block');
        $score.html(that.options.scoreLabel + ' ' + (++that.score));
        that.errorCounts[panelId]++;
        if (that.answers[panelId] === undefined) {
          that.answers[panelId] = [];
        }
        that.answers[panelId].push(nodeId);
      }

      that.trigger('resize');
      $el.attr('tabindex', '-1');
      that.triggerXAPI('interacted');

      // Trigger answered xAPI event on first try for the current
      // statement group
      if (that.userResponses[panelId].length === 1) {
        that.trigger(that.createXApiAnsweredEvent(
          that.summaries[panelId],
          that.userResponses[panelId] || [],
          panelId,
          that.timePassedInStopWatch(panelId)));
      }

      // Trigger overall answered xAPI event when finished
      if (finished) {
        that.triggerXAPIScored(that.getScore(), that.getMaxScore(), 'answered');
      }
    };

    $progress.html(that.options.solvedLabel + ' ' + this.progress + '/' + that.summaries.length);

    // Add elements to content
    for (var i = 0; i < elements.length; i++) {
      var element = elements[i];

      if (i < that.progress) { // i is panelId
        for (var j = 0; j < element.summaries.length; j++) {
          var sum = element.summaries[j];
          if (that.answer[sum.id]) {
            $summary_list.append('<li style="display:block">' + sum.text + '</li>');
            $summary_container.addClass('has-results');
            break;
          }
        }
        // Cannot use continue; due to id/animation system
      }

      var $page = $('<ul class="h5p-panel" data-panel="' + i + '"></ul>');


      // Create initial tip for first summary-list if tip is available
      if (i==0 && element.tip !== undefined && element.tip.trim().length > 0) {
        $evaluation_content.append(H5P.JoubelUI.createTip(element.tip));
      }

      for (var j = 0; j < element.summaries.length; j++) {
        var summaryLineClass = 'summary-claim-unclicked';

        // If progress is at current task
        if (that.progress === i && that.answers[that.progress]) {
          // Check if there are any previous wrong answers.
          for (var k = 0; k < that.answers[that.progress].length; k++) {
            if (that.answers[that.progress][k] === element.summaries[j].id) {
              summaryLineClass = 'summary-failed';
              break;
            }
          }
        }

        var $node = $('' +
          '<li role="button" tabindex="0" data-bit="' + element.summaries[j].id + '" class="' + summaryLineClass + '">' +
            element.summaries[j].text +
          '</li>');

        // Do not add click event for failed nodes
        if (summaryLineClass === 'summary-failed') {
          $page.append($node);
          continue;
        }

        $node.click(function() {
          selectedAlt($(this));
        }).keypress(function (e) {
          var keyPressed = e.which;
          // 32 - space
          if (keyPressed === 32) {
            selectedAlt($(this), true);
            e.preventDefault();
          }
        });

        $page.append($node);
      }

      $options.append($page);
    }

    if (that.progress === elements.length) {
      $evaluation_content.html(that.options.resultLabel);
      that.doFinalEvaluation();
    }
    else {
      // Show first panel
      $('.h5p-panel:eq(' + (that.progress) + ')', that.$myDom).css({display: 'block'});
      if (that.progress) {
        that.offset = ($('.summary-claim-unclicked:visible:first', that.$myDom).outerHeight() * that.errorCounts.length);
      }
    }

    that.trigger('resize');

    return this.$myDom;
  };

  /**
   * Calculate final score and display feedback.
   *
   * @param container
   * @param options_panel
   * @param list
   * @param score
   */
  Summary.prototype.doFinalEvaluation = function () {
    var that = this;
    var error_count = this.countErrors();

    // Calculate percentage
    var percent = 100 - (error_count / that.errorCounts.length * 100);

    // Find evaluation message
    var from = 0;
    for (var i in that.options.response) {
      switch (i) {
        case "scorePerfect":
          from = 100;
          break;
        case "scoreOver70":
          from = 70;
          break;
        case "scoreOver40":
          from = 40;
          break;
        case "scoreOver0":
          from = 0;
          break;
      }
      if (percent >= from) {
        break;
      }
    }

    // Show final evaluation
    var summary = that.options.summary.replace('@score', that.summaries.length - error_count).replace('@total', that.summaries.length).replace('@percent', Math.round(percent));
    this.setFeedback(summary, that.summaries.length - error_count, that.summaries.length);
    that.trigger('resize');
  };

  /**
   * Resets the complete task back to its' initial state.
   * Used for contracts.
   */
  Summary.prototype.resetTask = function () {
    // Summary is not yet able to Reset itself
  };

  /**
   * Adjust height of container.
   *
   * @param container
   * @param elements
   * @param el
   */
  Summary.prototype.adjustTargetHeight = function (container, elements, el) {
    var new_height = parseInt(elements.outerHeight()) + parseInt(el.outerHeight()) + parseInt(el.css('marginBottom')) + parseInt(el.css('marginTop'));
    if (new_height > parseInt(container.css('height'))) {
      container.animate({height: new_height});
    }
  };

  /**
   * Count amount of wrong answers
   *
   * @returns {number}
   */
  Summary.prototype.countErrors = function() {
    var error_count = 0;

    // Count boards without errors
    for (var i = 0; i < this.summaries.length; i++) {
      if (this.errorCounts[i] === undefined) {
        error_count++;
      }
      else {
        error_count += this.errorCounts[i] ? 1 : 0;
      }
    }

    return error_count;
  };

  /**
   * Returns the choices array for xApi statements
   *
   * @param {String[]} answers
   *
   * @return {{ choices: []}}
   */
  Summary.prototype.getXApiChoices = function (answers) {
    var choices = answers.map(function(answer, index){
      return XApiEventBuilder.createChoice(index.toString(), answer);
    });

    return {
      choices: choices
    }
  };

  /**
   * Saves the user response
   *
   * @param {number} questionIndex
   * @param {number} answerIndex
   */
  Summary.prototype.storeUserResponse = function (questionIndex, answerIndex) {
    var self = this;
    if(self.userResponses[questionIndex] === undefined){
      self.userResponses[questionIndex] = [];
    }

    self.userResponses[questionIndex].push(this.dataBitMap[questionIndex][answerIndex]);
  };

  /**
   * Starts a stopwatch for indexed slide
   *
   * @param {number} index
   */
  Summary.prototype.startStopWatch = function (index) {
    this.stopWatches[index] = this.stopWatches[index] || new StopWatch();
    this.stopWatches[index].start();
  };

  /**
   * Stops a stopwatch for indexed slide
   *
   * @param {number} [index]
   */
  Summary.prototype.stopStopWatch = function (index) {
    if(this.stopWatches[index]){
      this.stopWatches[index].stop();
    }
  };

  /**
   * Returns the passed time in seconds of a stopwatch on an indexed slide,
   * or 0 if not existing
   *
   * @param {number} index
   * @return {number}
   */
  Summary.prototype.timePassedInStopWatch = function (index) {
    if(this.stopWatches[index] !== undefined){
      return this.stopWatches[index].passedTime();
    }
    else {
      // if not created, return no passed time,
      return 0;
    }
  };

  /**
   * Returns the time the user has spent on all questions so far
   *
   * @return {number}
   */
  Summary.prototype.getTotalPassedTime = function () {
    return this.stopWatches
      .filter(function(watch){
        return watch != undefined;
      })
      .reduce(function(sum, watch){
        return sum + watch.passedTime();
      }, 0);
  };

  /**
   * Creates an xAPI answered event for a single statement list
   *
   * @param {object} panel
   * @param {number[]} userAnswer
   * @param {number} panelIndex
   * @param {number} duration
   *
   * @return {H5P.XAPIEvent}
   */
  Summary.prototype.createXApiAnsweredEvent = function (panel, userAnswer, panelIndex, duration) {
    var self = this;

    // creates the definition object
    var definition = XApiEventBuilder.createDefinition()
      .name('Summary statement')
      .description(self.options.intro)
      .interactionType(XApiEventBuilder.interactionTypes.CHOICE)
      .correctResponsesPattern(['0'])
      .optional(self.getXApiChoices(panel.summary))
      .build();

    // create the result object
    var result = XApiEventBuilder.createResult()
      .response(userAnswer.join('[,]'))
      .duration(duration)
      .score((self.correctOnFirstTry(userAnswer) ? 1 : 0), 1)
      .build();

    return XApiEventBuilder.create()
      .verb(XApiEventBuilder.verbs.ANSWERED)
      .objectDefinition(definition)
      .context(self.contentId, self.subContentId)
      .contentId(self.contentId, panel.subContentId)
      .result(result)
      .build();
  };

  Summary.prototype.correctOnFirstTry = function(userAnswer){
    return (userAnswer.length === 1) && userAnswer[0] === 0;
  };

  /**
   * Retrieves the xAPI data necessary for generating result reports.
   *
   * @return {object}
   */
  Summary.prototype.getXAPIData = function(){
    var self = this;

    // create array with userAnswer
    var children = self.summaries.map(function(panel, index) {
        var userResponse = self.userResponses[index] || [];
        var duration = self.timePassedInStopWatch(index);
        var event = self.createXApiAnsweredEvent(panel, userResponse, index, duration);

        return {
          statement: event.data.statement
        }
    });

    var result = XApiEventBuilder.createResult()
      .score(self.getScore(), self.getMaxScore())
      .duration(self.getTotalPassedTime())
      .build();

    // creates the definition object
    var definition = XApiEventBuilder.createDefinition()
      .interactionType(XApiEventBuilder.interactionTypes.COMPOUND)
      .name(self.getTitle())
      .description(self.options.intro)
      .build();

    var xAPIEvent = XApiEventBuilder.create()
      .verb(XApiEventBuilder.verbs.ANSWERED)
      .contentId(self.contentId, self.subContentId)
      .context(self.getParentAttribute('contentId'), self.getParentAttribute('subContentId'))
      .objectDefinition(definition)
      .result(result)
      .build();

    return {
      statement: xAPIEvent.data.statement,
      children: children
    };
  };

  /**
   * Returns an attribute from this.parent if it exists
   *
   * @param {string} attributeName
   * @return {*|undefined}
   */
  Summary.prototype.getParentAttribute = function (attributeName) {
    var self = this;

    if(self.parent !== undefined){
      return self.parent[attributeName];
    }
  };

  return Summary;

})(H5P.jQuery, H5P.Question, H5P.Summary.XApiEventBuilder, H5P.Summary.StopWatch);
