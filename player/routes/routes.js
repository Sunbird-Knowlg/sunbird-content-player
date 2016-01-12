/**
 * Defines all Rest Routes. This is a framework component that can be used to
 * configure deployable services at runtime from their orchestrator. This can
 * also provide authentication, interceptor capabilities.
 *
 * @author Jitendra Singh Sankhwar
 */
var contentHelper = require('../view_helpers/ContentViewHelper');

module.exports = function(app, dirname) {
	
	/** Content List Routes */
	app.post('/genie-canvas/v1/content/list', contentHelper.getContentList);
};

