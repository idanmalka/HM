import { HMPage } from './app.po';

describe('hm App', function() {
  let page: HMPage;

  beforeEach(() => {
    page = new HMPage();
  });

  it('should display message saying app works', () => {
    page.navigateTo();
    expect(page.getParagraphText()).toEqual('app works!');
  });
});
