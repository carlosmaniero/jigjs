import { render } from '@testing-library/vue';
import Summary from '@/pages/summary/Summary.vue';
import { publishEvent } from '../../../../core/src/event-bus';

describe('Summary.vue', () => {
  it('renders the price', async () => {
    const component = render(Summary);

    publishEvent('CART_SERVICE_ITEMS', {
      items: [
        {
          number: 2, name: 'Pikachu', total: 1, price: 318,
        },
        {
          number: 1, name: 'Bulbasaur', total: 2, price: 320,
        },
      ],
      total: 3,
    });

    expect(await component.findByText('$958')).not.toBeNull();
  });

  it('renders total items', async () => {
    const component = render(Summary);

    publishEvent('CART_SERVICE_ITEMS', {
      items: [
        {
          number: 2, name: 'Pikachu', total: 1, price: 318,
        },
        {
          number: 1, name: 'Bulbasaur', total: 2, price: 320,
        },
      ],
      total: 3,
    });

    expect(await component.findByText('3 products')).not.toBeNull();
  });

  it('renders total on singular', async () => {
    const component = render(Summary);

    publishEvent('CART_SERVICE_ITEMS', {
      items: [
        {
          number: 2, name: 'Pikachu', total: 1, price: 318,
        },
      ],
      total: 1,
    });

    expect(await component.findByText('1 product')).not.toBeNull();
  });
});
