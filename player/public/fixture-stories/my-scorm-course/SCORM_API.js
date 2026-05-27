function ScormAPI() {
    this.api = null;

    this.initialize = function () {
        this.api = this.getAPI();
        if (this.api) {
            return this.api.LMSInitialize("");
        }
        return false;
    };

    this.terminate = function () {
        if (this.api) {
            return this.api.LMSFinish("");
        }
        return false;
    };

    this.setLessonStatus = function (status) {
        if (this.api) {
            return this.api.LMSSetValue("cmi.core.lesson_status", status);
        }
        return false;
    };

    this.commit = function () {
        if (this.api) {
            return this.api.LMSCommit("");
        }
        return false;
    };

    this.getAPI = function () {
        var win = window;
        while (win.API == null && win.parent != null && win.parent != win) {
            win = win.parent;
        }
        return win.API;
    };
}
