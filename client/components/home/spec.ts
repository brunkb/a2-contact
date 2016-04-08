import {
TestComponentBuilder,
describe,
expect,
inject,
it,
AsyncTestCompleter
} from 'angular2/testing_internal';

import {HomeComponent} from './component';

export function main() {

  describe('HomeComponent', () => {

    it('should work',
      inject([TestComponentBuilder, AsyncTestCompleter], (tcb: TestComponentBuilder, async: AsyncTestCompleter) => {
        tcb.createAsync(HomeComponent).then((fixture) => {
          const compiled = fixture.debugElement.nativeElement;
          expect(compiled.querySelector('h2').textContent).toEqual('Home!');
          async.done();
        });
      }));

  });
}
