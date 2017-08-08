var H5PUpgrades = H5PUpgrades || {};

H5PUpgrades['H5P.SingleChoiceSet'] = (function ($) {
  return {
    1: {
      7: function (options, finished) {
        if(options.choices != undefined){
          for (var i = 0; i < options.choices.length; i++) {
            if (options.choices[i] && options.choices[i].subContentId === undefined) {
              // NOTE: We avoid using H5P.createUUID since this is an upgrade script and H5P function may change in the
              // future
              options.choices[i].subContentId = 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(char) {
                var random = Math.random()*16|0, newChar = char === 'x' ? random : (random&0x3|0x8);
                return newChar.toString(16);
              });
            }
          }
        }

        finished(null, options);
      }
    }
  };
})(H5P.jQuery);			
