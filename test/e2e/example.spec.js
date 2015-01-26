describe('app skeleton homepage', function() {
    it('should display the homepage message', function() {
        browser.get('/');

        expect(element.all(by.css('h1')).first().getText())
        .toMatch(/Homepage angular and gulp skeleton/);
    });

    describe('page navigation', function() {
        var pageLinks;

        beforeEach(function() {
            browser.get('/');

            pageLinks = element.all(by.css('#navbar a'));
        });

        it('second should go to Page 1', function() {
            pageLinks.get(1).click().then(function() {
                browser.waitForAngular();
                expect(element.all(by.css('h1')).first().getText())
                .toMatch(/Page page1/);
            });
        });

        it('third should go to Page 2', function() {
            pageLinks.get(2).click().then(function() {
                browser.waitForAngular();
                expect(element.all(by.css('h1')).first().getText())
                .toMatch(/Page page2/);
            });
        });
    });
});
