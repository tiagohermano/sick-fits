import { mount } from 'enzyme';
import toJSON from 'enzyme-to-json';
import wait from 'waait';
import Router from 'next/router';
import Pagination, { PAGINATION_QUERY } from '../components/Pagination';
import { CURRENT_USER_QUERY } from '../components/User';
import { MockedProvider } from 'react-apollo/test-utils';

Router.router = {
  push() {},
  prefetch() {},
}

function makeMocksFor(length) {
	return [
		{
			request: { query: PAGINATION_QUERY },
			result: {
				data: {
					itemsConnection: {
						__typename: 'aggregate',
						aggregate: {
							count: length,
							__typename: 'count',
						}
					}
				}
			}
		}
	];
}

describe('<Pagination />', () => {
	it('displays a loading message', async () => {
		const wrapper = mount(
			<MockedProvider mocks={makeMocksFor(1)}>
				<Pagination page={1} />
			</MockedProvider>
    );
    expect(wrapper.text()).toContain('Loading...');
  });
  
  it('renders pagination for 18 items', async () => {
		const wrapper = mount(
			<MockedProvider mocks={makeMocksFor(18)}>
				<Pagination page={1} />
			</MockedProvider>
    );
    await wait();
    wrapper.update();
    const pagination = wrapper.find("[data-test='pagination']");
    expect(wrapper.find('.total-pages').text()).toEqual("5");
    expect(toJSON(pagination)).toMatchSnapshot();
  });
  
  it('disables prev button on the first page', async () => {
    const wrapper = mount(
			<MockedProvider mocks={makeMocksFor(18)}>
				<Pagination page={1} />
			</MockedProvider>
    );
    await wait();
    wrapper.update();
    const prevButton = wrapper.find('.prev');
    const nextButton = wrapper.find('.next');
    expect(prevButton.prop('aria-disabled')).toEqual(true);
    expect(nextButton.prop('aria-disabled')).toEqual(false);
  });

  it('enables next button on the last page', async () => {
    const wrapper = mount(
			<MockedProvider mocks={makeMocksFor(18)}>
				<Pagination page={5} />
			</MockedProvider>
    );
    await wait();
    wrapper.update();
    const prevButton = wrapper.find('.prev');
    const nextButton = wrapper.find('.next');
    expect(prevButton.prop('aria-disabled')).toEqual(false);
    expect(nextButton.prop('aria-disabled')).toEqual(true);
  });

  it('enables all buttons on a middle page', async () => {
    const wrapper = mount(
			<MockedProvider mocks={makeMocksFor(18)}>
				<Pagination page={3} />
			</MockedProvider>
    );
    await wait();
    wrapper.update();
    const prevButton = wrapper.find('.prev');
    const nextButton = wrapper.find('.next');
    expect(prevButton.prop('aria-disabled')).toEqual(false);
    expect(nextButton.prop('aria-disabled')).toEqual(false);
  });
});
