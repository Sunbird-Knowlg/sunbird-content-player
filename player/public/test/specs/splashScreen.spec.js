describe("splashScreen test", function() {
  it("splashScreen ", function() {
  		console.log("test case is running..",splashScreen)
  		expect(splashScreen.config.webLink).toEqual('https://www.ekstep.in');
    	expect(true).toBe(true);
  });
});