import {FragmentComponent} from './fragment.component';
import {render} from "@testing-library/angular";
import {FragmentService} from "./services/fragment.service";
import {of} from "rxjs";

describe('FragmentComponent', () => {
  it('should create', async () => {
    const response = "</div>Hello, World</div>";
    const component = await render(FragmentComponent, {
      providers: [
        {provide: FragmentService, useValue: { fetch: () => of(response) }}
      ]
    })

    expect(component.queryByText('Hello, World')).not.toBeNull()
  });
});
